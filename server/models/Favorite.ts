import mongoose, { Schema, Model } from 'mongoose';
import { IFavorite } from '../types/index.ts';

const FavoriteSchema = new Schema<IFavorite>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      unique: true,
    },
    favoriteFarmers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FarmerProfile',
      },
    ],
    favoriteProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    favoriteMarkets: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Market',
      },
    ],
    restockAlertsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
