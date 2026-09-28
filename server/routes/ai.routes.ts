import { Router } from 'express';
import { handleAIChat } from '../controllers/ai.controller.ts';

const router = Router();

router.post('/chat', handleAIChat);

export default router;
