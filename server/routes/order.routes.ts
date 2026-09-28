import { Router } from 'express';
import {
  createPreOrder,
  getAllOrders,
  getCustomerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  reorder,
} from '../controllers/order.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.use(authenticate);

router.post('/', authorize('customer'), createPreOrder);
router.get('/', authorize('admin'), getAllOrders);
router.get('/customer', authorize('customer'), getCustomerOrders);
router.get('/farmer', authorize('farmer'), getFarmerOrders);
router.get('/:id', validateObjectId('id'), getOrderById);
router.patch('/:id/status', validateObjectId('id'), updateOrderStatus);
router.post('/:id/cancel', validateObjectId('id'), cancelOrder);
router.post('/:id/reorder', authorize('customer'), validateObjectId('id'), reorder);

export default router;
