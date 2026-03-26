import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import shiprocketService from '../utils/shiprocketService.js';
import { validateOrderStock, deductStock } from '../utils/stockUtils.js';
import { sendAdminOrderNotification } from '../utils/notificationUtils.js';

const getRazorpayClient = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};


const isNonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

const hasAddressFields = (address = {}) => {
  return isNonEmpty(address.address)
    && isNonEmpty(address.city)
    && isNonEmpty(address.state)
    && isNonEmpty(String(address.pincode || ''));
};

const hasProfileForCheckout = (user, orderData) => {
  const shippingAddress = orderData?.shippingAddress || {};
  const userAddresses = Array.isArray(user?.addresses) ? user.addresses : [];

  const hasPhone = isNonEmpty(shippingAddress.phone)
    || isNonEmpty(user?.phone)
    || userAddresses.some((addr) => isNonEmpty(addr?.phone));

  const hasAddress = hasAddressFields(shippingAddress)
    || userAddresses.some((addr) => hasAddressFields(addr));

  return hasPhone && hasAddress;
};

const toSafeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeOrderDataAmounts = (orderData = {}) => {
  const normalized = { ...orderData };
  const subtotal = toSafeNumber(orderData.subtotal);
  const discount = toSafeNumber(orderData.discount);
  const deliveryCharges = toSafeNumber(orderData.deliveryCharges);
  const additionalFees = orderData.additionalFees || {};
  const paymentHandlingFee = toSafeNumber(additionalFees.paymentHandlingFee);
  const platformFee = toSafeNumber(additionalFees.platformFee);
  const handlingFee = toSafeNumber(additionalFees.handlingFee);

  const gstAmount = Math.round(toSafeNumber(orderData.gstAmount));
  normalized.gstAmount = gstAmount;

  const hasAmount = Number.isFinite(Number(orderData.amount));
  const derivedTotal = Math.max(
    0,
    subtotal - discount + gstAmount + deliveryCharges + paymentHandlingFee + platformFee + handlingFee
  );
  normalized.amount = Math.round(hasAmount ? Number(orderData.amount) : derivedTotal);

  return normalized;
};

const resolveOrderUserName = async (orderData = {}) => {
  const payloadName = String(orderData?.userName || '').trim();
  if (payloadName) return payloadName;

  const uid = String(orderData?.userId || '').trim();
  if (!uid) return '';

  const user = await User.findOne({ id: uid }).select('name');
  return String(user?.name || '').trim();
};

const normalizeAddressValue = (value = '') => String(value).trim();
const normalizePhoneForAddress = (value = '') => String(value).replace(/\D/g, '').slice(-10);

const buildShippingAddress = (shippingAddress = {}) => ({
  fullName: normalizeAddressValue(shippingAddress.fullName),
  phone: normalizePhoneForAddress(shippingAddress.phone),
  address: normalizeAddressValue(shippingAddress.address),
  city: normalizeAddressValue(shippingAddress.city),
  state: normalizeAddressValue(shippingAddress.state),
  pincode: normalizeAddressValue(shippingAddress.pincode),
});

const getAddressKey = (address = {}) => ([
  String(address.address || '').trim().toLowerCase(),
  String(address.city || '').trim().toLowerCase(),
  String(address.state || '').trim().toLowerCase(),
  String(address.pincode || '').trim(),
].join('|'));

const saveCheckoutAddressToUser = async (orderData = {}) => {
  const userId = String(orderData?.userId || '').trim();
  if (!userId) return;

  const address = buildShippingAddress(orderData?.shippingAddress || {});
  if (!address.address || !address.city || !address.state || !address.pincode) return;

  const user = await User.findOne({ id: userId });
  if (!user) return;

  const existingAddresses = Array.isArray(user.addresses) ? user.addresses : [];
  const incomingKey = getAddressKey(address);
  const existingIndex = existingAddresses.findIndex((addr) => getAddressKey(addr) === incomingKey);

  if (existingIndex >= 0) {
    existingAddresses[existingIndex].fullName = address.fullName || existingAddresses[existingIndex].fullName;
    existingAddresses[existingIndex].phone = address.phone || existingAddresses[existingIndex].phone;
  } else {
    const nextId = existingAddresses.reduce((max, addr) => {
      const current = Number(addr?.id || 0);
      return Number.isFinite(current) && current > max ? current : max;
    }, 0) + 1;

    existingAddresses.push({
      id: nextId,
      type: 'Home',
      ...address,
      isDefault: existingAddresses.length === 0,
    });
  }

  user.addresses = existingAddresses;
  await user.save();
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Public (or Private if auth is needed)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt, userId, orderData } = req.body;

  // Validation: Check if user profile is complete
  if (userId) {
      const user = await User.findOne({ id: userId });
      if (!user || !hasProfileForCheckout(user, orderData)) {
          return res.status(400).json({ 
              message: 'Please complete your profile (Mobile Number and Address) before placing an order.' 
          });
      }
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.status(500).json({ message: 'Razorpay keys are not configured on server.' });
  }

  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount.' });
  }

  if (!orderData?.items?.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const stockCheck = await validateOrderStock(orderData.items);
  if (!stockCheck.ok) {
    return res.status(409).json({ message: stockCheck.message });
  }

  const options = {
    amount: Math.round(amountNumber * 100), // amount in the smallest currency unit (paise for INR)
    currency,
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData // Custom data sent from frontend to create our DB order record
  } = req.body;
  const normalizedOrderData = normalizeOrderDataAmounts(orderData);

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keySecret) {
    return res.status(500).json({ message: 'Razorpay keys are not configured on server.' });
  }
  const expectedSign = crypto
    .createHmac("sha256", keySecret)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Payment verified
    try {
        const stockCheck = await validateOrderStock(orderData?.items || []);
        if (!stockCheck.ok) {
            return res.status(409).json({ message: stockCheck.message });
        }

        // Generate unique order ID
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const orderId = `ORD-${timestamp}-${randomSuffix}`;

        const resolvedUserName = await resolveOrderUserName(normalizedOrderData);

        // Create order in our database
        const newOrder = new Order({
            ...normalizedOrderData,
            id: orderId,
            userName: resolvedUserName,
            date: new Date(),
            paymentStatus: 'paid',
            status: 'pending', // Order received
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        await newOrder.save();
        try {
            await saveCheckoutAddressToUser(normalizedOrderData);
        } catch (addressError) {
            console.error('Failed to save checkout address to user profile:', addressError.message);
        }

        // Deduct stock from products after order creation; delete order if stock changes during deduction.
        try {
            await deductStock(orderData.items || []);
        } catch (stockError) {
            await Order.deleteOne({ _id: newOrder._id });
            throw stockError;
        }

        // Update Referral Stats if a coupon/code was used
        if (normalizedOrderData.appliedCoupon) {
            const referral = await Referral.findOne({ code: normalizedOrderData.appliedCoupon });
            if (referral) {
                referral.usageCount = (referral.usageCount || 0) + 1;
                // Add the gross amount (subtotal before discount) to totalSales
                // If subtotal isn't passed, we'll use total + discount as an estimate
                const saleAmount = normalizedOrderData.amount + (normalizedOrderData.discount || 0);
                referral.totalSales = (referral.totalSales || 0) + saleAmount;
                await referral.save();
            }
        }

        // Create shipment in Shiprocket for prepaid orders (only if configured)
        if (shiprocketService.isConfigured()) {
            try {
                const shiprocketResponse = await shiprocketService.createOrder(newOrder);
                
                if (shiprocketResponse && shiprocketResponse.order_id) {
                    newOrder.shiprocketOrderId = shiprocketResponse.order_id;
                    newOrder.shiprocketShipmentId = shiprocketResponse.shipment_id;
                    
                    // Assign AWB automatically
                    try {
                        const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
                        
                        // Validate AWB response structure
                        if (awbResponse && awbResponse.response && awbResponse.response.data) {
                            const awbCode = awbResponse.response.data.awb_code;
                            const courierName = awbResponse.response.data.courier_name;
                            
                            if (awbCode) {
                                newOrder.awbCode = awbCode;
                                newOrder.courierName = courierName;
                                console.log(`AWB assigned successfully: ${awbCode} via ${courierName}`);
                                
                                // Only generate pickup if AWB was successfully assigned
                                try {
                                    await shiprocketService.generatePickup(shiprocketResponse.shipment_id);
                                    console.log('Pickup generated successfully');
                                } catch (pickupError) {
                                    console.error('Pickup generation failed:', pickupError.message);
                                }
                            } else {
                                console.error('AWB assignment returned no AWB code');
                            }
                        } else {
                            console.error('Invalid AWB response structure:', awbResponse);
                        }
                    } catch (awbError) {
                        console.error('AWB assignment failed:', awbError.message);
                    }
                    
                    await newOrder.save();
                }
            } catch (shiprocketError) {
                console.error('Shiprocket integration failed:', shiprocketError.message);
                // Don't fail the order if Shiprocket fails
            }
        } else {
            console.log('Shiprocket not configured, skipping shipment creation');
        }

        // Send notification to Admin
        try {
            await sendAdminOrderNotification(newOrder);
        } catch (notifyError) {
            console.error('Failed to send admin notification:', notifyError.message);
        }

        res.status(200).json({ message: "Payment verified successfully", orderId: newOrder.id });
    } catch (dbError) {
        console.error('DB Order Creation Error after payment verification:', dbError);
        const status = /stock|variant|required|not found/i.test(dbError.message) ? 409 : 500;
        res.status(status).json({ message: dbError.message || "Payment verified but failed to save order", error: dbError.message });
    }
  } else {
    res.status(400).json({ message: "Invalid signature sent!" });
  }
});

// @desc    Create COD Order
// @route   POST /api/payments/cod
// @access  Public
export const createCODOrder = asyncHandler(async (req, res) => {
    const { orderData, userId } = req.body;
    const normalizedOrderData = normalizeOrderDataAmounts(orderData);
    
    // Validation: Check if user profile is complete
    if (userId) {
        const user = await User.findOne({ id: userId });
        if (!user || !hasProfileForCheckout(user, orderData)) {
            return res.status(400).json({ 
                message: 'Please complete your profile (Mobile Number and Address) before placing an order.' 
            });
        }
    }

    try {
        const stockCheck = await validateOrderStock(orderData?.items || []);
        if (!stockCheck.ok) {
            return res.status(409).json({ message: stockCheck.message });
        }

        // Generate unique order ID
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const orderId = `ORD-${timestamp}-${randomSuffix}`;

        const resolvedUserName = await resolveOrderUserName(normalizedOrderData);

        const newOrder = new Order({
            ...normalizedOrderData,
            id: orderId,
            userName: resolvedUserName,
            date: new Date(),
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            status: 'pending'
        });

        await newOrder.save();
        try {
            await saveCheckoutAddressToUser(normalizedOrderData);
        } catch (addressError) {
            console.error('Failed to save checkout address to user profile:', addressError.message);
        }

        // Deduct stock from products after order creation; delete order if stock changes during deduction.
        try {
            await deductStock(orderData.items || []);
        } catch (stockError) {
            await Order.deleteOne({ _id: newOrder._id });
            throw stockError;
        }

        // Update Referral Stats if a coupon/code was used
        if (normalizedOrderData.appliedCoupon) {
            const referral = await Referral.findOne({ code: normalizedOrderData.appliedCoupon });
            if (referral) {
                referral.usageCount = (referral.usageCount || 0) + 1;
                const saleAmount = normalizedOrderData.amount + (normalizedOrderData.discount || 0);
                referral.totalSales = (referral.totalSales || 0) + saleAmount;
                await referral.save();
            }
        }

        // Create shipment in Shiprocket (only if configured)
        if (shiprocketService.isConfigured()) {
            try {
                const shiprocketResponse = await shiprocketService.createOrder(newOrder);
                
                if (shiprocketResponse && shiprocketResponse.order_id) {
                    newOrder.shiprocketOrderId = shiprocketResponse.order_id;
                    newOrder.shiprocketShipmentId = shiprocketResponse.shipment_id;
                    
                    // Assign AWB automatically
                    try {
                        const awbResponse = await shiprocketService.assignAWB(shiprocketResponse.shipment_id);
                        
                        // Validate AWB response structure
                        if (awbResponse && awbResponse.response && awbResponse.response.data) {
                            const awbCode = awbResponse.response.data.awb_code;
                            const courierName = awbResponse.response.data.courier_name;
                            
                            if (awbCode) {
                                newOrder.awbCode = awbCode;
                                newOrder.courierName = courierName;
                                console.log(`AWB assigned successfully: ${awbCode} via ${courierName}`);
                                
                                // Only generate pickup if AWB was successfully assigned
                                try {
                                    await shiprocketService.generatePickup(shiprocketResponse.shipment_id);
                                    console.log('Pickup generated successfully');
                                } catch (pickupError) {
                                    console.error('Pickup generation failed:', pickupError.message);
                                }
                            } else {
                                console.error('AWB assignment returned no AWB code');
                            }
                        } else {
                            console.error('Invalid AWB response structure:', awbResponse);
                        }
                    } catch (awbError) {
                        console.error('AWB assignment failed:', awbError.message);
                    }
                    
                    await newOrder.save();
                }
            } catch (shiprocketError) {
                console.error('Shiprocket integration failed:', shiprocketError.message);
                // Don't fail the order creation if Shiprocket fails
            }
        } else {
            console.log('Shiprocket not configured, skipping shipment creation');
        }

        // Send notification to Admin
        try {
            await sendAdminOrderNotification(newOrder);
        } catch (notifyError) {
            console.error('Failed to send admin notification:', notifyError.message);
        }

        res.status(201).json({ message: "Order placed successfully", orderId: newOrder.id });
    } catch (error) {
        const status = /stock|variant|required|not found/i.test(error.message) ? 409 : 500;
        res.status(status).json({ message: error.message || "Failed to place COD order", error: error.message });
    }
});
