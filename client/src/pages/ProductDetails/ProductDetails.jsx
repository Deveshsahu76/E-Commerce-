import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { addToCart } from "../../utils/cartUtils";
import { calculateDiscount, formatPrice, getProductImage } from "../../utils/money";
import { isInWishlist, toggleWishlist } from "../../utils/wishlistUtils";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setStatus("loading");

      try {
        const response = await storefrontApi.getProductById(id);
        const productData = response?.product || response?.data || response;

        const relatedResponse = await storefrontApi.getProducts({ page: 1, limit: 4 });
        const relatedData = normalizeProductsResponse(relatedResponse).products.filter(
          (item) => (item._id || item.id) !== (productData._id || productData.id)
        );

        if (mounted) {
          setProduct(productData);
          setRelated(relatedData);
          setSaved(isInWishlist(productData._id || productData.id));
          setStatus("success");
        }
      } catch {
        if (mounted) setStatus("error");
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const discount = useMemo(() => calculateDiscount(product || {}), [product]);
  const productId = product?._id || product?.id;

  const handleAdd = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleWishlist = () => {
    const result = toggleWishlist(product);
    setSaved(result.added);
  };

  if (status === "loading") {
    return (
      <section className="page-section">
        <div className="container">
          <LoadingGrid count={4} />
        </div>
      </section>
    );
  }

  if (status === "error" || !product) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="state-card">
            <h1>Product not available</h1>
            <p>This product may be unavailable or removed.</p>
            <Link className="btn btn-primary" to="/products">Back to Products</Link>
          </div>
        </div>
      </section>
    );
  }

  const originalPrice = Number(product.originalPrice || product.mrp || 0);
  const price = Number(product.price || 0);
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [getProductImage(product)];

  return (
    <section className="page-section product-details-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        <div className="product-detail-grid">
          <div className="gallery-card">
            <div className="main-product-image">
              <img src={images[0]} alt={product.name} />
            </div>
            <div className="thumb-row">
              {images.slice(0, 4).map((image) => (
                <img src={image} alt={product.name} key={image} />
              ))}
            </div>
          </div>

          <div className="product-detail-info">
            <span className="eyebrow">{product.brand || "Trusted Brand"}</span>
            <h1>{product.name}</h1>

            <div className="rating-line large">
              <span>★ {Number(product.rating || 0).toFixed(1)}</span>
              <small>{Number(product.numReviews || 0)} reviews</small>
              <small>{Number(product.sold || 0)} sold</small>
            </div>

            <div className="detail-price">
              <strong>{formatPrice(price)}</strong>
              {originalPrice > price && <del>{formatPrice(originalPrice)}</del>}
              {discount > 0 && <span className="discount-chip">{discount}% OFF</span>}
            </div>

            {product.offerTitle && (
              <div className="offer-note">
                <strong>{product.offerTitle}</strong>
                {product.offerDescription && <span>{product.offerDescription}</span>}
              </div>
            )}

            <p className="product-description">
              {product.shortDescription || product.description}
            </p>

            <div className="stock-row">
              <span className={Number(product.stock || 0) > 0 ? "stock in" : "stock out"}>
                {Number(product.stock || 0) > 0 ? "In stock" : "Out of stock"}
              </span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <div className="quantity-row">
              <span>Quantity</span>
              <div>
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  −
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(Number(product.stock || 99), value + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleAdd}
                disabled={Number(product.stock || 0) <= 0}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-dark"
                type="button"
                onClick={handleBuyNow}
                disabled={Number(product.stock || 0) <= 0}
              >
                Buy Now
              </button>
              <button className="btn btn-ghost" type="button" onClick={handleWishlist}>
                {saved ? "♥ Saved" : "♡ Wishlist"}
              </button>
            </div>

            <div className="trust-list">
              <div>
                <strong>Secure payments</strong>
                <span>Pay using UPI, cards, net banking, or wallets.</span>
              </div>
              <div>
                <strong>Shipping support</strong>
                <span>Delivery details are shown during checkout.</span>
              </div>
              <div>
                <strong>Easy return help</strong>
                <span>Support available for eligible return requests.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-tabs">
          <article>
            <h2>Description</h2>
            <p>{product.description || "Detailed product information will be updated soon."}</p>
          </article>

          <article>
            <h2>Highlights</h2>
            {Array.isArray(product.highlights) && product.highlights.length ? (
              <ul>
                {product.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <ul>
                <li>Quality product listing</li>
                <li>Smooth ordering experience</li>
                <li>Secure checkout support</li>
              </ul>
            )}
          </article>

          <article>
            <h2>Specifications</h2>
            {Array.isArray(product.specifications) && product.specifications.length ? (
              <div className="spec-table">
                {product.specifications.map((item) => (
                  <div key={`${item.key}-${item.value}`}>
                    <span>{item.key}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="spec-table">
                <div>
                  <span>Brand</span>
                  <strong>{product.brand || "Trusted Brand"}</strong>
                </div>
                <div>
                  <span>Availability</span>
                  <strong>{Number(product.stock || 0) > 0 ? "In stock" : "Out of stock"}</strong>
                </div>
              </div>
            )}
          </article>
        </div>

        {related.length > 0 && (
          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Related Products</span>
                <h2>You may also like</h2>
              </div>
              <Link className="text-link" to="/products">View all →</Link>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard product={item} key={item._id || item.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;