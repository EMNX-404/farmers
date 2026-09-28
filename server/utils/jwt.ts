import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.ts';
import { AuthUserPayload } from '../types/index.ts';

export function generateToken(payload: AuthUserPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function verifyToken(token: string): AuthUserPayload {
  return jwt.verify(token, config.jwtSecret) as AuthUserPayload;
}

