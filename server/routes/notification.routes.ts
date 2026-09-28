import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller.ts';
import { authenticate } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', validateObjectId('id'), markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
