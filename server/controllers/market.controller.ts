import { Response, NextFunction } from 'express';
import { Market } from '../models/Market.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';

export async function getMarkets(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { day, status, search } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = {};

    // By default, public users only see active markets
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'active';
    }

    if (day && typeof day === 'string') {
      filter.marketDays = { $regex: new RegExp(`^${day}$`, 'i') };
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [markets, total] = await Promise.all([
      Market.find(filter)
        .populate({
          path: 'associatedFarmers',
          select: 'businessName contactNumber ratingAverage ratingCount approvalStatus',
          match: { approvalStatus: 'approved' },
        })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Market.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: markets,
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

export async function getMarketById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const market = await Market.findById(id).populate({
      path: 'associatedFarmers',
      select: 'businessName contactNumber address ratingAverage ratingCount marketDays pickupWindows approvalStatus',
      match: { approvalStatus: 'approved' },
    });

    if (!market) {
      throw new AppError('Market not found', 404);
    }

    res.status(200).json({
      success: true,
      data: market,
    });
  } catch (err) {
    next(err);
  }
}

export async function createMarket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      marketDays,
      operatingHours,
      imageUrl,
    } = req.body;

    if (!name || !address || !marketDays || !operatingHours) {
      throw new AppError('Name, address, market days, and operating hours are required', 400);
    }

    const coordinates: [number, number] = [
      typeof longitude === 'number' ? longitude : 0,
      typeof latitude === 'number' ? latitude : 0,
    ];

    const market = await Market.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      address: address.trim(),
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      zipCode: zipCode ? zipCode.trim() : '',
      location: {
        type: 'Point',
        coordinates,
      },
      marketDays: Array.isArray(marketDays) ? marketDays : [marketDays],
      operatingHours: operatingHours.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : '',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Market created successfully',
      data: market,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMarket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      marketDays,
      operatingHours,
      status,
      imageUrl,
    } = req.body;

    const market = await Market.findById(id);
    if (!market) {
      throw new AppError('Market not found', 404);
    }

    if (name) market.name = name.trim();
    if (description !== undefined) market.description = description.trim();
    if (address) market.address = address.trim();
    if (city !== undefined) market.city = city.trim();
    if (state !== undefined) market.state = state.trim();
    if (zipCode !== undefined) market.zipCode = zipCode.trim();
    if (operatingHours) market.operatingHours = operatingHours.trim();
    if (status) market.status = status;
    if (imageUrl !== undefined) market.imageUrl = imageUrl.trim();

    if (Array.isArray(marketDays)) {
      market.marketDays = marketDays;
    }

    if (typeof longitude === 'number' || typeof latitude === 'number') {
      const currentCoords = market.location?.coordinates || [0, 0];
      market.location = {
        type: 'Point',
        coordinates: [
          typeof longitude === 'number' ? longitude : currentCoords[0],
          typeof latitude === 'number' ? latitude : currentCoords[1],
        ],
      };
    }

    await market.save();

    res.status(200).json({
      success: true,
      message: 'Market updated successfully',
      data: market,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMarket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const market = await Market.findById(id);
    if (!market) {
      throw new AppError('Market not found', 404);
    }

    // Set to inactive
    market.status = 'inactive';
    await market.save();

    res.status(200).json({
      success: true,
      message: 'Market set to inactive successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function associateFarmerWithMarket(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params; // market id
    const { action } = req.body; // 'join' or 'leave'

    const farmerProfile = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmerProfile) {
      throw new AppError('Farmer profile not found for this user', 404);
    }

    const market = await Market.findById(id);
    if (!market) {
      throw new AppError('Market not found', 404);
    }

    if (action === 'leave') {
      // Remove from market
      market.associatedFarmers = market.associatedFarmers.filter(
        (f) => f.toString() !== farmerProfile._id.toString()
      );
      farmerProfile.markets = farmerProfile.markets.filter(
        (m) => m.toString() !== market._id.toString()
      );
    } else {
      // Join market
      if (!market.associatedFarmers.some((f) => f.toString() === farmerProfile._id.toString())) {
        market.associatedFarmers.push(farmerProfile._id);
      }
      if (!farmerProfile.markets.some((m) => m.toString() === market._id.toString())) {
        farmerProfile.markets.push(market._id);
      }
    }

    await Promise.all([market.save(), farmerProfile.save()]);

    res.status(200).json({
      success: true,
      message: `Farmer successfully ${action === 'leave' ? 'removed from' : 'associated with'} market`,
      data: {
        marketId: market._id,
        farmerId: farmerProfile._id,
        associatedMarkets: farmerProfile.markets,
      },
    });
  } catch (err) {
    next(err);
  }
}
