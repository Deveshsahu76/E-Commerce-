const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const validateShippingAddress = (shippingAddress = {}) => {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ];

  const missingField = requiredFields.find(
    (field) => !String(shippingAddress[field] || "").trim()
  );

  if (missingField) {
    throw new Error(`${missingField} is required in shipping address`);
  }

  if (!/^\d{10}$/.test(String(shippingAddress.phone).trim())) {
    throw new Error("Valid 10-digit phone number is required");
  }

  if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) {
    throw new Error("Valid 6-digit pincode is required");
  }

  return {
    fullName: shippingAddress.fullName.trim(),
    email: shippingAddress.email.trim().toLowerCase(),
    phone: shippingAddress.phone.trim(),
    address: shippingAddress.address.trim(),
    city: shippingAddress.city.trim(),
    state: shippingAddress.state.trim(),
    pincode: shippingAddress.pincode.trim(),
    country: shippingAddress.country || "India",
  };
};

const formatOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required");
  }

  const productIds = items.map((item) => item.product || item.productId);

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map(
    products.map((product) => [product._id.toString(), product])
  );

  return items.map((item) => {
    const productId = String(item.product || item.productId);
    const product = productMap.get(productId);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const quantity = Math.max(Number(item.quantity || 1), 1);

    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} units available for ${product.name}`);
    }

    const image =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "";

    return {
      product: product._id,
      name: product.name,
      image,
      price: product.price,
      quantity,
    };
  });
};

const calculatePricing = (orderItems) => {
  const itemsPrice = orderItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const deliveryPrice = itemsPrice === 0 || itemsPrice >= 999 ? 0 : 99;
  const platformFee = itemsPrice === 0 ? 0 : 19;
  const taxPrice = 0;
  const totalPrice = itemsPrice + deliveryPrice + platformFee + taxPrice;

  return {
    itemsPrice,
    deliveryPrice,
    platformFee,
    taxPrice,
    totalPrice,
  };
};

const reduceStock = async (orderItems) => {
  const bulkOperations = orderItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
        stock: { $gte: item.quantity },
      },
      update: {
        $inc: {
          stock: -item.quantity,
          sold: item.quantity,
        },
      },
    },
  }));

  if (bulkOperations.length > 0) {
    const result = await Product.bulkWrite(bulkOperations);

    if (result.modifiedCount !== orderItems.length) {
      throw new Error("Unable to update stock for one or more products");
    }
  }
};

const clearUserCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (cart) {
    cart.items = [];
    cart.recalculateTotals();
    await cart.save();
  }
};

const createPaidOrderFromPayload = async ({
  userId,
  orderPayload,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const rawItems = orderPayload?.items || orderPayload?.orderItems;
  const shippingAddress = validateShippingAddress(orderPayload?.shippingAddress);
  const orderItems = await formatOrderItems(rawItems);
  const pricing = calculatePricing(orderItems);

  await reduceStock(orderItems);

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod: "Razorpay",
    paymentResult: {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
      paidAt: new Date(),
    },
    ...pricing,
    isPaid: true,
    paidAt: new Date(),
    status: "paid",
  });

  await clearUserCart(userId);

  return Order.findById(order._id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images stock")
    .lean();
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const razorpay = getRazorpayInstance();

    const options = {
      amount: Math.round(numericAmount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      order: orderPayload,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification fields are required",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    let order = null;

    if (orderId) {
      order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found for payment verification",
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "paid";
      order.paymentResult = {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        paidAt: new Date(),
      };

      await order.save();
    } else if (orderPayload) {
      order = await createPaidOrderFromPayload({
        userId: req.user._id,
        orderPayload,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};