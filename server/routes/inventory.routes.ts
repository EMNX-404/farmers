import { Router } from 'express';
import {
  getWeeklyInventory,
  getMyWeeklyInventory,
  upsertWeeklyInventory,
  deleteWeeklyInventory,
} from '../controllers/inventory.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', getWeeklyInventory);
router.get('/my-inventory', authenticate, authorize('farmer'), getMyWeeklyInventory);
router.post('/', authenticate, authorize('farmer'), upsertWeeklyInventory);
router.delete('/:id', authenticate, authorize('farmer'), validateObjectId('id'), deleteWeeklyInventory);

export default router;
