import { Response, NextFunction } from 'express';
import { Order } from '../models/Order.ts';
import { Market } from '../models/Market.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { AuthenticatedRequest } from '../types/index.ts';

export async function getPlatformReports(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 30-day order trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orderCount: { $sum: 1 },
          volume: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Popular categories / products overall
    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'ready', 'accepted'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 },
    ]);

    // Active markets ranking by pre-orders
    const marketPerformance = await Order.aggregate([
      {
        $group: {
          _id: '$market',
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'markets',
          localField: '_id',
          foreignField: '_id',
          as: 'marketDetails',
        },
      },
      { $unwind: '$marketDetails' },
      {
        $project: {
          marketId: '$_id',
          marketName: '$marketDetails.name',
          city: '$marketDetails.city',
          totalOrders: 1,
          totalSales: { $round: ['$totalSales', 2] },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyTrends: dailyOrders,
        topProducts,
        marketPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
}
