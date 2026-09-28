import { Router } from 'express';
import {
  getFarmers,
  getFarmerById,
  getMyFarmerProfile,
  updateFarmerProfile,
  getFarmerAnalytics,
} from '../controllers/farmer.controller.ts';
import {
  getFarmerMapLocations,
  getNearbyLocations,
  updateMyFarmLocation,
} from '../controllers/map.controller.ts';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

// Public / optional auth
router.get('/', optionalAuthenticate, getFarmers);

// Map and Geolocation endpoints for vendor exploration
router.get('/locations', getFarmerMapLocations);
router.get('/nearby', getNearbyLocations);

// Farmer authenticated routes
router.get('/me', authenticate, authorize('farmer'), getMyFarmerProfile);
router.put('/me', authenticate, authorize('farmer'), updateFarmerProfile);
router.patch('/me/location', authenticate, authorize('farmer'), updateMyFarmLocation);
router.get('/analytics', authenticate, authorize('farmer'), getFarmerAnalytics);

// Public farmer details
router.get('/:id', validateObjectId('id'), getFarmerById);

export default router;
