import { Router } from 'express';
import {
  getPickupSlots,
  createPickupSlot,
  updatePickupSlot,
  deletePickupSlot,
} from '../controllers/pickupSlot.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', getPickupSlots);

// Farmer configuration
router.post('/', authenticate, authorize('farmer'), createPickupSlot);
router.put('/:id', authenticate, authorize('farmer'), validateObjectId('id'), updatePickupSlot);
router.delete('/:id', authenticate, authorize('farmer'), validateObjectId('id'), deletePickupSlot);

export default router;
