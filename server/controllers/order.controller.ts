import { Response, NextFunction } from 'express';
import { Order } from '../models/Order.ts';
import { Product } from '../models/Product.ts';
import { Market } from '../models/Market.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { PickupSlot } from '../models/PickupSlot.ts';
import { Cart } from '../models/Cart.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';
import { createNotification } from '../services/notification.service.ts';

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ML-${dateStr}-${randomSuffix}`;
}

export async function createPreOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const {
      farmerId,
      marketId,
      items,
      pickupDate,
      pickupTimeSlot,
      pickupSlotId,
      customerNotes,
    } = req.body;

    if (!farmerId || !marketId || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Farmer, market, and at least one order item are required', 400);
    }

    if (!pickupDate || !pickupTimeSlot) {
      throw new AppError('Pickup date and pickup time slot are required', 400);
    }

    // Verify farmer
    const farmer = await FarmerProfile.findById(farmerId);
    if (!farmer || farmer.approvalStatus !== 'approved') {
      throw new AppError('Selected farmer is not available for orders', 400);
    }

    // Verify market
    const market = await Market.findById(marketId);
    if (!market || market.status !== 'active') {
      throw new AppError('Selected market is not currently active', 400);
    }

    // Verify pickup slot if provided
    let slotDoc = null;
    if (pickupSlotId) {
      slotDoc = await PickupSlot.findById(pickupSlotId);
      if (slotDoc) {
        if (!slotDoc.isAvailable || slotDoc.bookedCount >= slotDoc.slotCapacity) {
          throw new AppError('Selected pickup slot is no longer available or at capacity', 400);
        }
      }
    }

    // Validate products and deduct stock
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404);
      }

      if (product.farmer.toString() !== farmerId) {
        throw new AppError(
          `Product "${product.name}" does not belong to the selected farmer. Please place separate orders per farmer.`,
          400
        );
      }

      const qty = parseInt(item.quantity, 10);
      if (qty <= 0) {
        throw new AppError(`Invalid quantity for product ${product.name}`, 400);
      }

      if (product.availabilityStatus !== 'available' || product.stockQuantity < qty) {
        throw new AppError(
          `Product "${product.name}" does not have sufficient stock. Available: ${product.stockQuantity} ${product.unit}`,
          400
        );
      }

      const subtotal = Math.round(product.price * qty * 100) / 100;
      calculatedTotal += subtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: qty,
        unit: product.unit,
        subtotal,
      });

      // Deduct stock
      product.stockQuantity -= qty;
      if (product.stockQuantity === 0) {
        product.availabilityStatus = 'sold_out';
      }
      await product.save();
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: customerId,
      farmer: farmer._id,
      market: market._id,
      items: validatedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100,
      pickupDate: new Date(pickupDate),
      pickupTimeSlot: pickupTimeSlot.trim(),
      pickupSlot: slotDoc?._id,
      status: 'placed',
      paymentMethod: 'cash_at_pickup',
      paymentStatus: 'pending',
      customerNotes: customerNotes ? customerNotes.trim() : '',
      placedAt: new Date(),
    });

    // Increment slot bookedCount if applicable
    if (slotDoc) {
      slotDoc.bookedCount += 1;
      if (slotDoc.bookedCount >= slotDoc.slotCapacity) {
        slotDoc.isAvailable = false;
      }
      await slotDoc.save();
    }

    // Clean up corresponding items from customer cart
    const cart = await Cart.findOne({ customer: customerId });
    if (cart) {
      const orderedProductIds = validatedItems.map((i) => i.product.toString());
      cart.items = cart.items.filter((item) => !orderedProductIds.includes(item.product.toString()));
      await cart.save();
    }

    // Notify farmer and customer
    await Promise.all([
      createNotification({
        userId: farmer.user,
        type: 'order_confirmation',
        title: `New Pre-Order #${orderNumber}`,
        message: `You have received a new pre-order from customer for $${order.totalAmount.toFixed(2)} scheduled for pickup on ${new Date(pickupDate).toLocaleDateString()}.`,
        relatedId: order._id,
      }),
      createNotification({
        userId: customerId,
        type: 'order_confirmation',
        title: `Pre-Order #${orderNumber} Confirmed`,
        message: `Your pre-order has been placed with ${farmer.businessName}. You will pay $${order.totalAmount.toFixed(2)} in person at pickup.`,
        relatedId: order._id,
      }),
    ]);

    const populatedOrder = await Order.findById(order._id)
      .populate('farmer', 'businessName contactNumber')
      .populate('market', 'name address')
      .populate('customer', 'name email contactNumber');

    res.status(201).json({
      success: true,
      message: 'Pre-order placed successfully. Payment is in-person at pickup.',
      data: populatedOrder,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { status } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = { customer: customerId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('farmer', 'businessName contactNumber')
        .populate('market', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFarmerOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const { status, pickupDate } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = { farmer: farmer._id };
    if (status) filter.status = status;
    if (pickupDate) {
      const d = new Date(pickupDate as string);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.pickupDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email contactNumber')
        .populate('market', 'name address')
        .sort({ pickupDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await Order.findById(id)
      .populate('farmer', 'businessName contactNumber user address')
      .populate('customer', 'name email contactNumber address')
      .populate('market', 'name address operatingHours');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Authorization check
    if (role === 'customer' && order.customer._id.toString() !== userId) {
      throw new AppError('Unauthorized to view this order', 403);
    }

    if (role === 'farmer') {
      const farmerDoc = order.farmer as any;
      if (farmerDoc.user?.toString() !== userId) {
        throw new AppError('Unauthorized to view this order', 403);
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, declinedReason, farmerNotes } = req.body;

    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer && req.user!.role !== 'admin') {
      throw new AppError('Farmer profile not found or unauthorized', 403);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (req.user!.role !== 'admin' && order.farmer.toString() !== farmer!._id.toString()) {
      throw new AppError('Unauthorized to modify this order', 403);
    }

    const validFarmerTransitions: Record<string, string[]> = {
      placed: ['accepted', 'declined'],
      accepted: ['ready', 'declined'],
      ready: ['completed', 'declined'],
    };

    if (req.user!.role !== 'admin') {
      const allowed = validFarmerTransitions[order.status] || [];
      if (!allowed.includes(status)) {
        throw new AppError(
          `Invalid status transition from '${order.status}' to '${status}'. Allowed: [${allowed.join(', ')}]`,
          400
        );
      }
    }

    order.status = status;
    const now = new Date();

    if (status === 'accepted') {
      order.acceptedAt = now;
      await createNotification({
        userId: order.customer,
        type: 'order_accepted',
        title: `Order #${order.orderNumber} Accepted`,
        message: `Your order has been accepted by ${farmer?.businessName || 'the farmer'}! It will be prepared for pickup.`,
        relatedId: order._id,
      });
    } else if (status === 'ready') {
      order.readyAt = now;
      await createNotification({
        userId: order.customer,
        type: 'order_ready',
        title: `Order #${order.orderNumber} Ready for Pickup!`,
        message: `Your order is packed and ready for pickup at ${order.pickupTimeSlot}. Please bring cash or pay in person at the stall.`,
        relatedId: order._id,
      });
    } else if (status === 'completed') {
      order.completedAt = now;
      order.paymentStatus = 'paid';
      await createNotification({
        userId: order.customer,
        type: 'order_completed',
        title: `Order #${order.orderNumber} Completed`,
        message: `Thank you for picking up your order from ${farmer?.businessName || 'the farm'}. Enjoy your fresh produce! Please leave a review.`,
        relatedId: order._id,
      });
    } else if (status === 'declined') {
      order.declinedAt = now;
      order.declinedReason = declinedReason || 'Farmer was unable to fulfill this order';

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
          $set: { availabilityStatus: 'available' },
        });
      }

      await createNotification({
        userId: order.customer,
        type: 'order_declined',
        title: `Order #${order.orderNumber} Declined`,
        message: `Your order was declined: ${order.declinedReason}`,
        relatedId: order._id,
      });
    }

    if (farmerNotes) order.farmerNotes = farmerNotes.trim();
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.userId;

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Only customer who placed it or admin can cancel
    if (req.user!.role !== 'admin' && order.customer.toString() !== userId) {
      throw new AppError('Unauthorized to cancel this order', 403);
    }

    if (!['placed', 'accepted'].includes(order.status)) {
      throw new AppError(`Cannot cancel an order in '${order.status}' status`, 400);
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason ? reason.trim() : 'Cancelled by customer';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
        $set: { availabilityStatus: 'available' },
      });
    }

    // Notify farmer
    const farmer = await FarmerProfile.findById(order.farmer);
    if (farmer) {
      await createNotification({
        userId: farmer.user,
        type: 'order_declined',
        title: `Order #${order.orderNumber} Cancelled`,
        message: `Customer cancelled order #${order.orderNumber}. Reason: ${order.cancellationReason}`,
        relatedId: order._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function reorder(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const customerId = req.user!.userId;

    const previousOrder = await Order.findOne({ _id: id, customer: customerId });
    if (!previousOrder) {
      throw new AppError('Previous order not found', 404);
    }

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }

    // Add items from previous order to cart if currently available
    const addedItems = [];
    const skippedItems = [];

    for (const item of previousOrder.items) {
      const product = await Product.findById(item.product);
      if (product && product.availabilityStatus === 'available' && product.stockQuantity > 0) {
        const qty = Math.min(item.quantity, product.stockQuantity);
        const existingIdx = cart.items.findIndex(
          (ci) => ci.product.toString() === product._id.toString()
        );
        if (existingIdx > -1) {
          cart.items[existingIdx].quantity = qty;
        } else {
          cart.items.push({
            product: product._id,
            quantity: qty,
            price: product.price,
            unit: product.unit,
          });
        }
        addedItems.push(product.name);
      } else {
        skippedItems.push(item.name);
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: `Reorder processed. Added ${addedItems.length} items to your cart.`,
      data: {
        added: addedItems,
        unavailable: skippedItems,
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, market, pickupDate, search } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter: any = {};
    if (status) filter.status = status;
    if (market) filter.market = market;
    if (pickupDate) {
      const d = new Date(pickupDate as string);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.pickupDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (search && typeof search === 'string') {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email contactNumber')
        .populate('farmer', 'businessName contactNumber')
        .populate('market', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

