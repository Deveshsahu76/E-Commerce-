const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { notifyOrderPlaced } = require("../utils/notificationService");

let Cart = null;
try {
  Cart = require("../models/Cart");
} catch {
  Cart = null;
}

const getProductImage = (product = {}) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  return product.image || product.imageUrl || "";
};

const normalizeId = (item = {}) => {
  const raw =
    item.product ||
    item.productId ||
    item.id ||
    item._id ||
    item.product?._id ||
    item.product?.id;

  return raw ? String(raw) : "";
};

const formatOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required");
  }

  const finalItems = [];

  for (const item of items) {
    const productId = normalizeId(item);
    let product = null;

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    const quantity = Math.max(Number(item.quantity || item.qty || 1), 1);
    const price = Number(product?.price || item.price || 0);

    if (!price) {
      throw new Error("Invalid product price");
    }

    if (product && Number(product.stock || 0) < quantity) {
      throw new Error(`Only ${product.stock || 0} units available for ${product.name}`);
    }

    finalItems.push({
      product: product?._id || productId || undefined,
      name: product?.name || item.name || "Product",
      image: getProductImage(product) || item.image || "",
      price,
      quantity,
    });
  }

  return finalItems;
};

const calculatePricing = (orderItems = []) => {
  const itemsPrice = orderItems.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);

  const deliveryPrice = itemsPrice === 0 || itemsPrice >= 999 ? 0 : 49;
  const shippingPrice = deliveryPrice;
  const platformFee = 0;
  const taxPrice = 0;
  const totalPrice = itemsPrice + deliveryPrice + platformFee + taxPrice;

  return {
    itemsPrice,
    deliveryPrice,
    shippingPrice,
    platformFee,
    taxPrice,
    totalPrice,
    totalAmount: totalPrice,
  };
};

const validateShippingAddress = (shippingAddress = {}, user = {}) => {
  const postalCode = shippingAddress.postalCode || shippingAddress.pincode || "";
  const email = shippingAddress.email || user.email || "";

  const requiredFields = {
    fullName: shippingAddress.fullName,
    phone: shippingAddress.phone,
    address: shippingAddress.address || shippingAddress.addressLine1,
    city: shippingAddress.city,
    state: shippingAddress.state,
    postalCode,
  };

  const missingField = Object.entries(requiredFields).find(
    ([, value]) => !String(value || "").trim()
  );

  if (missingField) {
    throw new Error(`${missingField[0]} is required in shipping address`);
  }

  if (!/^\d{10}$/.test(String(shippingAddress.phone).trim())) {
    throw new Error("Valid 10-digit phone number is required");
  }

  if (!/^\d{6}$/.test(String(postalCode).trim())) {
    throw new Error("Valid 6-digit pincode is required");
  }

  return {
    fullName: String(shippingAddress.fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(shippingAddress.phone).trim(),
    address: String(shippingAddress.address || shippingAddress.addressLine1).trim(),
    addressLine1: String(shippingAddress.address || shippingAddress.addressLine1).trim(),
    city: String(shippingAddress.city).trim(),
    state: String(shippingAddress.state).trim(),
    pincode: String(postalCode).trim(),
    postalCode: String(postalCode).trim(),
    country: shippingAddress.country || "India",
  };
};

const normalizePaymentMethod = (method = "") => {
  const value = String(method || "").toLowerCase();

  if (value.includes("online") || value.includes("razorpay")) {
    return "Online Payment";
  }

  return "Cash on Delivery";
};

const normalizePaymentResult = (paymentResult = {}) => {
  if (!paymentResult) return {};

  return {
    razorpayOrderId:
      paymentResult.razorpayOrderId || paymentResult.razorpay_order_id || "",
    razorpayPaymentId:
      paymentResult.razorpayPaymentId || paymentResult.razorpay_payment_id || "",
    razorpaySignature:
      paymentResult.razorpaySignature || paymentResult.razorpay_signature || "",
    status: paymentResult.status || "paid",
    paidAt: paymentResult.paidAt || new Date(),
  };
};

const reduceStock = async (orderItems = []) => {
  const operations = orderItems
    .filter((item) => item.product && mongoose.Types.ObjectId.isValid(String(item.product)))
    .map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
          stock: { $gte: Number(item.quantity || 1) },
        },
        update: {
          $inc: {
            stock: -Number(item.quantity || 1),
            sold: Number(item.quantity || 1),
          },
        },
      },
    }));

  if (operations.length > 0) {
    await Product.bulkWrite(operations);
  }
};

const restoreStock = async (orderItems = []) => {
  const operations = orderItems
    .filter((item) => item.product && mongoose.Types.ObjectId.isValid(String(item.product)))
    .map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            stock: Number(item.quantity || 1),
            sold: -Number(item.quantity || 1),
          },
        },
      },
    }));

  if (operations.length > 0) {
    await Product.bulkWrite(operations);
  }
};

const clearUserCart = async (userId) => {
  if (!Cart) return;

  const cart = await Cart.findOne({ user: userId });

  if (!cart) return;

  cart.items = [];

  if (typeof cart.recalculateTotals === "function") {
    cart.recalculateTotals();
  }

  await cart.save();
};

const createOrder = async (req, res) => {
  try {
    const {
      items = [],
      orderItems: rawOrderItems = [],
      shippingAddress = {},
      paymentMethod = "Cash on Delivery",
      paymentResult = null,
    } = req.body;

    const requestItems = rawOrderItems.length ? rawOrderItems : items;
    const validatedShippingAddress = validateShippingAddress(shippingAddress, req.user);
    const orderItems = await formatOrderItems(requestItems);
    const pricing = calculatePricing(orderItems);
    const finalPaymentMethod = normalizePaymentMethod(paymentMethod);
    const finalPaymentResult = normalizePaymentResult(paymentResult);

    const isOnlinePaid =
      finalPaymentMethod === "Online Payment" &&
      Boolean(finalPaymentResult.razorpayPaymentId);

    await reduceStock(orderItems);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: validatedShippingAddress,
      paymentMethod: finalPaymentMethod,
      paymentResult: finalPaymentResult,
      ...pricing,
      isPaid: isOnlinePaid,
      paidAt: isOnlinePaid ? new Date() : undefined,
      paymentStatus: isOnlinePaid ? "Paid" : "Pending",
      orderStatus: "Pending",
      status: isOnlinePaid ? "paid" : "pending",
    });

    await clearUserCart(req.user._id);

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images stock")
      .lean();

    notifyOrderPlaced(populatedOrder).catch((error) => {
      console.error("ORDER NOTIFICATION ERROR:", error.message);
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images stock")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner = String(order.user?._id || order.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentStatus = String(order.orderStatus || order.status || "").toLowerCase();

    if (["shipped", "delivered", "cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled after status: ${currentStatus}`,
      });
    }

    await restoreStock(order.orderItems);

    order.status = "cancelled";
    order.orderStatus = "Cancelled";
    order.cancellationReason = reason;

    await order.save();

    return res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const query = {};

    if (status) {
      query.$or = [
        { status },
        { orderStatus: { $regex: status, $options: "i" } },
        { paymentStatus: { $regex: status, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch all orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      orderStatus,
      paymentStatus,
    } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status) order.status = status;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const finalStatus = String(orderStatus || status || "").toLowerCase();

    if (finalStatus === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (String(paymentStatus || status || "").toLowerCase() === "paid") {
      order.isPaid = true;
      order.paidAt = order.paidAt || new Date();
    }

    await order.save();

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};