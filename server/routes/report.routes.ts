import { Router } from 'express';
import { getPlatformReports } from '../controllers/report.controller.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getPlatformReports);
router.get('/platform', getPlatformReports);

export default router;
