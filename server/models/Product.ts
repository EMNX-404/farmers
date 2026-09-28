import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '../types/index.ts';

const ProductSchema = new Schema<IProduct>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required (e.g., lb, bunch, box, kg)'],
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: ['available', 'sold_out', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
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

// Virtual relationship to reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Indexes
ProductSchema.index({ farmer: 1, availabilityStatus: 1 });
ProductSchema.index({ category: 1, availabilityStatus: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
