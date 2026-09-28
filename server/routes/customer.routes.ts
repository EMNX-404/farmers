import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller.ts';
import { getCustomerOrders } from '../controllers/order.controller.ts';
import { getFavorites } from '../controllers/favorite.controller.ts';
import { getCart } from '../controllers/cart.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.use(authenticate);

// Customer self actions
router.get('/orders', authorize('customer'), getCustomerOrders);
router.get('/favorites', authorize('customer'), getFavorites);
router.get('/cart', authorize('customer'), getCart);

// Admin customer management
router.get(
  '/',
  authorize('admin'),
  (req, res, next) => {
    req.query.role = 'customer';
    next();
  },
  getUsers
);

router.get('/:id', authorize('admin'), validateObjectId('id'), getUserById);

export default router;
