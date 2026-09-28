import { Notification } from '../models/Notification.ts';
import { Types } from 'mongoose';

export async function createNotification(params: {
  userId: string | Types.ObjectId;
  type: 'order_confirmation' | 'order_accepted' | 'order_declined' | 'order_ready' | 'order_completed' | 'announcement' | 'restock_alert';
  title: string;
  message: string;
  relatedId?: string | Types.ObjectId;
}): Promise<void> {
  try {
    await Notification.create({
      user: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedId: params.relatedId,
    });
  } catch (err: any) {
    console.error(`[NotificationService] Failed to create notification: ${err.message}`);
  }
}
