import mongoose, { Schema, Model } from 'mongoose';
import { IFarmerProfile } from '../types/index.ts';

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated user ID is required'],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business/stall name is required'],
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Farm/stall address is required'],
      trim: true,
    },
    markets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Market',
      },
    ],
    marketDays: [
      {
        type: String,
        trim: true,
      },
    ],
    pickupWindows: [
      {
        type: String,
        trim: true,
      },
    ],
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
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'suspended', 'rejected'],
        message: '{VALUE} is not a valid approval status',
      },
      default: 'pending',
      index: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to products
FarmerProfileSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'farmer',
});

// Virtual relationship to reviews
FarmerProfileSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'farmer',
});

// Indexes
FarmerProfileSchema.index({ 'location.coordinates': '2dsphere' });
FarmerProfileSchema.index({ approvalStatus: 1, markets: 1 });
FarmerProfileSchema.index({ businessName: 'text', description: 'text' });

export const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
