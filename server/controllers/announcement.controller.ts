import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getAnnouncements(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const role = req.user?.role || 'customer';
    const filter: any = { isPublished: true };

    if (role !== 'admin') {
      filter.$or = [{ targetRole: 'all' }, { targetRole: role }];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorId = req.user!.userId;
    const { title, content, targetRole, isPublished } = req.body;

    if (!title || !content) {
      throw new AppError('Title and content are required', 400);
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      author: authorId,
      targetRole: targetRole || 'all',
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      publishedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { title, content, targetRole, isPublished } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (targetRole) announcement.targetRole = targetRole;
    if (isPublished !== undefined) announcement.isPublished = Boolean(isPublished);

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
