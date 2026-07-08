const Product = require("../models/Product");

let Order = null;
try {
  Order = require("../models/Order");
} catch (error) {
  Order = null;
}

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

  const product = {
    name: body.name,
    brand: body.brand || "ShopSphere",
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
    product.images = images;
    product.image = images[0];
    product.imageUrl = images[0];
  }

  if (body.slug) product.slug = body.slug;
  if (body.sku) product.sku = body.sku;

  return product;
};

const getAdminDashboard = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
    });

    let orders = [];
    if (Order) {
      orders = await Order.find({}).sort({ createdAt: -1 }).limit(20);
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => {
      const status = String(order.orderStatus || order.status || "").toLowerCase();
      return ["pending", "processing", "confirmed", ""].includes(status);
    }).length;

    const deliveredOrders = orders.filter((order) => {
      const status = String(order.orderStatus || order.status || "").toLowerCase();
      return status.includes("delivered");
    }).length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount || order.totalPrice || order.total || 0);
    }, 0);

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
      latestProducts: products,
      recentOrders: orders.slice(0, 8),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard",
      error: error.message,
    });
  }
};

const getAdminProducts = async (req, res) => {
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
};

const createAdminProduct = async (req, res) => {
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
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create product",
      error: error.message,
    });
  }
};

const updateAdminProduct = async (req, res) => {
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
};

const deleteAdminProduct = async (req, res) => {
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
};

const getAdminOrders = async (req, res) => {
  try {
    if (!Order) {
      return res.json({
        success: true,
        orders: [],
        message: "Order model not found yet",
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
};

const updateAdminOrderStatus = async (req, res) => {
  try {
    if (!Order) {
      return res.status(404).json({
        success: false,
        message: "Order model not found",
      });
    }

    const { status, orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (status !== undefined) order.status = status;
    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update order",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,
};