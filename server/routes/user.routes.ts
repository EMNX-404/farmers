import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from '../controllers/user.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', validateObjectId('id'), getUserById);
router.put('/:id/status', authorize('admin'), validateObjectId('id'), updateUserStatus);
router.delete('/:id', authorize('admin'), validateObjectId('id'), deleteUser);

export default router;
