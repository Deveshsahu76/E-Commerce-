const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.q || "";
    const category = req.query.category || "";
    const inStock = req.query.inStock;
    const sort = req.query.sort || "newest";

    const query = {
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    };

    if (keyword) {
      query.$and = [
        {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { brand: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { shortDescription: { $regex: keyword, $options: "i" } },
            { tags: { $regex: keyword, $options: "i" } },
          ],
        },
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    let sortQuery = { createdAt: -1 };

    if (sort === "price-low") sortQuery = { price: 1 };
    if (sort === "price-high") sortQuery = { price: -1 };

    const products = await Product.find(query).sort(sortQuery);

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
};