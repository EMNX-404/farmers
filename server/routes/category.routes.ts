import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', getCategories);
router.get('/:id', validateObjectId('id'), getCategoryById);

// Admin Category Management
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/:id', authenticate, authorize('admin'), validateObjectId('id'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId('id'), deleteCategory);

export default router;
