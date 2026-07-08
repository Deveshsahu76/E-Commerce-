import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../../utils/cartUtils";
import { calculateDiscount, formatPrice, getProductImage } from "../../utils/money";
import { isInWishlist, toggleWishlist } from "../../utils/wishlistUtils";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const productId = product?._id || product?.id;
  const discount = calculateDiscount(product || {});
  const image = getProductImage(product || {});
  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || product?.mrp || 0);
  const stock = Number(product?.stock || 0);
  const rating = Number(product?.rating || 4);
  const description = product?.shortDescription || product?.description || "";

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
    <article className="ss-product-card">
      <div className="ss-product-card__image">
        {discount > 0 ? <span className="ss-discount">{discount}% off</span> : null}

        <button
          type="button"
          className={`ss-wishlist ${saved ? "active" : ""}`}
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
                "https://placehold.co/600x600/f5f7f2/1f4d2b?text=ShopSphere";
            }}
          />
        </Link>
      </div>

      <div className="ss-product-card__body">
        <div className="ss-product-card__meta">
          <span>{product?.brand || "Protection Device"}</span>
          <small className={stock > 0 ? "in" : "out"}>
            {stock > 0 ? "In stock" : "Out of stock"}
          </small>
        </div>

        <Link className="ss-product-card__title" to={`/products/${productId}`}>
          {product?.name || "Product"}
        </Link>

        {description ? (
          <p className="ss-product-card__desc">
            {description}
          </p>
        ) : null}

        <div className="ss-product-rating">
          <span>{"★".repeat(Math.max(1, Math.min(5, Math.round(rating))))}</span>
          <small>{rating.toFixed(1)}</small>
        </div>

        <div className="ss-product-price">
          <strong>{formatPrice(price)}</strong>
          {originalPrice > price ? <del>{formatPrice(originalPrice)}</del> : null}
        </div>

        <p className="ss-product-note">Suitable for outdoor protection use</p>

        <div className="ss-product-actions">
          <button
            type="button"
            className="ss-card-btn ss-card-btn--cart"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            Add to Cart
          </button>

          <button
            type="button"
            className="ss-card-btn ss-card-btn--buy"
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