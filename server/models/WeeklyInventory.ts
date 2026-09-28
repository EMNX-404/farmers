import mongoose, { Schema, Model } from 'mongoose';
import { IWeeklyInventory } from '../types/index.ts';

const WeeklyInventorySchema = new Schema<IWeeklyInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer reference is required'],
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
      index: true,
    },
    weekEndDate: {
      type: Date,
      required: [true, 'Week end date is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
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

// Unique compound index: one inventory record per product per week
WeeklyInventorySchema.index({ product: 1, weekStartDate: 1 }, { unique: true });
WeeklyInventorySchema.index({ farmer: 1, weekStartDate: 1, isAvailable: 1 });

export const WeeklyInventory: Model<IWeeklyInventory> =
  mongoose.models.WeeklyInventory || mongoose.model<IWeeklyInventory>('WeeklyInventory', WeeklyInventorySchema);
