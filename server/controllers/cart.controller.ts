import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart.ts';
import { Product } from '../models/Product.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getCart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;

    let cart = await Cart.findOne({ customer: customerId }).populate({
      path: 'items.product',
      populate: {
        path: 'farmer',
        select: 'businessName approvalStatus marketDays pickupWindows markets',
      },
    });

    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }

    // Calculate totals safely on backend
    let subtotal = 0;
    let itemCount = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      if (product && product.availabilityStatus !== 'unavailable') {
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        itemCount += item.quantity;
        validatedItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl,
          quantity: item.quantity,
          subtotal: Math.round(itemTotal * 100) / 100,
          inStock: product.stockQuantity >= item.quantity,
          availableStock: product.stockQuantity,
          farmer: product.farmer,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        cartId: cart._id,
        items: validatedItems,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(subtotal * 100) / 100, // No hidden fees, in-person pickup
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    const product = await Product.findById(productId).populate('farmer');
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.availabilityStatus !== 'available') {
      throw new AppError(`Product is currently ${product.availabilityStatus.replace('_', ' ')}`, 400);
    }

    if (product.stockQuantity < qty) {
      throw new AppError(
        `Insufficient stock. Available stock is ${product.stockQuantity} ${product.unit}`,
        400
      );
    }

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newTotalQty = cart.items[existingItemIndex].quantity + qty;
      if (product.stockQuantity < newTotalQty) {
        throw new AppError(
          `Cannot add more. You have ${cart.items[existingItemIndex].quantity} in cart and only ${product.stockQuantity} ${product.unit} are available in total`,
          400
        );
      }
      cart.items[existingItemIndex].quantity = newTotalQty;
      cart.items[existingItemIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity: qty,
        price: product.price,
        unit: product.unit,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      throw new AppError('Product ID and quantity are required', 400);
    }

    const qty = parseInt(quantity, 10);
    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    if (qty <= 0) {
      // Remove item
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (product.stockQuantity < qty) {
        throw new AppError(
          `Requested quantity exceeds stock. Available: ${product.stockQuantity} ${product.unit}`,
          400
        );
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = qty;
        cart.items[itemIndex].price = product.price;
      } else {
        cart.items.push({
          product: product._id,
          quantity: qty,
          price: product.price,
          unit: product.unit,
        });
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.user!.userId;
    const cart = await Cart.findOne({ customer: customerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (err) {
    next(err);
  }
}
