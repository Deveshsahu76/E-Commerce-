const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);

router.route("/:itemId").patch(protect, updateCartItem).delete(protect, removeCartItem);

module.exports = router;