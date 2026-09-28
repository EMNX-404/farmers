import mongoose, { Schema, Model } from 'mongoose';
import { IMarket } from '../types/index.ts';

const MarketSchema = new Schema<IMarket>(
  {
    name: {
      type: String,
      required: [true, 'Market name is required'],
      trim: true,
      maxlength: [150, 'Market name cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Market address is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    zipCode: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
        validate: {
          validator: (coords: number[]) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]',
        },
      },
    },
    marketDays: [
      {
        type: String,
        required: [true, 'At least one market day is required'],
        trim: true,
      },
    ],
    operatingHours: {
      type: String,
      required: [true, 'Operating hours are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid market status',
      },
      default: 'active',
      index: true,
    },
    associatedFarmers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FarmerProfile',
      },
    ],
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
MarketSchema.index({ 'location.coordinates': '2dsphere' });
MarketSchema.index({ status: 1, marketDays: 1 });
MarketSchema.index({ name: 'text', address: 'text', city: 'text' });

export const Market: Model<IMarket> =
  mongoose.models.Market || mongoose.model<IMarket>('Market', MarketSchema);
