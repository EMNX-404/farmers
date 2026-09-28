import { Response, NextFunction } from 'express';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Product } from '../models/Product.ts';
import { Order } from '../models/Order.ts';
import { Review } from '../models/Review.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';
import mongoose from 'mongoose';

export async function getFarmers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { market, search, approvalStatus } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = {};

    // Only admins can see non-approved farmers
    if (req.user?.role === 'admin' && approvalStatus) {
      filter.approvalStatus = approvalStatus;
    } else {
      filter.approvalStatus = 'approved';
    }

    if (market && typeof market === 'string') {
      filter.markets = market;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [farmers, total] = await Promise.all([
      FarmerProfile.find(filter)
        .populate('markets', 'name address marketDays operatingHours')
        .populate('user', 'name email contactNumber')
        .sort({ businessName: 1 })
        .skip(skip)
        .limit(limit),
      FarmerProfile.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: farmers,
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

export async function getFarmerById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const farmer = await FarmerProfile.findById(id)
      .populate('markets', 'name address marketDays operatingHours')
      .populate('user', 'name contactNumber');

    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    // Retrieve active products for this farmer
    const products = await Product.find({
      farmer: farmer._id,
      availabilityStatus: { $ne: 'unavailable' },
    }).populate('category', 'name slug');

    // Retrieve recent reviews
    const reviews = await Review.find({
      farmer: farmer._id,
      isModerated: false,
    })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...farmer.toObject(),
        products,
        recentReviews: reviews,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyFarmerProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId })
      .populate('markets', 'name address marketDays operatingHours')
      .populate('user', 'name email contactNumber address');

    if (!farmer) {
      throw new AppError('Farmer profile not found for this account', 404);
    }

    res.status(200).json({
      success: true,
      data: farmer,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFarmerProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      businessName,
      description,
      contactNumber,
      address,
      markets,
      marketDays,
      pickupWindows,
      latitude,
      longitude,
    } = req.body;

    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    if (businessName) farmer.businessName = businessName.trim();
    if (description !== undefined) farmer.description = description.trim();
    if (contactNumber) farmer.contactNumber = contactNumber.trim();
    if (address) farmer.address = address.trim();
    if (Array.isArray(markets)) farmer.markets = markets;
    if (Array.isArray(marketDays)) farmer.marketDays = marketDays;
    if (Array.isArray(pickupWindows)) farmer.pickupWindows = pickupWindows;

    if (typeof longitude === 'number' || typeof latitude === 'number') {
      const currentCoords = farmer.location?.coordinates || [0, 0];
      farmer.location = {
        type: 'Point',
        coordinates: [
          typeof longitude === 'number' ? longitude : currentCoords[0],
          typeof latitude === 'number' ? latitude : currentCoords[1],
        ],
      };
    }

    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      data: farmer,
    });
  } catch (err) {
    next(err);
  }
}

export async function getFarmerAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const farmerId = farmer._id;

    // Aggregate orders by status
    const orderStats = await Order.aggregate([
      { $match: { farmer: farmerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $in: ['$status', ['completed', 'ready', 'accepted']] }, '$totalAmount', 0],
            },
          },
        },
      },
    ]);

    const totalOrders = orderStats.reduce((acc, curr) => acc + curr.count, 0);
    const pendingOrders = orderStats.find((s) => s._id === 'placed')?.count || 0;
    const completedOrders = orderStats.find((s) => s._id === 'completed')?.count || 0;
    const totalRevenue = orderStats.reduce((acc, curr) => acc + curr.totalRevenue, 0);

    // Aggregate best-selling products
    const bestSellers = await Order.aggregate([
      { $match: { farmer: farmerId, status: { $in: ['completed', 'ready', 'accepted'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unit: { $first: '$items.unit' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalProductRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
    ]);

    // Total products in catalog
    const totalProducts = await Product.countDocuments({ farmer: farmerId });

    res.status(200).json({
      success: true,
      data: {
        businessName: farmer.businessName,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProducts,
        ratingAverage: farmer.ratingAverage,
        ratingCount: farmer.ratingCount,
        bestSellers,
        ordersByStatus: orderStats,
      },
    });
  } catch (err) {
    next(err);
  }
}
