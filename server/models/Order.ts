import mongoose, { Schema, Model } from 'mongoose';
import { IOrder } from '../types/index.ts';

const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
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
    items: {
      type: [OrderItemSchema],
      required: [true, 'At least one order item is required'],
      validate: {
        validator: (items: any[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
      index: true,
    },
    pickupTimeSlot: {
      type: String,
      required: [true, 'Pickup time slot is required'],
      trim: true,
    },
    pickupSlot: {
      type: Schema.Types.ObjectId,
      ref: 'PickupSlot',
    },
    status: {
      type: String,
      enum: {
        values: ['placed', 'accepted', 'ready', 'completed', 'declined', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'placed',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash_at_pickup'],
        message: '{VALUE} is not a valid payment method. Only cash_at_pickup is supported.',
      },
      default: 'cash_at_pickup',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    customerNotes: {
      type: String,
      trim: true,
      default: '',
    },
    farmerNotes: {
      type: String,
      trim: true,
      default: '',
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    declinedReason: {
      type: String,
      trim: true,
      default: '',
    },
    placedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acceptedAt: Date,
    readyAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    declinedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
OrderSchema.index({ customer: 1, status: 1 });
OrderSchema.index({ farmer: 1, status: 1 });
OrderSchema.index({ market: 1, pickupDate: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
