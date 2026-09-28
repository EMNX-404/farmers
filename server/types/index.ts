import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'customer' | 'farmer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deactivated';
export type FarmerApprovalStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type MarketStatus = 'active' | 'inactive';
export type ProductAvailability = 'available' | 'sold_out' | 'unavailable';
export type OrderStatus = 'placed' | 'accepted' | 'ready' | 'completed' | 'declined' | 'cancelled';
export type PaymentMethod = 'cash_at_pickup';
export type PaymentStatus = 'pending' | 'paid';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  contactNumber: string;
  address?: string;
  status: UserStatus;
  farmerProfile?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFarmerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  businessName: string;
  description?: string;
  contactNumber: string;
  address: string;
  markets: Types.ObjectId[];
  marketDays: string[];
  pickupWindows: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  approvalStatus: FarmerApprovalStatus;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMarket {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  marketDays: string[];
  operatingHours: string;
  status: MarketStatus;
  associatedFarmers: Types.ObjectId[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: Types.ObjectId;
  farmer: Types.ObjectId;
  name: string;
  category: Types.ObjectId;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUrl?: string;
  availabilityStatus: ProductAvailability;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWeeklyInventory {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  farmer: Types.ObjectId;
  weekStartDate: Date;
  weekEndDate: Date;
  quantity: number;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  unit: string;
}

export interface ICart {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPickupSlot {
  _id: Types.ObjectId;
  farmer: Types.ObjectId;
  market: Types.ObjectId;
  pickupDate: Date;
  dayOfWeek: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:00"
  slotCapacity: number;
  bookedCount: number;
  cutoffHours: number; // Hours before start time pre-orders close
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  customer: Types.ObjectId;
  farmer: Types.ObjectId;
  market: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  pickupDate: Date;
  pickupTimeSlot: string;
  pickupSlot?: Types.ObjectId;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNotes?: string;
  farmerNotes?: string;
  cancellationReason?: string;
  declinedReason?: string;
  placedAt: Date;
  acceptedAt?: Date;
  readyAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  declinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  farmer: Types.ObjectId;
  product?: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  farmerResponse?: {
    comment: string;
    respondedAt: Date;
  };
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite {
  _id: Types.ObjectId;
  customer: Types.ObjectId;
  favoriteFarmers: Types.ObjectId[];
  favoriteProducts: Types.ObjectId[];
  favoriteMarkets: Types.ObjectId[];
  restockAlertsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'order_confirmation' | 'order_accepted' | 'order_declined' | 'order_ready' | 'order_completed' | 'announcement' | 'restock_alert';
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnnouncement {
  _id: Types.ObjectId;
  title: string;
  content: string;
  author: Types.ObjectId;
  targetRole?: UserRole | 'all';
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  farmerProfileId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
