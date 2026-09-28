import { Router } from 'express';
import {
  getReviews,
  createReview,
  respondToReview,
  moderateReview,
  deleteReview,
} from '../controllers/review.controller.ts';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.ts';
import { validateObjectId } from '../middleware/validation.ts';

const router = Router();

router.get('/', optionalAuthenticate, getReviews);
router.post('/', authenticate, authorize('customer'), createReview);
router.post(
  '/:id/respond',
  authenticate,
  authorize('farmer'),
  validateObjectId('id'),
  respondToReview
);
router.patch(
  '/:id/moderate',
  authenticate,
  authorize('admin'),
  validateObjectId('id'),
  moderateReview
);
router.delete('/:id', authenticate, validateObjectId('id'), deleteReview);

export default router;
