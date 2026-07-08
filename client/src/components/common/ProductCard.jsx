import { Link } from "react-router-dom";
import { addToCart } from "../../utils/cartUtils";
import { calculateDiscount, formatPrice, getProductImage } from "../../utils/money";
import { isInWishlist, toggleWishlist } from "../../utils/wishlistUtils";
import { useEffect, useState } from "react";

const ProductCard = ({ product }) => {
  const productId = product?._id || product?.id;
  const discount = calculateDiscount(product);
  const originalPrice = Number(product?.originalPrice || product?.mrp || 0);
  const price = Number(product?.price || 0);
  const image = getProductImage(product);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(productId));
  }, [productId]);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleWishlist = () => {
    const result = toggleWishlist(product);
    setSaved(result.added);
  };

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        {discount > 0 && <span className="badge badge-discount">{discount}% OFF</span>}
        {(product?.offerTitle || discount > 0) && (
          <span className="badge badge-offer">Best Offer</span>
        )}
        <button
          type="button"
          className={`wishlist-button ${saved ? "active" : ""}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          {saved ? "♥" : "♡"}
        </button>
        <Link to={`/products/${productId}`} className="product-card__image-link">
          <img
            src={image}
            alt={product?.name || "Product image"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80";
            }}
          />
        </Link>
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product?.brand || "Trusted Brand"}</span>
          <span className={Number(product?.stock || 0) > 0 ? "stock in" : "stock out"}>
            {Number(product?.stock || 0) > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>

        <Link to={`/products/${productId}`} className="product-card__title">
          {product?.name || "Product"}
        </Link>

        <div className="rating-line">
          <span>★ {Number(product?.rating || 0).toFixed(1)}</span>
          <small>{Number(product?.numReviews || 0)} reviews</small>
        </div>

        <div className="price-line">
          <strong>{formatPrice(price)}</strong>
          {originalPrice > price && <del>{formatPrice(originalPrice)}</del>}
        </div>

        <div className="product-card__actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={Number(product?.stock || 0) <= 0}
          >
            Add to Cart
          </button>
          <Link to={`/products/${productId}`} className="btn btn-ghost btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;