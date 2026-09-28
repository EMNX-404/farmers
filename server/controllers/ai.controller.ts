import { Request, Response, NextFunction } from 'express';
import { askMarketLinkAssistant } from '../services/ai/ai.service.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function handleAIChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new AppError('Message is required and must be a non-empty string', 400);
    }

    const aiResponse = await askMarketLinkAssistant({
      message: message.trim(),
      conversationHistory,
    });

    res.status(200).json(aiResponse);
  } catch (err) {
    next(err);
  }
}
