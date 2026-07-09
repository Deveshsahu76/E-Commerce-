require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(mongoUri);

    let category = await Category.findOne({ name: "Electronics" });

    if (!category) {
      category = await Category.create({
        name: "Electronics",
        description: "Smart gadgets and electronic accessories",
      });
    }

    const existingProduct = await Product.findOne({
      name: "Wireless Headphones",
    });

    if (existingProduct) {
      existingProduct.stock = 25;
      existingProduct.isActive = true;
      await existingProduct.save();

      console.log("Existing product updated:");
      console.log(existingProduct._id.toString());
    } else {
      const product = await Product.create({
        name: "Wireless Headphones",
        description:
          "Premium wireless headphones with clear sound, comfortable fit, and long battery life.",
        price: 1499,
        category: category._id,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        ],
        brand: "SonicRaksha",
        rating: 4.5,
        numReviews: 12,
        sold: 0,
        isFeatured: true,
        isActive: true,
      });

      console.log("New product created:");
      console.log(product._id.toString());
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

run();