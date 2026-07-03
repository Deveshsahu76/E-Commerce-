const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const buildSortQuery = (sort) => {
  switch (sort) {
    case "price-low":
      return { price: 1 };

    case "price-high":
      return { price: -1 };

    case "rating":
      return { rating: -1 };

    case "popular":
      return { sold: -1 };

    case "oldest":
      return { createdAt: 1 };

    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const resolveCategoryId = async (category) => {
  if (!category || category === "all") return null;

  if (mongoose.Types.ObjectId.isValid(category)) {
    return category;
  }

  const categoryDoc = await Category.findOne({
    name: { $regex: `^${category}$`, $options: "i" },
  }).select("_id");

  return categoryDoc?._id || null;
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 60);
    const skip = (page - 1) * limit;

    const {
      keyword = "",
      category = "",
      minPrice,
      maxPrice,
      sort = "newest",
      featured,
    } = req.query;

    const query = {
      isActive: true,
    };

    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword) {
      query.$text = { $search: trimmedKeyword };
    }

    const categoryId = await resolveCategoryId(category);

    if (category && category !== "all") {
      if (!categoryId) {
        return res.json({
          success: true,
          products: [],
          count: 0,
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }

      query.category = categoryId;
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    const sortQuery = buildSortQuery(sort);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      products,
      count: products.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    })
      .populate("category", "name")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};