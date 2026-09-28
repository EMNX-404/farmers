import { Response, NextFunction } from 'express';
import { Review } from '../models/Review.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Product } from '../models/Product.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';

async function updateRatings(farmerId: any, productId?: any) {
  // Update farmer rating
  const farmerReviews = await Review.find({ farmer: farmerId, isModerated: false });
  const farmerCount = farmerReviews.length;
  const farmerAvg =
    farmerCount > 0
      ? farmerReviews.reduce((sum, r) => sum + r.rating, 0) / farmerCount
      : 0;

  await FarmerProfile.findByIdAndUpdate(farmerId, {
    ratingAverage: Math.round(farmerAvg * 10) / 10,
    ratingCount: farmerCount,
  });

  // Update product rating if applicable
  if (productId) {
    const productReviews = await Review.find({ product: productId, isModerated: false });
    const productCount = productReviews.length;
    const productAvg =
      productCount > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productCount
        : 0;

    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(productAvg * 10) / 10,
      ratingCount: productCount,
    });
  }
}

export async function getReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { farmerId, productId, isModerated } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = {};
    if (req.user?.role === 'admin' && isModerated !== undefined) {
      filter.isModerated = isModerated === 'true';
    } else {
      filter.isModerated = false;
    }

    if (farmerId) filter.farmer = farmerId;
    if (productId) filter.product = productId;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('customer', 'name')
        .populate('product', 'name unit')
        .populate('farmer', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
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

export async function createReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { farmerId, productId, orderId, rating, comment } = req.body;

    if (!farmerId || !rating || !comment) {
      throw new AppError('Farmer ID, rating (1-5), and comment are required', 400);
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      throw new AppError('Rating must be between 1 and 5 stars', 400);
    }

    const farmer = await FarmerProfile.findById(farmerId);
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const review = await Review.create({
      customer: customerId,
      farmer: farmer._id,
      product: productId || undefined,
      order: orderId || undefined,
      rating: ratingNum,
      comment: comment.trim(),
    });

    await updateRatings(farmer._id, productId);

    const populated = await Review.findById(review._id)
      .populate('customer', 'name')
      .populate('product', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function respondToReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || !response.trim()) {
      throw new AppError('Response message is required', 400);
    }

    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const review = await Review.findOne({ _id: id, farmer: farmer._id });
    if (!review) {
      throw new AppError('Review not found or unauthorized', 404);
    }

    review.farmerResponse = {
      comment: response.trim(),
      respondedAt: new Date(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Farmer response posted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
}

export async function moderateReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { isModerated } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    review.isModerated = Boolean(isModerated);
    await review.save();

    await updateRatings(review.farmer, review.product);

    res.status(200).json({
      success: true,
      message: `Review moderation status updated to ${review.isModerated}`,
      data: review,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Only review author or admin can delete
    if (role !== 'admin' && review.customer.toString() !== userId) {
      throw new AppError('Unauthorized to delete this review', 403);
    }

    await review.deleteOne();
    await updateRatings(review.farmer, review.product);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
