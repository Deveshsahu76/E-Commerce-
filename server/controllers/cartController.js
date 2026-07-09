const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const populateCart = (query) => {
  return query.populate({
    path: "items.product",
    select: "name price images stock category rating",
    populate: {
      path: "category",
      select: "name",
    },
  });
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  }

  return cart;
};

const sendCartResponse = async (res, cartId, statusCode = 200) => {
  const cart = await populateCart(Cart.findById(cartId)).lean();

  return res.status(statusCode).json({
    success: true,
    cart,
  });
};

const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    return sendCartResponse(res, cart._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const qty = Math.max(Number(quantity) || 1, 1);

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const cart = await getOrCreateCart(req.user._id);

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const nextQuantity = Number(existingItem.quantity || 0) + qty;

      if (nextQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      existingItem.quantity = nextQuantity;
      existingItem.price = product.price;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      cart.items.push({
        product: product._id,
        quantity: qty,
        price: product.price,
      });
    }

    cart.recalculateTotals();
    await cart.save();

    return sendCartResponse(res, cart._id, 201);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add item to cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const qty = Number(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product no longer available",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    item.quantity = qty;
    item.price = product.price;

    cart.recalculateTotals();
    await cart.save();

    return sendCartResponse(res, cart._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    cart.recalculateTotals();
    await cart.save();

    return sendCartResponse(res, cart._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove cart item",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    cart.items = [];
    cart.recalculateTotals();
    await cart.save();

    return sendCartResponse(res, cart._id);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};