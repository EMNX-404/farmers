import { Response, NextFunction } from 'express';
import { User } from '../models/User.ts';
import { FarmerProfile } from '../models/FarmerProfile.ts';
import { hashPassword, comparePassword } from '../utils/password.ts';
import { generateToken } from '../utils/jwt.ts';
import { AuthenticatedRequest } from '../types/index.ts';
import { AppError } from '../middleware/errorHandler.ts';

export async function registerCustomer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password, contactNumber, address } = req.body;

    if (!name || !email || !password || !contactNumber) {
      throw new AppError('Name, email, password, and contact number are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
      contactNumber: contactNumber.trim(),
      address: address ? address.trim() : '',
      status: 'active',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          address: user.address,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function registerFarmer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      name,
      email,
      password,
      contactNumber,
      address,
      businessName,
      description,
      markets,
      marketDays,
      pickupWindows,
      latitude,
      longitude,
    } = req.body;

    if (!name || !email || !password || !contactNumber || !businessName) {
      throw new AppError(
        'Name, email, password, contact number, and business/stall name are required',
        400
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'farmer',
      contactNumber: contactNumber.trim(),
      address: address ? address.trim() : '',
      status: 'active',
    });

    const coordinates: [number, number] = [
      typeof longitude === 'number' ? longitude : 0,
      typeof latitude === 'number' ? latitude : 0,
    ];

    const farmerProfile = await FarmerProfile.create({
      user: user._id,
      businessName: businessName.trim(),
      description: description ? description.trim() : '',
      contactNumber: contactNumber.trim(),
      address: address ? address.trim() : 'Local Farm Address',
      markets: Array.isArray(markets) ? markets : [],
      marketDays: Array.isArray(marketDays) ? marketDays : ['Saturday'],
      pickupWindows: Array.isArray(pickupWindows) ? pickupWindows : ['09:00 - 11:00', '11:00 - 13:00'],
      location: {
        type: 'Point',
        coordinates,
      },
      approvalStatus: 'pending', // Farmers require admin approval
    });

    user.farmerProfile = farmerProfile._id;
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      farmerProfileId: farmerProfile._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully. Your profile is pending administrative approval.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          address: user.address,
        },
        farmerProfile: {
          id: farmerProfile._id,
          businessName: farmerProfile.businessName,
          approvalStatus: farmerProfile.approvalStatus,
          marketDays: farmerProfile.marketDays,
          pickupWindows: farmerProfile.pickupWindows,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('farmerProfile');

    if (!user) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended by an administrator', 403);
    }

    if (user.status === 'deactivated') {
      throw new AppError('This account has been deactivated', 403);
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials', 401);
    }

    const farmerProfileId = user.farmerProfile
      ? (user.farmerProfile as any)._id?.toString() || user.farmerProfile.toString()
      : undefined;

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      farmerProfileId,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          address: user.address,
          status: user.status,
          farmerProfile: user.farmerProfile,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId)
      .select('-password')
      .populate({
        path: 'farmerProfile',
        populate: { path: 'markets', select: 'name address marketDays operatingHours' },
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, contactNumber, address, businessName, description, marketDays, pickupWindows, markets } = req.body;

    const user = await User.findById(req.user!.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (name) user.name = name.trim();
    if (contactNumber) user.contactNumber = contactNumber.trim();
    if (address !== undefined) user.address = address.trim();

    await user.save();

    // If farmer, also update farmer profile fields
    if (user.role === 'farmer' && user.farmerProfile) {
      const profile = await FarmerProfile.findById(user.farmerProfile);
      if (profile) {
        if (businessName) profile.businessName = businessName.trim();
        if (description !== undefined) profile.description = description.trim();
        if (contactNumber) profile.contactNumber = contactNumber.trim();
        if (address !== undefined) profile.address = address.trim();
        if (Array.isArray(marketDays)) profile.marketDays = marketDays;
        if (Array.isArray(pickupWindows)) profile.pickupWindows = pickupWindows;
        if (Array.isArray(markets)) profile.markets = markets;
        await profile.save();
      }
    }

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('farmerProfile');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    const user = await User.findById(req.user!.userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password || '');
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, newPassword } = req.body;

    if (!email) {
      throw new AppError('Email address is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('No account found with this email address', 404);
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400);
      }
      user.password = await hashPassword(newPassword);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password has been successfully reset. You can now log in with your new password.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Account verified. You may proceed to enter your new password.',
      data: { email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

