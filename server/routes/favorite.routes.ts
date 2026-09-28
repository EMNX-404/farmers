import { Router } from 'express';
import {
  getFavorites,
  toggleFavoriteFarmer,
  toggleFavoriteProduct,
  toggleFavoriteMarket,
  updateAlertPreference,
} from '../controllers/favorite.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate, authorize('customer'));

router.get('/', getFavorites);
router.post('/farmer', toggleFavoriteFarmer);
router.post('/product', toggleFavoriteProduct);
router.post('/market', toggleFavoriteMarket);
router.put('/alerts', updateAlertPreference);

export default router;
