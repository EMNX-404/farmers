import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './auth.routes.ts';
import userRoutes from './user.routes.ts';
import customerRoutes from './customer.routes.ts';
import farmerRoutes from './farmer.routes.ts';
import marketRoutes from './market.routes.ts';
import productRoutes from './product.routes.ts';
import categoryRoutes from './category.routes.ts';
import inventoryRoutes from './inventory.routes.ts';
import cartRoutes from './cart.routes.ts';
import orderRoutes from './order.routes.ts';
import pickupSlotRoutes from './pickupSlot.routes.ts';
import favoriteRoutes from './favorite.routes.ts';
import reviewRoutes from './review.routes.ts';
import notificationRoutes from './notification.routes.ts';
import adminRoutes from './admin.routes.ts';
import reportRoutes from './report.routes.ts';
import announcementRoutes from './announcement.routes.ts';
import aiRoutes from './ai.routes.ts';
import mapRoutes from './map.routes.ts';
import { getDatabaseInfo, isDatabaseConnected } from '../config/db.ts';

const router = Router();

// Health check endpoint with real database status and collection statistics
router.get('/health', async (_req, res) => {
  const dbInfo = getDatabaseInfo();
  const isHealthy = isDatabaseConnected();

  let collectionsList: { name: string; count: number }[] = [];
  if (isHealthy && mongoose.connection.db) {
    try {
      const collections = await mongoose.connection.db.collections();
      collectionsList = await Promise.all(
        collections.map(async (c) => ({
          name: c.collectionName,
          count: await c.countDocuments(),
        }))
      );
    } catch {
      // Non-fatal if collection inspection encounters an issue
    }
  }

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'online' : 'database_disconnected',
    service: 'MarketLink Backend REST API',
    database: {
      status: dbInfo.status,
      host: dbInfo.host,
      databaseName: dbInfo.databaseName,
      isPersistent: dbInfo.isPersistent,
      connectedUri: dbInfo.maskedUri,
      collections: collectionsList,
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/farmers', farmerRoutes);
router.use('/markets', marketRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/pickup-slots', pickupSlotRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/announcements', announcementRoutes);
router.use('/ai', aiRoutes);
router.use('/maps', mapRoutes);

export default router;
