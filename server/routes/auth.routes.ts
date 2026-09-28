import { Router } from 'express';
import {
  registerCustomer,
  registerFarmer,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
} from '../controllers/auth.controller.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/register-customer', registerCustomer);
router.post('/register-farmer', registerFarmer);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
