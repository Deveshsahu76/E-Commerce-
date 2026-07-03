import React from "react";
import { Link } from "react-router-dom";

const getProductImage = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images[0];
  }

  return "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80";
};

const ProductCard = ({ product }) => {
  const image = getProductImage(product);
  const price = Number(product?.price || 0);

  return (
    <article className="product-card">
      <Link to={`/products/${product?._id}`} className="product-card__image-wrap">
        <img src={image} alt={product?.name || "Product"} className="product-card__image" />
        <span className="product-card__badge">
          {product?.stock > 0 ? "In Stock" : "Out of Stock"}
        </span>
      </Link>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product?.category?.name || "Featured"}</span>
          <span>⭐ {Number(product?.rating || 0).toFixed(1)}</span>
        </div>

        <h3 className="product-card__title">
          <Link to={`/products/${product?._id}`}>{product?.name}</Link>
        </h3>

        <p className="product-card__desc">
          {product?.description?.length > 95
            ? `${product.description.slice(0, 95)}...`
            : product?.description || "Premium product selected for modern shoppers."}
        </p>

        <div className="product-card__bottom">
          <strong>₹{price.toLocaleString("en-IN")}</strong>
          <Link to={`/products/${product?._id}`} className="btn btn--small">
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;