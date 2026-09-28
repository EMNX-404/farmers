import { Response, NextFunction } from 'express';
import { WeeklyInventory } from '../models/WeeklyInventory.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Product } from '../models/Product.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getWeeklyInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { farmerId, productId, date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    // Calculate current week start (Monday) and end (Sunday)
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(targetDate.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const filter: any = {
      isAvailable: true,
      weekStartDate: { $lte: endOfWeek },
      weekEndDate: { $gte: startOfWeek },
    };

    if (farmerId) filter.farmer = farmerId;
    if (productId) filter.product = productId;

    const inventory = await WeeklyInventory.find(filter)
      .populate('product', 'name unit imageUrl category description')
      .populate('farmer', 'businessName ratingAverage');

    res.status(200).json({
      success: true,
      data: inventory,
      meta: {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyWeeklyInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const { date } = req.query;
    const filter: any = { farmer: farmer._id };

    if (date) {
      const d = new Date(date as string);
      filter.weekStartDate = { $lte: d };
      filter.weekEndDate = { $gte: d };
    }

    const items = await WeeklyInventory.find(filter)
      .populate('product', 'name unit price stockQuantity availabilityStatus')
      .sort({ weekStartDate: -1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertWeeklyInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const { productId, weekStartDate, quantity, price, isAvailable } = req.body;

    if (!productId || !weekStartDate || quantity === undefined) {
      throw new AppError('Product ID, week start date, and quantity are required', 400);
    }

    const product = await Product.findOne({ _id: productId, farmer: farmer._id });
    if (!product) {
      throw new AppError('Product not found or not owned by you', 404);
    }

    const start = new Date(weekStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const inventoryItem = await WeeklyInventory.findOneAndUpdate(
      {
        product: product._id,
        farmer: farmer._id,
        weekStartDate: start,
      },
      {
        weekEndDate: end,
        quantity: Number(quantity),
        price: price !== undefined ? Number(price) : product.price,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate('product', 'name unit price');

    res.status(200).json({
      success: true,
      message: 'Weekly inventory updated successfully',
      data: inventoryItem,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteWeeklyInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const item = await WeeklyInventory.findOneAndDelete({ _id: id, farmer: farmer._id });
    if (!item) {
      throw new AppError('Inventory item not found or unauthorized', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Weekly inventory item removed',
    });
  } catch (err) {
    next(err);
  }
}
