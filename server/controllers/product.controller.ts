import { Response, NextFunction } from 'express';
import { Product } from '../models/Product.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { Market } from '../models/Market.ts';
import { Review } from '../models/Review.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';
import { getPagination } from '../middleware/validation.ts';

export async function getProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      search,
      category,
      farmer,
      market,
      day,
      minPrice,
      maxPrice,
      availability,
      sort,
    } = req.query;

    const { page, limit, skip } = getPagination(req);
    const filter: any = {};

    // Availability filter (default for customers: only available and sold_out, not unavailable)
    if (availability && typeof availability === 'string') {
      filter.availabilityStatus = availability;
    } else {
      filter.availabilityStatus = { $ne: 'unavailable' };
    }

    if (category) {
      filter.category = category;
    }

    if (farmer) {
      filter.farmer = farmer;
    }

    // Filter by market or day: find farmers attending that market/day
    if (market || day) {
      const farmerQuery: any = { approvalStatus: 'approved' };
      if (market) farmerQuery.markets = market;
      if (day) farmerQuery.marketDays = { $regex: new RegExp(`^${day}$`, 'i') };

      const matchingFarmers = await FarmerProfile.find(farmerQuery).select('_id');
      const matchingFarmerIds = matchingFarmers.map((f) => f._id);
      filter.farmer = { $in: matchingFarmerIds };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'rating') sortOption = { ratingAverage: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmer', 'businessName contactNumber ratingAverage ratingCount marketDays pickupWindows markets')
        .populate('category', 'name slug icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

export async function getProductById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('farmer', 'businessName contactNumber ratingAverage ratingCount marketDays pickupWindows markets')
      .populate('category', 'name slug icon');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Retrieve recent reviews for this product
    const reviews = await Review.find({ product: product._id, isModerated: false })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const { page, limit, skip } = getPagination(req);
    const { search, category, status } = req.query;

    const filter: any = { farmer: farmer._id };
    if (category) filter.category = category;
    if (status) filter.availabilityStatus = status;
    if (search && typeof search === 'string') {
      filter.name = { $regex: search, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

export async function createProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found for this account', 404);
    }

    if (farmer.approvalStatus !== 'approved') {
      throw new AppError(
        `Cannot create products while farmer status is '${farmer.approvalStatus}'. Admin approval required.`,
        403
      );
    }

    const { name, category, description, price, unit, stockQuantity, imageUrl, availabilityStatus } = req.body;

    if (!name || !category || !description || price === undefined || !unit) {
      throw new AppError('Name, category, description, price, and unit are required', 400);
    }

    const product = await Product.create({
      farmer: farmer._id,
      name: name.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      unit: unit.trim(),
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      imageUrl: imageUrl ? imageUrl.trim() : '',
      availabilityStatus: availabilityStatus || (stockQuantity > 0 ? 'available' : 'sold_out'),
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const product = await Product.findOne({ _id: id, farmer: farmer._id });
    if (!product) {
      throw new AppError('Product not found or you are not authorized to edit this product', 404);
    }

    const { name, category, description, price, unit, stockQuantity, imageUrl, availabilityStatus } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (unit) product.unit = unit.trim();
    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      if (product.stockQuantity === 0 && !availabilityStatus) {
        product.availabilityStatus = 'sold_out';
      } else if (product.stockQuantity > 0 && product.availabilityStatus === 'sold_out') {
        product.availabilityStatus = 'available';
      }
    }
    if (imageUrl !== undefined) product.imageUrl = imageUrl.trim();
    if (availabilityStatus) product.availabilityStatus = availabilityStatus;

    await product.save();

    const updated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProductStockAndStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { stockQuantity, availabilityStatus, price } = req.body;

    const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
    if (!farmer) {
      throw new AppError('Farmer profile not found', 404);
    }

    const product = await Product.findOne({ _id: id, farmer: farmer._id });
    if (!product) {
      throw new AppError('Product not found or unauthorized', 404);
    }

    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (availabilityStatus) product.availabilityStatus = availabilityStatus;
    if (price !== undefined) product.price = Number(price);

    // Auto mark sold out if stock is 0
    if (product.stockQuantity === 0 && product.availabilityStatus === 'available') {
      product.availabilityStatus = 'sold_out';
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product inventory/status updated',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    let product;

    if (req.user!.role === 'admin') {
      product = await Product.findById(id);
    } else {
      const farmer = await FarmerProfile.findOne({ user: req.user!.userId });
      if (!farmer) {
        throw new AppError('Farmer profile not found', 404);
      }
      product = await Product.findOne({ _id: id, farmer: farmer._id });
    }

    if (!product) {
      throw new AppError('Product not found or unauthorized', 404);
    }

    // Set to unavailable
    product.availabilityStatus = 'unavailable';
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product marked as unavailable / deleted from active catalog',
    });
  } catch (err) {
    next(err);
  }
}

