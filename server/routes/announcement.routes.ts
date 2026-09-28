import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.ts';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', optionalAuthenticate, getAnnouncements);
router.post('/', authenticate, authorize('admin'), createAnnouncement);
router.put('/:id', authenticate, authorize('admin'), validateObjectId('id'), updateAnnouncement);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId('id'), deleteAnnouncement);

export default router;
