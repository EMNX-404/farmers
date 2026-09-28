import mongoose from 'mongoose';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { MongoMemoryServer, MongoBinary } from 'mongodb-memory-server';
import { config } from './env.ts';

let mongoMemoryServer: MongoMemoryServer | null = null;
let localMongodProcess: ChildProcess | null = null;

// Global Mongoose configuration
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false); // Fail fast instead of hanging when database is offline

mongoose.connection.on('connected', () => {
  console.log(`[Database] Mongoose connected to database "${mongoose.connection.name}" at ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database] Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose disconnected.');
});

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseInfo(): {
  status: string;
  host: string;
  databaseName: string;
  isPersistent: boolean;
  maskedUri: string;
} {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isConfigured = Boolean(config.mongodbUri && config.mongodbUri.trim() !== '');
  const raw = config.mongodbUri?.trim() || '';
  const maskedUri = raw ? raw.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@') : 'embedded-in-memory';

  return {
    status: stateMap[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || 'localhost',
    databaseName: mongoose.connection.name || 'marketlink',
    isPersistent: isConfigured,
    maskedUri,
  };
}

function checkPortListening(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function tryStartLocalPersistentMongod(port = 27017): Promise<boolean> {
  const isListening = await checkPortListening(port);
  if (isListening) {
    console.log(`[Database] Local MongoDB service detected and active on port ${port}.`);
    return true;
  }

  try {
    const dataDir = path.resolve(process.cwd(), '.data', 'db');
    fs.mkdirSync(dataDir, { recursive: true });

    const binaryPath = await MongoBinary.getPath({});
    console.log(`[Database] Starting persistent local MongoDB daemon on port ${port}...`);

    localMongodProcess = spawn(binaryPath, [
      '--dbpath', dataDir,
      '--port', String(port),
      '--bind_ip', '127.0.0.1',
    ], {
      stdio: 'ignore',
      detached: true,
    });

    localMongodProcess.unref();

    for (let attempt = 1; attempt <= 20; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await checkPortListening(port)) {
        console.log(`[Database] Persistent local MongoDB daemon is now ready on port ${port} (data in ${dataDir}).`);
        return true;
      }
    }
    return false;
  } catch (err: any) {
    console.warn(`[Database] Notice: Auto-start of local mongod skipped (${err.message}). Connecting to standard local MongoDB service...`);
    return false;
  }
}

export async function connectDatabase(): Promise<void> {
  const isConfiguredUri = Boolean(config.mongodbUri && config.mongodbUri.trim() !== '');

  // 1. When MONGODB_URI is provided, connect directly to persistent MongoDB.
  // CRITICAL REQUIREMENT: Do NOT fallback to in-memory when MONGODB_URI is configured.
  if (isConfiguredUri) {
    const rawUri = config.mongodbUri.trim();
    const maskedUri = rawUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    console.log(`[Database] Connecting to persistent local MongoDB at ${maskedUri}...`);

    // If configured URI targets localhost on port 27017, verify or auto-start local mongod if needed
    if (rawUri.includes('localhost:27017') || rawUri.includes('127.0.0.1:27017')) {
      await tryStartLocalPersistentMongod(27017);
    }

    try {
      await mongoose.connect(rawUri, {
        dbName: 'marketlink', // Ensure all collections are created in 'marketlink' database
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        autoIndex: true, // Automatically build all schema indexes on startup
      });
      console.log(`[Database] Successfully connected to persistent MongoDB database [${mongoose.connection.name}].`);
      return;
    } catch (err: any) {
      console.error(`[Database] FATAL: Failed to connect to persistent MongoDB (${maskedUri}): ${err.message}`);
      // Throw immediately with clear local setup instructions. Do NOT use in-memory fallback.
      throw new Error(
        `[Database Error] Could not connect to persistent MongoDB at ${maskedUri}.\n` +
        `If running locally on your computer, please ensure MongoDB is running:\n` +
        `  • macOS (Homebrew):   brew services start mongodb-community\n` +
        `  • Linux (systemd):    sudo systemctl start mongod\n` +
        `  • Windows:            net start MongoDB\n` +
        `  • Docker:             docker run -d -p 27017:27017 --name marketlink-mongo mongo:latest\n` +
        `Error details: ${err.message}`
      );
    }
  }

  // 2. In production, MONGODB_URI is mandatory
  if (config.nodeEnv === 'production') {
    throw new Error('[Database Error] MONGODB_URI environment variable is required in production.');
  }

  // 3. Fallback only applies when MONGODB_URI is explicitly blank/omitted
  try {
    console.log('[Database] MONGODB_URI not provided. Starting temporary development database...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri, {
      dbName: 'marketlink',
      autoIndex: true,
    });
    console.log(`[Database] Development database connected at ${uri}`);
  } catch (err: any) {
    console.warn(`[Database] Notice: Temporary in-memory MongoDB daemon could not be started: ${err.message}`);
    console.warn('[Database] Operating with resilient error-handled fallbacks.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    if (localMongodProcess) {
      localMongodProcess.kill();
      localMongodProcess = null;
    }
    console.log('[Database] Disconnected from MongoDB.');
  } catch (err: any) {
    console.error(`[Database] Error disconnecting from MongoDB: ${err.message}`);
  }
}
