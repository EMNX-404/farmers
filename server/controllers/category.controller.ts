import { Response, NextFunction } from 'express';
import { Category } from '../models/Category.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function getCategories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { includeInactive } = req.query;
    const filter: any = {};

    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError('Category with this name already exists', 409);
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      icon: icon ? icon.trim() : '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (description !== undefined) category.description = description.trim();
    if (icon !== undefined) category.icon = icon.trim();
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}
