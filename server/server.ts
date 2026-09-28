import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { config } from './config/env.ts';
import { connectDatabase } from './config/db.ts';
import { seedDevelopmentData } from './utils/seedData.ts';
import apiRoutes from './routes/index.ts';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.ts';

export async function createApp() {
  const app = express();

  // Basic Middleware
  app.use(
    cors({
      origin: config.clientUrl === '*' ? true : [config.clientUrl],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API root info
  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'MarketLink REST API',
      version: '1.0.0',
      description: 'Backend platform for local farmers-market pre-orders, inventory, and Gemini AI assistant',
      documentation: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        customers: '/api/customers',
        farmers: '/api/farmers',
        markets: '/api/markets',
        products: '/api/products',
        categories: '/api/categories',
        inventory: '/api/inventory',
        cart: '/api/cart',
        orders: '/api/orders',
        pickupSlots: '/api/pickup-slots',
        favorites: '/api/favorites',
        reviews: '/api/reviews',
        notifications: '/api/notifications',
        admin: '/api/admin',
        reports: '/api/reports',
        announcements: '/api/announcements',
        aiChat: 'POST /api/ai/chat',
      },
    });
  });

  // Mount all API routes
  app.use('/api', apiRoutes);

  return app;
}

export async function startServer() {
  try {
    // 1. Initialize MongoDB connection
    await connectDatabase();

    // 2. Seed development records if database is empty
    try {
      await seedDevelopmentData();
    } catch (seedErr: any) {
      console.warn(`[Seed] Notice: Initial database seed skipped (${seedErr.message}).`);
    }

    // 3. Create Express App
    const app = await createApp();

    // 4. Attach Vite middlewares for dev server previews in AI Studio
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // In production, serve built client assets from dist
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response, next: any) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
      app.use('/api/*', notFoundHandler);
    }

    // Centralized Error Handler
    app.use(errorHandler);

    // 5. Start listening on port 3000
    const PORT = config.port || 3000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=================================================`);
      console.log(`🌿 MarketLink Backend Server running on port ${PORT}`);
      console.log(`📡 REST API Base: http://0.0.0.0:${PORT}/api`);
      console.log(`🤖 AI Assistant: http://0.0.0.0:${PORT}/api/ai/chat`);
      console.log(`🩺 Health check: http://0.0.0.0:${PORT}/api/health`);
      console.log(`=================================================`);
    });

    return { app, server };
  } catch (err: any) {
    console.error(`[Server Fatal Error]: ${err.message}`);
    process.exit(1);
  }
}

// Start if run directly
startServer();
