import { Router } from 'express';
import {
  getMapConfig,
  getFarmerMapLocations,
  getNearbyLocations,
  updateMyFarmLocation,
} from '../controllers/map.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

// Public Map Configuration & Coordinates
router.get('/config', getMapConfig);
router.get('/farmers', getFarmerMapLocations);
router.get('/nearby', getNearbyLocations);

// Authenticated Vendor / Farmer update farm pin on map
router.patch('/my-location', authenticate, authorize('farmer'), updateMyFarmLocation);

export default router;
