const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Razorpay keys are not configured on backend",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        app: "ShopSphere",
        userId: String(req.user?._id || ""),
      },
    });

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order",
      error: error.message,
    });
  }
});

router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: "Razorpay secret is not configured",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to verify payment",
      error: error.message,
    });
  }
});

module.exports = router;