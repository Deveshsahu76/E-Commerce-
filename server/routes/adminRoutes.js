const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");

let Order = null;
try {
  Order = require("../models/Order");
} catch (error) {
  Order = null;
}

const router = express.Router();

const getToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
};

const protectAdmin = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin login required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const adminEmail = String(process.env.ADMIN_EMAIL || "").toLowerCase();
    const userEmail = String(user.email || "").toLowerCase();

    const isAdminByRole = user.role === "admin";
    const isAdminByEmail = adminEmail && userEmail === adminEmail;

    if (!isAdminByRole && !isAdminByEmail) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

const splitLines = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);

  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeImages = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item?.url) return String(item.url).trim();
        return "";
      })
      .filter(Boolean);
  }

  return splitLines(value);
};

const normalizeProductPayload = (body = {}) => {
  const images = normalizeImages(body.images || body.imageUrls || body.image);

  const payload = {
    name: body.name,
    brand: body.brand || "SonicRaksha",
    category: body.category || "Snake Repeller",
    price: Number(body.price || 0),
    originalPrice: Number(body.originalPrice || body.mrp || 0),
    mrp: Number(body.originalPrice || body.mrp || body.price || 0),
    stock: Number(body.stock || 0),
    shortDescription: body.shortDescription || "",
    description: body.description || body.shortDescription || "",
    highlights: splitLines(body.highlights),
    tags: splitLines(body.tags),
    isFeatured: Boolean(body.isFeatured),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };

  if (images.length > 0) {
    payload.images = images;
    payload.image = images[0];
    payload.imageUrl = images[0];
  }

  return payload;
};

router.use(protectAdmin);

router.get("/dashboard", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
    });

    let totalOrders = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let totalRevenue = 0;
    let recentOrders = [];

    if (Order) {
      const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100);

      recentOrders = orders.slice(0, 8);
      totalOrders = orders.length;

      pendingOrders = orders.filter((order) => {
        const status = String(order.orderStatus || order.status || "Pending").toLowerCase();
        return ["pending", "confirmed", "packed", "processing"].includes(status);
      }).length;

      deliveredOrders = orders.filter((order) => {
        const status = String(order.orderStatus || order.status || "").toLowerCase();
        return status.includes("delivered");
      }).length;

      totalRevenue = orders.reduce((sum, order) => {
        return sum + Number(order.totalAmount || order.totalPrice || order.total || 0);
      }, 0);
    }

    const latestProducts = await Product.find({}).sort({ createdAt: -1 }).limit(8);

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
      },
      latestProducts,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
      error: error.message,
    });
  }
});

router.get("/products", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const query = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
            { brand: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load products",
      error: error.message,
    });
  }
});

router.post("/products", async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);

    if (!payload.name || !payload.price) {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required",
      });
    }

    const product = await Product.create(payload);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add product",
      error: error.message,
    });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update product",
      error: error.message,
    });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete product",
      error: error.message,
    });
  }
});

router.get("/orders", async (req, res) => {
  try {
    if (!Order) {
      return res.json({
        success: true,
        orders: [],
      });
    }

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100);

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
});

router.get("/orders/:id", async (req, res) => {
  try {
    if (!Order) {
      return res.status(404).json({
        success: false,
        message: "Order model not found",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    if (!Order) {
      return res.status(404).json({
        success: false,
        message: "Order model not found",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.body.orderStatus !== undefined) order.orderStatus = req.body.orderStatus;
    if (req.body.status !== undefined) order.status = req.body.status;

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update order status",
      error: error.message,
    });
  }
});

router.put("/orders/:id/payment", async (req, res) => {
  try {
    if (!Order) {
      return res.status(404).json({
        success: false,
        message: "Order model not found",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (req.body.paymentStatus !== undefined) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update payment status",
      error: error.message,
    });
  }
});

module.exports = router;