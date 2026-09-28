import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  updateProductStockAndStatus,
  deleteProduct,
} from '../controllers/product.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', getProducts);
router.get('/my-products', authenticate, authorize('farmer'), getMyProducts);
router.get('/:id', validateObjectId('id'), getProductById);

// Farmer product management
router.post('/', authenticate, authorize('farmer'), createProduct);
router.put('/:id', authenticate, authorize('farmer'), validateObjectId('id'), updateProduct);
router.patch(
  '/:id/stock',
  authenticate,
  authorize('farmer'),
  validateObjectId('id'),
  updateProductStockAndStatus
);
router.delete('/:id', authenticate, authorize('farmer', 'admin'), validateObjectId('id'), deleteProduct);

export default router;
