import { Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';

export async function getUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { role, status, search } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('farmerProfile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Users can only view themselves unless they are admin
    if (req.user!.role !== 'admin' && req.user!.userId !== id) {
      throw new AppError('Unauthorized to access this user profile', 403);
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('farmerProfile');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      throw new AppError('Invalid status. Must be active, suspended, or deactivated', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status successfully updated to '${status}'`,
      data: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Set status to deactivated
    user.status = 'deactivated';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account has been deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}
