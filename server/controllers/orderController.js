const Order = require("../models/Order");
const Product = require("../models/Product");

const getProductImage = (product = {}) => {
  if (Array.isArray(product.images) && product.images.length) {
    return product.images[0];
  }

  return product.image || product.imageUrl || "";
};

const createOrder = async (req, res) => {
  try {
    const {
      orderItems = [],
      items = [],
      shippingAddress = {},
      paymentMethod = "Cash on Delivery",
    } = req.body;

    const cartItems = orderItems.length ? orderItems : items;

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "No order items found",
      });
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const finalItems = [];

    for (const item of cartItems) {
      const productId =
        item.product ||
        item.productId ||
        item.id ||
        item._id ||
        item.product?._id ||
        item.product?.id;

      let product = null;

      if (productId) {
        product = await Product.findById(productId);
      }

      const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
      const price = Number(product?.price || item.price || 0);

      if (!price) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price",
        });
      }

      if (product && Number(product.stock || 0) < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock`,
        });
      }

      finalItems.push({
        product: product?._id || productId,
        name: product?.name || item.name || "Product",
        image: getProductImage(product) || item.image || "",
        quantity,
        price,
      });
    }

    const itemsPrice = finalItems.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 1);
    }, 0);

    const shippingPrice = itemsPrice > 0 && itemsPrice < 999 ? 49 : 0;
    const taxPrice = 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      orderItems: finalItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        addressLine1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "India",
      },
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Pending",
      orderStatus: "Pending",
      status: "Pending",
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      totalAmount: totalPrice,
      isPaid: false,
    });

    for (const item of finalItems) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -Number(item.quantity || 1) },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create order",
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load orders",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load order",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this order",
      });
    }

    const currentStatus = String(order.orderStatus || order.status || "").toLowerCase();

    if (["shipped", "delivered", "cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled now",
      });
    }

    order.orderStatus = "Cancelled";
    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to cancel order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};