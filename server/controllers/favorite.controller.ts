import { Response, NextFunction } from 'express';
import { Favorite } from '../models/Favorite.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getFavorites(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;

    let favorite = await Favorite.findOne({ customer: customerId })
      .populate('favoriteFarmers', 'businessName ratingAverage ratingCount marketDays')
      .populate('favoriteProducts', 'name price unit stockQuantity availabilityStatus imageUrl')
      .populate('favoriteMarkets', 'name address marketDays operatingHours');

    if (!favorite) {
      favorite = await Favorite.create({
        customer: customerId,
        favoriteFarmers: [],
        favoriteProducts: [],
        favoriteMarkets: [],
        restockAlertsEnabled: true,
      });
    }

    res.status(200).json({
      success: true,
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavoriteFarmer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { farmerId } = req.body;

    if (!farmerId) {
      throw new AppError('Farmer ID is required', 400);
    }

    let favorite = await Favorite.findOne({ customer: customerId });
    if (!favorite) {
      favorite = await Favorite.create({ customer: customerId });
    }

    const index = favorite.favoriteFarmers.findIndex((f) => f.toString() === farmerId);
    let isFavorited = false;

    if (index > -1) {
      favorite.favoriteFarmers.splice(index, 1);
      isFavorited = false;
    } else {
      favorite.favoriteFarmers.push(farmerId);
      isFavorited = true;
    }

    await favorite.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Farmer added to favorites' : 'Farmer removed from favorites',
      data: { isFavorited, favoriteFarmers: favorite.favoriteFarmers },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavoriteProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { productId } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    let favorite = await Favorite.findOne({ customer: customerId });
    if (!favorite) {
      favorite = await Favorite.create({ customer: customerId });
    }

    const index = favorite.favoriteProducts.findIndex((p) => p.toString() === productId);
    let isFavorited = false;

    if (index > -1) {
      favorite.favoriteProducts.splice(index, 1);
      isFavorited = false;
    } else {
      favorite.favoriteProducts.push(productId);
      isFavorited = true;
    }

    await favorite.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Product added to favorites' : 'Product removed from favorites',
      data: { isFavorited, favoriteProducts: favorite.favoriteProducts },
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleFavoriteMarket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { marketId } = req.body;

    if (!marketId) {
      throw new AppError('Market ID is required', 400);
    }

    let favorite = await Favorite.findOne({ customer: customerId });
    if (!favorite) {
      favorite = await Favorite.create({ customer: customerId });
    }

    const index = favorite.favoriteMarkets.findIndex((m) => m.toString() === marketId);
    let isFavorited = false;

    if (index > -1) {
      favorite.favoriteMarkets.splice(index, 1);
      isFavorited = false;
    } else {
      favorite.favoriteMarkets.push(marketId);
      isFavorited = true;
    }

    await favorite.save();

    res.status(200).json({
      success: true,
      message: isFavorited ? 'Market saved to favorites' : 'Market removed from favorites',
      data: { isFavorited, favoriteMarkets: favorite.favoriteMarkets },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAlertPreference(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { restockAlertsEnabled } = req.body;

    const favorite = await Favorite.findOneAndUpdate(
      { customer: customerId },
      { restockAlertsEnabled: Boolean(restockAlertsEnabled) },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Restock alert preferences updated',
      data: favorite,
    });
  } catch (err) {
    next(err);
  }
}
