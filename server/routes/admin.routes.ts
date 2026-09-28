import { Router } from 'express';
import {
  getDashboardStats,
  approveFarmer,
  suspendFarmer,
  toggleCustomerStatus,
} from '../controllers/admin.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/farmers/:id/approve', validateObjectId('id'), approveFarmer);
router.post('/farmers/:id/suspend', validateObjectId('id'), suspendFarmer);
router.put('/customers/:id/status', validateObjectId('id'), toggleCustomerStatus);

export default router;
