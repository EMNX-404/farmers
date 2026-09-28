import { Response, NextFunction } from 'express';
import { PickupSlot } from '../models/PickupSlot.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getPickupSlots(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { farmerId, marketId, date } = req.query;

    const filter: any = { isAvailable: true };

    if (farmerId) filter.farmer = farmerId;
    if (marketId) filter.market = marketId;

    if (date) {
      const d = new Date(date as string);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.pickupDate = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Return slots from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.pickupDate = { $gte: today };
    }

    const slots = await PickupSlot.find(filter)
      .populate('market', 'name address operatingHours')
      .populate('farmer', 'businessName')
      .sort({ pickupDate: 1, startTime: 1 });

    // Filter out slots that have passed their cutoff or capacity
    const now = new Date();
    const availableSlots = slots.filter((slot) => {
      if (slot.bookedCount >= slot.slotCapacity) return false;
      const slotDateTime = new Date(slot.pickupDate);
      const [hours, minutes] = slot.startTime.split(':').map(Number);
      slotDateTime.setHours(hours, minutes, 0, 0);
      const cutoffTime = new Date(slotDateTime.getTime() - slot.cutoffHours * 60 * 60 * 1000);
      return now < cutoffTime;
    });

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (err) {
    next(err);
  }
}

export async function createPickupSlot(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const { marketId, pickupDate, dayOfWeek, startTime, endTime, slotCapacity, cutoffHours } =
      req.body;

    if (!marketId || !pickupDate || !dayOfWeek || !startTime || !endTime) {
      throw new AppError('Market, pickup date, day of week, start time, and end time are required', 400);
    }

    const slot = await PickupSlot.create({
      farmer: farmer._id,
      market: marketId,
      pickupDate: new Date(pickupDate),
      dayOfWeek: dayOfWeek.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      slotCapacity: slotCapacity ? Number(slotCapacity) : 20,
      cutoffHours: cutoffHours ? Number(cutoffHours) : 12,
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: 'Pickup slot created successfully',
      data: slot,
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePickupSlot(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const slot = await PickupSlot.findOne({ _id: id, farmer: farmer._id });
    if (!slot) {
      throw new AppError('Pickup slot not found or unauthorized', 404);
    }

    const { startTime, endTime, slotCapacity, cutoffHours, isAvailable } = req.body;

    if (startTime) slot.startTime = startTime.trim();
    if (endTime) slot.endTime = endTime.trim();
    if (slotCapacity !== undefined) slot.slotCapacity = Number(slotCapacity);
    if (cutoffHours !== undefined) slot.cutoffHours = Number(cutoffHours);
    if (isAvailable !== undefined) slot.isAvailable = Boolean(isAvailable);

    await slot.save();

    res.status(200).json({
      success: true,
      message: 'Pickup slot updated successfully',
      data: slot,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePickupSlot(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const slot = await PickupSlot.findOneAndDelete({ _id: id, farmer: farmer._id });
    if (!slot) {
      throw new AppError('Pickup slot not found or unauthorized', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Pickup slot deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
