import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../../components/common/ProductCard";
import SectionTitle from "../../components/common/SectionTitle";
import { productApi } from "../../services/ecommerceApi";
import { addProductToCart } from "../../utils/cartStorage";

const fallbackImage =
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80";

const getImages = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images;
  }

  if (product?.image) return [product.image];

  return [fallbackImage];
};

const getCategoryName = (product) => {
  if (typeof product?.category === "string") return product.category;
  return product?.category?.name || "Featured";
};

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(fallbackImage);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState("");

  const images = useMemo(() => getImages(product), [product]);
  const stock = Number(product?.stock || 0);
  const isOutOfStock = stock <= 0;

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await productApi.getById(id);
        const selectedProduct = data?.product || data;
        setProduct(selectedProduct);
        setActiveImage(getImages(selectedProduct)[0]);
        setQuantity(1);
      } catch (err) {
        setError(err?.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id]);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      setRelatedLoading(true);

      try {
        const { data } = await productApi.getAll();
        const productList = Array.isArray(data?.products) ? data.products : [];

        setRelatedProducts(
          productList
            .filter((item) => item?._id !== id)
            .filter((item) => getCategoryName(item) === getCategoryName(product))
            .slice(0, 3)
        );
      } catch (err) {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    if (product?._id) loadRelatedProducts();
  }, [id, product]);

  const handleQuantityChange = (type) => {
    setQuantity((current) => {
      if (type === "minus") return Math.max(1, current - 1);
      return Math.min(stock || 1, current + 1);
    });
  };

  const handleAddToCart = () => {
    try {
      if (!product) return;

      if (isOutOfStock) {
        toast.error("This product is currently out of stock");
        return;
      }

      addProductToCart(product, quantity);
      toast.success("Product added to cart");
    } catch (err) {
      toast.error(err?.message || "Unable to add product to cart");
    }
  };

  const handleBuyNow = () => {
    try {
      if (!product) return;

      if (isOutOfStock) {
        toast.error("This product is currently out of stock");
        return;
      }

      addProductToCart(product, quantity);
      navigate("/checkout");
    } catch (err) {
      toast.error(err?.message || "Unable to continue checkout");
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <div className="product-detail-skeleton" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="container">
          <div className="empty-state">
            <h3>{error}</h3>
            <p>Product details could not be loaded right now.</p>
            <Link to="/products" className="btn">
              Back to products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  return (
    <main>
      <section className="product-detail-section">
        <div className="container product-detail-grid">
          <div className="product-gallery">
            <div className="product-gallery__main">
              <img src={activeImage} alt={product.name} />
              <span className="product-gallery__badge">
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>

            <div className="product-gallery__thumbs">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={activeImage === image ? "active" : ""}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-detail-info">
            <Link to="/products" className="link-arrow">
              ← Back to products
            </Link>

            <span className="eyebrow">{getCategoryName(product)}</span>
            <h1>{product.name}</h1>

            <div className="product-detail-info__meta">
              <span>⭐ {Number(product?.rating || 0).toFixed(1)} rating</span>
              <span>{stock} items available</span>
            </div>

            <p className="product-detail-info__desc">
              {product.description ||
                "A carefully selected product with a clean buying experience."}
            </p>

            <div className="product-detail-price">
              <strong>{formatPrice(product.price)}</strong>
              <span>Inclusive of all taxes</span>
            </div>

            <div className="product-quantity">
              <span>Quantity</span>
              <div className="quantity-stepper">
                <button
                  type="button"
                  onClick={() => handleQuantityChange("minus")}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() => handleQuantityChange("plus")}
                  disabled={isOutOfStock || quantity >= stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-detail-actions">
              <button
                type="button"
                className="btn btn--large"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="btn btn--light btn--large"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                Buy Now
              </button>
            </div>

            <div className="product-trust-list">
              <div>
                <span>🔒</span>
                <p>Secure checkout ready</p>
              </div>
              <div>
                <span>🚚</span>
                <p>Fast delivery flow</p>
              </div>
              <div>
                <span>↩️</span>
                <p>Easy order tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionTitle
            eyebrow="Details"
            title="Product information"
            text="This section makes the product page look more trustworthy and complete."
          />

          <div className="product-info-grid">
            <div>
              <h3>Highlights</h3>
              <ul>
                <li>Clean product buying flow</li>
                <li>Stock-aware quantity selector</li>
                <li>Cart-ready localStorage integration</li>
                <li>Checkout-ready structure</li>
              </ul>
            </div>

            <div>
              <h3>Shipping & support</h3>
              <ul>
                <li>Order status support can be added from backend</li>
                <li>Payment verification will be connected with Razorpay</li>
                <li>Admin inventory updates will control stock</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {!relatedLoading && relatedProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle
              eyebrow="Related"
              title="You may also like"
              text="Related products from the same category."
            />

            <div className="grid products-grid">
              {relatedProducts.map((item) => (
                <ProductCard product={item} key={item._id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;