import mongoose, { Schema, Model } from 'mongoose';
import { IPickupSlot } from '../types/index.ts';

const PickupSlotSchema = new Schema<IPickupSlot>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer reference is required'],
      index: true,
    },
    market: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      required: [true, 'Market reference is required'],
      index: true,
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
      index: true,
    },
    dayOfWeek: {
      type: String,
      required: [true, 'Day of week is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g., 09:00)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g., 11:00)'],
      trim: true,
    },
    slotCapacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      default: 20,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: [0, 'Booked count cannot be negative'],
    },
    cutoffHours: {
      type: Number,
      default: 12, // Pre-orders close 12 hours before slot start time
      min: [0, 'Cutoff hours cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PickupSlotSchema.index({ farmer: 1, market: 1, pickupDate: 1 });
PickupSlotSchema.index({ market: 1, pickupDate: 1, isAvailable: 1 });

export const PickupSlot: Model<IPickupSlot> =
  mongoose.models.PickupSlot || mongoose.model<IPickupSlot>('PickupSlot', PickupSlotSchema);
