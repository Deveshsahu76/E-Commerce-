const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const Category = require("./models/Category");

require("dotenv").config();
connectDB();

const categories = [
  { name: "Electronics", description: "Gadgets, devices and accessories" },
  { name: "Fashion", description: "Clothing and accessories" },
  { name: "Home & Living", description: "Furniture and home essentials" },
];

const products = [
  {
    name: "Smart Wireless Headphones",
    description: "Noise-cancelling over-ear headphones with immersive sound and long battery life.",
    price: 129.99,
    categoryName: "Electronics",
    stock: 24,
    images: ["https://via.placeholder.com/480x360?text=Headphones"],
    rating: 4.6,
  },
  {
    name: "Minimalist Leather Wallet",
    description: "Slim leather wallet with card slots and RFID protection.",
    price: 39.99,
    categoryName: "Fashion",
    stock: 60,
    images: ["https://via.placeholder.com/480x360?text=Wallet"],
    rating: 4.2,
  },
  {
    name: "Modern Desk Lamp",
    description: "Adjustable LED desk lamp with touch control and USB charging.",
    price: 54.99,
    categoryName: "Home & Living",
    stock: 34,
    images: ["https://via.placeholder.com/480x360?text=Desk+Lamp"],
    rating: 4.8,
  },
];

const importData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    const sampleProducts = products.map((product) => ({
      ...product,
      category: categoryMap[product.categoryName],
    }));

    await Product.insertMany(sampleProducts);

    console.log("Data imported successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
