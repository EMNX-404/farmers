import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types/index.ts';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'farmer', 'admin'],
        message: '{VALUE} is not a valid user role',
      },
      default: 'customer',
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'deactivated'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
      index: true,
    },
    farmerProfile: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerProfile',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound and text indexes
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ name: 'text', email: 'text' });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
