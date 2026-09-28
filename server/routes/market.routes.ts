import { Router } from 'express';
import {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
  associateFarmerWithMarket,
} from '../controllers/market.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', getMarkets);
router.get('/:id', validateObjectId('id'), getMarketById);

// Admin market management
router.post('/', authenticate, authorize('admin'), createMarket);
router.put('/:id', authenticate, authorize('admin'), validateObjectId('id'), updateMarket);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId('id'), deleteMarket);

// Farmer association
router.post(
  '/:id/associate',
  authenticate,
  authorize('farmer'),
  validateObjectId('id'),
  associateFarmerWithMarket
);

export default router;
