import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../utils/cartUtils";

const formatPrice = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getImage = (product = {}) => {
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }

  if (product.image) return product.image;
  if (product.imageUrl) return product.imageUrl;

  return "https://placehold.co/700x700/f7faf5/1f7a4d?text=Repellent+Product";
};

const ProductCard = ({ product = {} }) => {
  const navigate = useNavigate();

  const id = product._id || product.id;
  const name = product.name || "Repellent Product";
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.mrp || 0);
  const stock = Number(product.stock || 0);
  const description =
    product.shortDescription ||
    product.description ||
    "Outdoor protection product for home, garden and farm use.";

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate("/checkout");
  };

  return (
    <article className="rep-product-card">
      <Link to={`/products/${id}`} className="rep-product-card__image">
        <img
          src={getImage(product)}
          alt={name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/700x700/f7faf5/1f7a4d?text=Repellent+Product";
          }}
        />
      </Link>

      <div className="rep-product-card__body">
        <div className="rep-product-card__meta">
          <span>{product.category || "Repellent Product"}</span>
          <small className={stock > 0 ? "in" : "out"}>
            {stock > 0 ? "In Stock" : "Out of Stock"}
          </small>
        </div>

        <Link to={`/products/${id}`} className="rep-product-card__title">
          {name}
        </Link>

        <p className="rep-product-card__desc">{description}</p>

        <div className="rep-product-card__price">
          <strong>{formatPrice(price)}</strong>
          {originalPrice > price ? <del>{formatPrice(originalPrice)}</del> : null}
        </div>

        <div className="rep-product-card__actions">
          <button type="button" onClick={handleAddToCart} disabled={stock <= 0}>
            Add to Cart
          </button>
          <button type="button" onClick={handleBuyNow} disabled={stock <= 0}>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;