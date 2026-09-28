import { Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Market } from '../models/Market.ts';
import { Product } from '../models/Product.ts';
import { Order } from '../models/Order.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getDashboardStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalCustomers,
      totalFarmers,
      pendingFarmers,
      totalMarkets,
      totalProducts,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      FarmerProfile.countDocuments(),
      FarmerProfile.countDocuments({ approvalStatus: 'pending' }),
      Market.countDocuments({ status: 'active' }),
      Product.countDocuments({ availabilityStatus: { $ne: 'unavailable' } }),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            volume: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const totalOrders = ordersByStatus.reduce((acc, curr) => acc + curr.count, 0);
    const totalPlatformVolume = ordersByStatus
      .filter((s) => ['completed', 'ready', 'accepted'].includes(s._id))
      .reduce((acc, curr) => acc + curr.volume, 0);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalFarmers,
        pendingFarmersApproval: pendingFarmers,
        totalActiveMarkets: totalMarkets,
        totalActiveProducts: totalProducts,
        totalOrders,
        totalPlatformVolume: Math.round(totalPlatformVolume * 100) / 100,
        ordersBreakdown: ordersByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveFarmer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const farmer = await FarmerProfile.findById(id).populate('user', 'email name');
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    farmer.approvalStatus = 'approved';
    await farmer.save();

    res.status(200).json({
      success: true,
      message: `Farmer "${farmer.businessName}" has been approved successfully`,
      data: farmer,
    });
  } catch (err) {
    next(err);
  }
}

export async function suspendFarmer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const farmer = await FarmerProfile.findById(id);
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    farmer.approvalStatus = 'suspended';
    await farmer.save();

    res.status(200).json({
      success: true,
      message: `Farmer "${farmer.businessName}" has been suspended`,
      data: { farmer, reason },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleCustomerStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      throw new AppError('Status must be active, suspended, or deactivated', 400);
    }

    const user = await User.findOne({ _id: id, role: 'customer' });
    if (!user) {
      throw new AppError('Customer not found', 404);
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Customer account status updated to '${status}'`,
      data: { id: user._id, email: user.email, status: user.status },
    });
  } catch (err) {
    next(err);
  }
}
