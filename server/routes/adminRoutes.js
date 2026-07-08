const express = require("express");
const {
  getAdminDashboard,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
} = require("../controllers/adminController");
const { protectAdmin, adminOnly } = require("../middleware/adminAuth");

const router = express.Router();

router.use(protectAdmin);
router.use(adminOnly);

router.get("/dashboard", getAdminDashboard);

router.get("/products", getAdminProducts);
router.post("/products", createAdminProduct);
router.put("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);

router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateAdminOrderStatus);
router.put("/orders/:id/payment", updateAdminOrderStatus);

module.exports = router;