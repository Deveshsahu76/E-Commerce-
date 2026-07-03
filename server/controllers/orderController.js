const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

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

const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderItems: rawOrderItems,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    const requestItems = rawOrderItems || items;
    const validatedShippingAddress = validateShippingAddress(shippingAddress);
    const orderItems = await formatOrderItems(requestItems);
    const pricing = calculatePricing(orderItems);

    await reduceStock(orderItems);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: validatedShippingAddress,
      paymentMethod: paymentMethod === "razorpay" ? "Razorpay" : paymentMethod,
      ...pricing,
      isPaid: paymentMethod === "COD" ? false : false,
      status: "pending",
    });

    await clearUserCart(req.user._id);

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images stock")
      .lean();

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
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

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

    const isOwner = order.user?._id?.toString() === req.user._id.toString();
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

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled after status: ${order.status}`,
      });
    }

    const restoreOperations = order.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        },
      },
    }));

    if (restoreOperations.length > 0) {
      await Product.bulkWrite(restoreOperations);
    }

    order.status = "cancelled";
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
      query.status = status;
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
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (status === "paid") {
      order.isPaid = true;
      order.paidAt = new Date();
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