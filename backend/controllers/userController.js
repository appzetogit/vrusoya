import User from '../models/User.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import { sendOTP, verifyOTP } from '../utils/smsService.js';

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').slice(-10);
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const isValidComEmail = (email = '') => /^[^\s@]+@[^\s@]+\.com$/i.test(String(email).trim());
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'aditiparihar179@gmail.com';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const VALID_FCM_PLATFORMS = ['web', 'mobile'];

const normalizeFcmPlatform = (platform = '') => {
  const normalizedPlatform = String(platform).trim().toLowerCase();
  return VALID_FCM_PLATFORMS.includes(normalizedPlatform) ? normalizedPlatform : '';
};

const resolveFcmPayload = (payload = {}) => {
  const source = payload?.fcm && typeof payload.fcm === 'object' ? payload.fcm : payload;
  const token = typeof source?.token === 'string' ? source.token.trim() : '';
  const platform = normalizeFcmPlatform(source?.platform);

  return { token, platform };
};

const validateOptionalFcmPayload = (payload = {}) => {
  const source = payload?.fcm && typeof payload.fcm === 'object' ? payload.fcm : payload;
  const tokenProvided = source?.token !== undefined;
  const platformProvided = source?.platform !== undefined;
  const { token, platform } = resolveFcmPayload(payload);

  if (tokenProvided || platformProvided) {
    if (!token) {
      const error = new Error('FCM token is required');
      error.statusCode = 400;
      throw error;
    }

    if (!platform) {
      const error = new Error('Platform must be either web or mobile');
      error.statusCode = 400;
      throw error;
    }
  }

  return { token, platform };
};

const buildUserFcmFields = ({ token = '', platform = '' } = {}) => ({
  fcmtokenweb: platform === 'web' ? token : '',
  fcmtokenmobile: platform === 'mobile' ? token : '',
  fcmToken: token || ''
});

const applyUserFcmFields = (user, { token = '', platform = '' } = {}) => {
  if (!user || !token || !platform) return false;

  if (platform === 'web') {
    user.fcmtokenweb = token;
  }

  if (platform === 'mobile') {
    user.fcmtokenmobile = token;
  }

  user.fcmToken = token;
  return true;
};

const findUserByPhoneFlexible = async (normalizedPhone) => {
  if (!normalizedPhone) return null;
  const suffixPattern = `${escapeRegExp(normalizedPhone)}$`;
  return User.findOne({
    $or: [
      { phone: normalizedPhone },
      { phone: { $regex: suffixPattern } }
    ]
  });
};

const getJwtCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const fcmPayload = validateOptionalFcmPayload(req.body);
    const normalizedEmail = normalizeEmail(email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (!isValidComEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid .com email address' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        id: 'user_' + Date.now(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        addresses: [],
        wishlist: [],
        usedCoupons: [],
        ...buildUserFcmFields(fcmPayload)
    });

    if (user) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: 'user',
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
     res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  try {
    if (!isValidComEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid .com email address' });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = generateToken('admin_01');
      res.cookie('jwt', token, getJwtCookieOptions());
      return res.json({
        _id: 'admin_01',
        name: admin.name,
        email: admin.email,
        role: 'admin',
        token
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    
    if (user && user.isBanned) {
        return res.status(401).json({ message: 'This account has been restricted. Please contact support.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.email === DEFAULT_ADMIN_EMAIL ? 'admin' : 'user',
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  let profile;
  let isAdmin = req.user.role === 'admin';

  if (isAdmin) {
    profile = await Admin.findOne({ email: req.user.email });
    if (!profile && req.user.email === DEFAULT_ADMIN_EMAIL) {
      // Return hardcoded values for backdoor admin if not in DB yet
      return res.json({
        id: 'admin_01',
        _id: 'admin_01',
        name: DEFAULT_ADMIN_NAME,
        email: DEFAULT_ADMIN_EMAIL,
        role: 'admin'
      });
    }
  } else {
    profile = req.user;
  }

  if (profile) {
    res.json({
        id: profile.id || profile._id,
        _id: profile.id || profile._id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        gender: profile.gender || 'Other',
        birthDate: profile.birthDate || '',
        addresses: profile.addresses || [],
        accountType: profile.accountType || 'Individual',
        gstNumber: profile.gstNumber || '',
        role: isAdmin ? 'admin' : 'user'
    });
  } else {
    res.status(401).json({ message: 'Not authorized, profile unavailable' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    let user;
    let isAdmin = req.user.role === 'admin';

    if (isAdmin) {
        user = await Admin.findOne({ email: req.user.email });
        if (!user && req.user.email === DEFAULT_ADMIN_EMAIL) {
            // Create the admin record if it doesn't exist but they are logged in via backdoor
            const salt = await bcrypt.genSalt(10);
            user = new Admin({
                email: DEFAULT_ADMIN_EMAIL,
                name: DEFAULT_ADMIN_NAME,
                password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt)
            });
        }
    } else {
        user = await User.findOne({ id: req.user.id });
    }

    if (user) {
        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.birthDate !== undefined) user.birthDate = req.body.birthDate;
        if (req.body.accountType !== undefined) user.accountType = req.body.accountType;
        if (req.body.gstNumber !== undefined) user.gstNumber = req.body.gstNumber;
        
        if (req.body.addresses) {
            user.addresses = req.body.addresses;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            id: isAdmin ? 'admin_01' : updatedUser.id,
            _id: isAdmin ? 'admin_01' : updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || '',
            gender: isAdmin ? 'Other' : updatedUser.gender,
            birthDate: isAdmin ? '' : updatedUser.birthDate,
            addresses: isAdmin ? [] : updatedUser.addresses,
            accountType: isAdmin ? 'Admin' : (updatedUser.accountType || 'Individual'),
            gstNumber: isAdmin ? '' : updatedUser.gstNumber,
            role: isAdmin ? 'admin' : 'user'
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete current user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserAccount = asyncHandler(async (req, res) => {
    if (req.user.role === 'admin') {
        res.status(403);
        throw new Error('Admin account deletion is not allowed from this route');
    }

    const deletedUser = await User.findOneAndDelete({ id: req.user.id });
    if (!deletedUser) {
        res.status(404);
        throw new Error('User not found');
    }

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.json({ message: 'Account deleted successfully' });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('-password').lean(); 
        if (user) {
            // Get stats for this user
            const orderStats = await mongoose.model('Order').aggregate([
                { $match: { userId: user.id, status: { $ne: 'Cancelled' } } },
                { 
                    $group: { 
                        _id: "$userId", 
                        totalOrders: { $sum: 1 }, 
                        totalSpend: { $sum: "$amount" } 
                    } 
                }
            ]);

            const stats = orderStats[0] || { totalOrders: 0, totalSpend: 0 };
            
            res.json({
                ...user,
                totalOrders: stats.totalOrders,
                totalSpend: stats.totalSpend
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'Active' or 'Blocked'

    const query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (status === 'Active') {
        query.isBanned = { $ne: true };
    } else if (status === 'Blocked') {
        query.isBanned = true;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 })
        .lean();

    // Get Order Stats for these users
    const userIds = users.map(u => u.id);
    const orderStats = await mongoose.model('Order').aggregate([
        { $match: { userId: { $in: userIds }, status: { $ne: 'Cancelled' } } },
        { 
            $group: { 
                _id: "$userId", 
                totalOrders: { $sum: 1 }, 
                totalSpend: { $sum: "$amount" } 
            } 
        }
    ]);

    const statsMap = orderStats.reduce((acc, stat) => {
        acc[stat._id] = stat;
        return acc;
    }, {});

    const usersWithStats = users.map(user => ({
        ...user,
        totalOrders: statsMap[user.id]?.totalOrders || 0,
        totalSpend: statsMap[user.id]?.totalSpend || 0
    }));

    // Global Stats for Dashboard
    const totalResidents = await User.countDocuments({});
    const activeAccounts = await User.countDocuments({ isBanned: { $ne: true } });
    const restrictedAccounts = await User.countDocuments({ isBanned: true });

    res.json({
        users: usersWithStats,
        page,
        pages: Math.ceil(count / limit),
        total: count,
        stats: {
            totalResidents,
            activeAccounts,
            restrictedAccounts
        }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
export const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }); 
        if (user) {
            user.isBanned = !user.isBanned;
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FCM token for push notifications
// @route   PUT /api/users/fcm-token
// @access  Private
export const updateFcmToken = asyncHandler(async (req, res) => {
    const { token: normalizedToken, platform } = validateOptionalFcmPayload(req.body);

    if (!normalizedToken) {
        res.status(400);
        throw new Error('FCM token is required');
    }

    if (!platform) {
        res.status(400);
        throw new Error('Platform must be either web or mobile');
    }

    let user;
    if (req.user.role === 'admin') {
        user = await Admin.findOne({ email: req.user.email });
        if (!user && req.user.email === DEFAULT_ADMIN_EMAIL) {
            const salt = await bcrypt.genSalt(10);
            user = new Admin({
                email: DEFAULT_ADMIN_EMAIL,
                name: DEFAULT_ADMIN_NAME,
                password: await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt)
            });
        }
    } else {
        user = await User.findOne({ id: req.user.id });
    }

    if (user) {
        if (req.user.role === 'admin') {
            user.fcmToken = normalizedToken;
        } else {
            applyUserFcmFields(user, { token: normalizedToken, platform });
        }
        await user.save();
        res.json({
            message: 'FCM token updated successfully',
            platform,
            savedField: req.user.role === 'admin'
                ? 'fcmToken'
                : (platform === 'web' ? 'fcmtokenweb' : 'fcmtokenmobile')
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Send OTP for login
 * @route   POST /api/users/send-otp-login
 * @access  Public
 */
export const sendOtpForLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error('Please provide a mobile number');
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
        res.status(400);
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    // Support a static login phone for quick access
    if (normalizedPhone === '7223077890') {
        return res.json({ success: true, message: 'Static login OTP available' });
    }

    // Check if user exists and is banned
    const user = await findUserByPhoneFlexible(normalizedPhone);
    if (user && user.isBanned) {
        res.status(401);
        throw new Error('This account has been restricted. Please contact support.');
    }

    const result = await sendOTP(normalizedPhone, 'Customer');
    res.json(result);
});

/**
 * @desc    Verify OTP for login
 * @route   POST /api/users/verify-otp-login
 * @access  Public
 */
export const verifyOtpForLogin = asyncHandler(async (req, res) => {
  const { phone, otp, name, email, accountType, gstNumber } = req.body;
  const fcmPayload = validateOptionalFcmPayload(req.body);

    if (!phone || !otp) {
        res.status(400);
        throw new Error('Please provide phone and OTP');
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
        res.status(400);
        throw new Error('Please provide a valid 10-digit mobile number');
    }

    const isStaticLogin = normalizedPhone === '7223077890' && otp === '0000';

    // First, check if user exists to decide whether to delete OTP on success
    let user = await findUserByPhoneFlexible(normalizedPhone);
    const deleteOnSuccess = !!user || (!!name && !!email);

    const isValid = isStaticLogin || await verifyOTP(normalizedPhone, otp, 'Customer', deleteOnSuccess);

    if (!isValid) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    if (!user) {
        if (isStaticLogin) {
            user = await User.create({
                id: 'user_7223077890',
                name: 'Static Login User',
                email: '7223077890@vrushahi.com',
                phone: normalizedPhone,
                accountType: 'Individual',
                addresses: [],
                wishlist: [],
                usedCoupons: [],
                ...buildUserFcmFields(fcmPayload)
            });
        } else {
            // If user doesn't exist and name/email are not provided, signal that it's a new user
            if (!name || !email) {
                return res.json({ isNewUser: true, phone: normalizedPhone });
            }

            const normalizedEmail = normalizeEmail(email);
            if (!isValidComEmail(normalizedEmail)) {
                res.status(400);
                throw new Error('Please enter a valid .com email address');
            }

            // Check if email is already taken by another account (without this phone)
            const emailExists = await User.findOne({ email: normalizedEmail });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already registered with another account');
            }

            // Create new user
            user = await User.create({
                id: 'user_' + Date.now(),
                name,
                email: normalizedEmail,
                phone: normalizedPhone,
                accountType: accountType || 'Individual',
                gstNumber: gstNumber || undefined,
                addresses: [],
                wishlist: [],
                usedCoupons: [],
                ...buildUserFcmFields(fcmPayload)
            });
        }
    }

    if (user && user.isBanned) {
        res.status(401);
        throw new Error('This account has been restricted. Please contact support.');
    }

    // Ensure phone used to sign in is always persisted in normalized format.
    if (user && user.phone !== normalizedPhone) {
        user.phone = normalizedPhone;
    }

    if (user && applyUserFcmFields(user, fcmPayload)) {
        // Persist the latest platform-specific token during OTP login when provided.
    }

    if (user?.isModified()) {
        await user.save();
    }

    // Login successful
    const token = generateToken(user.id);
    res.cookie('jwt', token, getJwtCookieOptions());

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        role: user.email === DEFAULT_ADMIN_EMAIL ? 'admin' : 'user',
        token
    });
});
