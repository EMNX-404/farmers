import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import { AuthenticatedRequest, UserRole } from '../types/index.ts';
import { User } from '../models/User.ts';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required. Format: Bearer <token>',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing',
      });
      return;
    }

    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('status role farmerProfile');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found',
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
      return;
    }

    if (user.status === 'deactivated') {
      res.status(403).json({
        success: false,
        message: 'This account has been deactivated.',
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      email: decoded.email,
      role: user.role,
      farmerProfileId: user.farmerProfile ? user.farmerProfile.toString() : undefined,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
}

export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('status role farmerProfile');
    if (user && user.status === 'active') {
      req.user = {
        userId: user._id.toString(),
        email: decoded.email,
        role: user.role,
        farmerProfileId: user.farmerProfile ? user.farmerProfile.toString() : undefined,
      };
    }
  } catch {
    // Ignore invalid optional token
  }

  next();
}
