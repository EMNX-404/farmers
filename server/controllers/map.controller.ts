import { Response, NextFunction } from 'express';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Market } from '../models/Market.ts';
import { Product } from '../models/Product.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { config } from '../config/env.ts';

// Haversine formula to compute distance between two coords in km
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getMapConfig(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      data: {
        apiKey: config.googleMapsApiKey,
        defaultCenter: {
          lat: 44.05,
          lng: -123.04,
        },
        defaultZoom: 12,
        cityRegion: 'Springfield / Willamette Valley, OR',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFarmerMapLocations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { marketId, search } = req.query;

    const filter: any = {
      approvalStatus: 'approved',
      'location.coordinates': { $ne: [0, 0] },
    };

    if (marketId && typeof marketId === 'string') {
      filter.markets = marketId;
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const farmers = await FarmerProfile.find(filter)
      .populate('markets', 'name address city state zipCode location operatingHours marketDays')
      .populate('user', 'name contactNumber')
      .sort({ businessName: 1 });

    // Fetch active product counts for each farmer
    const farmerIds = farmers.map((f) => f._id);
    const productCounts = await Product.aggregate([
      { $match: { farmer: { $in: farmerIds }, availabilityStatus: { $ne: 'unavailable' } } },
      { $group: { _id: '$farmer', count: { $sum: 1 } } },
    ]);

    const productCountMap = new Map(productCounts.map((p) => [p._id.toString(), p.count]));

    const markers = farmers.map((farmer) => {
      const coords = farmer.location?.coordinates || [0, 0];
      const lng = coords[0];
      const lat = coords[1];

      return {
        id: farmer._id,
        type: 'farmer',
        businessName: farmer.businessName,
        farmerName: (farmer.user as any)?.name || 'Local Farmer',
        address: farmer.address,
        contactNumber: farmer.contactNumber,
        description: farmer.description,
        ratingAverage: farmer.ratingAverage,
        ratingCount: farmer.ratingCount,
        productCount: productCountMap.get(farmer._id.toString()) || 0,
        marketDays: farmer.marketDays,
        pickupWindows: farmer.pickupWindows,
        coordinates: { lat, lng },
        markets: farmer.markets,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      };
    });

    res.status(200).json({
      success: true,
      count: markers.length,
      data: markers,
    });
  } catch (err) {
    next(err);
  }
}

export async function getNearbyLocations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat((req.query.radiusKm as string) || '50');
    const type = (req.query.type as string) || 'all'; // 'farmers' | 'markets' | 'all'

    if (isNaN(lat) || isNaN(lng)) {
      throw new AppError('Valid lat and lng query parameters are required', 400);
    }

    const maxDistanceMeters = radiusKm * 1000;
    const geoQuery = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    const results: any[] = [];

    // Query nearby farmers
    if (type === 'all' || type === 'farmers') {
      const farmers = await FarmerProfile.find({
        approvalStatus: 'approved',
        ...geoQuery,
      })
        .populate('markets', 'name address location marketDays')
        .limit(25);

      for (const f of farmers) {
        const coords = f.location?.coordinates || [0, 0];
        const fLng = coords[0];
        const fLat = coords[1];
        const distanceKm = calculateHaversineDistanceKm(lat, lng, fLat, fLng);
        const distanceMiles = Math.round(distanceKm * 0.621371 * 10) / 10;

        results.push({
          id: f._id,
          entityType: 'farmer',
          name: f.businessName,
          address: f.address,
          description: f.description,
          rating: f.ratingAverage,
          ratingCount: f.ratingCount,
          contactNumber: f.contactNumber,
          coordinates: { lat: fLat, lng: fLng },
          distanceKm,
          distanceMiles,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${fLat},${fLng}`,
        });
      }
    }

    // Query nearby markets
    if (type === 'all' || type === 'markets') {
      const markets = await Market.find({
        status: 'active',
        ...geoQuery,
      }).limit(15);

      for (const m of markets) {
        const coords = m.location?.coordinates || [0, 0];
        const mLng = coords[0];
        const mLat = coords[1];
        const distanceKm = calculateHaversineDistanceKm(lat, lng, mLat, mLng);
        const distanceMiles = Math.round(distanceKm * 0.621371 * 10) / 10;

        results.push({
          id: m._id,
          entityType: 'market',
          name: m.name,
          address: `${m.address}, ${m.city}, ${m.state} ${m.zipCode}`.trim(),
          description: m.description,
          marketDays: m.marketDays,
          operatingHours: m.operatingHours,
          coordinates: { lat: mLat, lng: mLng },
          distanceKm,
          distanceMiles,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${mLat},${mLng}`,
        });
      }
    }

    // Sort combined results by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      center: { lat, lng },
      radiusKm,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyFarmLocation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { latitude, longitude, farmAddress } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new AppError('Valid latitude and longitude numbers are required', 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new AppError('Coordinates out of range (-90 to 90 for lat, -180 to 180 for lng)', 400);
    }

    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found for authenticated user', 404);
    }

    farmer.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    if (farmAddress && typeof farmAddress === 'string') {
      farmer.address = farmAddress.trim();
    }

    await farmer.save();

    res.status(200).json({
      success: true,
      message: 'Farm location coordinates successfully updated on Google Maps',
      data: {
        id: farmer._id,
        businessName: farmer.businessName,
        address: farmer.address,
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
