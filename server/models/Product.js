const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    brand: {
      type: String,
      default: "ShopSphere",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      default: "Snake Repeller",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      default: 0,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    image: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    highlights: [
      {
        type: String,
      },
    ],

    tags: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);