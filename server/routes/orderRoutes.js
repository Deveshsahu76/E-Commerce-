const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required",
  });
};

router.route("/").post(protect, createOrder);

router.route("/my").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/cancel").patch(protect, cancelOrder);

router.route("/admin/all").get(protect, adminOnly, getAllOrders);

router.route("/admin/:id/status").patch(protect, adminOnly, updateOrderStatus);

module.exports = router;