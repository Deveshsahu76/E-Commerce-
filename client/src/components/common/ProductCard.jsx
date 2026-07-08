import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../../utils/cartUtils";
import { calculateDiscount, formatPrice, getProductImage } from "../../utils/money";
import { isInWishlist, toggleWishlist } from "../../utils/wishlistUtils";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const productId = product?._id || product?.id;
  const discount = calculateDiscount(product);
  const originalPrice = Number(product?.originalPrice || product?.mrp || 0);
  const price = Number(product?.price || 0);
  const image = getProductImage(product);
  const stock = Number(product?.stock || 0);
  const rating = Number(product?.rating || 0);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(productId));
  }, [productId]);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  const handleWishlist = () => {
    const result = toggleWishlist(product);
    setSaved(result.added);
  };

  return (
    <article className="market-card">
      <div className="market-card__media">
        {discount > 0 && <span className="market-badge">{discount}% off</span>}

        <button
          type="button"
          className={`market-wishlist ${saved ? "active" : ""}`}
          onClick={handleWishlist}
          aria-label="Save product"
        >
          {saved ? "♥" : "♡"}
        </button>

        <Link to={`/products/${productId}`}>
          <img
            src={image}
            alt={product?.name || "Product"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80";
            }}
          />
        </Link>
      </div>

      <div className="market-card__body">
        <div className="market-card__brand">
          <span>{product?.brand || "ShopSphere"}</span>
          <span className={stock > 0 ? "market-stock in" : "market-stock out"}>
            {stock > 0 ? "In stock" : "Out of stock"}
          </span>
        </div>

        <Link className="market-card__title" to={`/products/${productId}`}>
          {product?.name || "Product"}
        </Link>

        <div className="market-rating">
          <span>{"★".repeat(Math.max(1, Math.round(rating || 4)))}</span>
          <small>{rating ? rating.toFixed(1) : "4.0"}</small>
          <small>({Number(product?.numReviews || 0)})</small>
        </div>

        <div className="market-price">
          <strong>{formatPrice(price)}</strong>
          {originalPrice > price && <del>{formatPrice(originalPrice)}</del>}
        </div>

        <p className="market-delivery">Fast delivery available</p>

        <div className="market-actions">
          <button
            type="button"
            className="market-btn market-btn--cart"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            Add to Cart
          </button>
          <button
            type="button"
            className="market-btn market-btn--buy"
            onClick={handleBuyNow}
            disabled={stock <= 0}
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;