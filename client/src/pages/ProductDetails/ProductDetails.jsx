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
  const [activeImage, setActiveImage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setStatus("loading");

      try {
        const response = await storefrontApi.getProductById(id);
        const productData = response?.product || response?.data || response;

        const productsResponse = await storefrontApi.getProducts({ page: 1, limit: 6 });
        const relatedData = normalizeProductsResponse(productsResponse).products.filter(
          (item) => (item._id || item.id) !== (productData._id || productData.id)
        );

        if (mounted) {
          setProduct(productData);
          setRelated(relatedData);
          setActiveImage(getProductImage(productData));
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

  if (status === "loading") {
    return (
      <section className="market-details-page">
        <div className="container">
          <LoadingGrid count={4} />
        </div>
      </section>
    );
  }

  if (status === "error" || !product) {
    return (
      <section className="market-details-page">
        <div className="container">
          <div className="market-state">
            <h1>Product not available</h1>
            <p>This product may be unavailable or removed.</p>
            <Link to="/products">Back to Products</Link>
          </div>
        </div>
      </section>
    );
  }

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.mrp || 0);
  const stock = Number(product.stock || 0);
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : [getProductImage(product)];

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

  return (
    <section className="market-details-page">
      <div className="container">
        <div className="market-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>

        <div className="market-detail-shell">
          <div className="market-gallery">
            <div className="market-thumbs">
              {images.slice(0, 5).map((image) => (
                <button
                  type="button"
                  key={image}
                  className={activeImage === image ? "active" : ""}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt={product.name} />
                </button>
              ))}
            </div>

            <div className="market-main-image">
              <img src={activeImage || images[0]} alt={product.name} />
            </div>
          </div>

          <div className="market-detail-info">
            <span className="market-eyebrow">{product.brand || "ShopSphere"}</span>
            <h1>{product.name}</h1>

            <div className="market-detail-rating">
              <span>{"★".repeat(Math.max(1, Math.round(Number(product.rating || 4))))}</span>
              <strong>{Number(product.rating || 4).toFixed(1)}</strong>
              <small>{Number(product.numReviews || 0)} reviews</small>
              <small>{Number(product.sold || 0)} sold</small>
            </div>

            <div className="market-detail-price">
              <strong>{formatPrice(price)}</strong>
              {originalPrice > price && <del>{formatPrice(originalPrice)}</del>}
              {discount > 0 && <span>{discount}% off</span>}
            </div>

            {product.offerTitle && (
              <div className="market-offer-note">
                <strong>{product.offerTitle}</strong>
                {product.offerDescription && <p>{product.offerDescription}</p>}
              </div>
            )}

            <p className="market-detail-description">
              {product.shortDescription || product.description || "Quality product with smooth ordering and secure checkout support."}
            </p>

            <div className="market-detail-list">
              <div>
                <strong>Delivery</strong>
                <span>Fast delivery available for eligible locations.</span>
              </div>
              <div>
                <strong>Returns</strong>
                <span>Easy return support for eligible products.</span>
              </div>
              <div>
                <strong>Secure Payment</strong>
                <span>Pay using UPI, cards, net banking or wallets.</span>
              </div>
            </div>

            <div className="market-tabs-lite">
              <article>
                <h2>Highlights</h2>
                {Array.isArray(product.highlights) && product.highlights.length ? (
                  <ul>
                    {product.highlights.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <ul>
                    <li>Trusted product listing</li>
                    <li>Clear price and availability</li>
                    <li>Smooth checkout support</li>
                  </ul>
                )}
              </article>

              <article>
                <h2>Specifications</h2>
                {Array.isArray(product.specifications) && product.specifications.length ? (
                  <div>
                    {product.specifications.map((item) => (
                      <p key={`${item.key}-${item.value}`}>
                        <span>{item.key}</span>
                        <strong>{item.value}</strong>
                      </p>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p><span>Brand</span><strong>{product.brand || "ShopSphere"}</strong></p>
                    <p><span>Stock</span><strong>{stock > 0 ? "Available" : "Unavailable"}</strong></p>
                  </div>
                )}
              </article>
            </div>
          </div>

          <aside className="market-buy-box">
            <div className="market-buy-price">
              <strong>{formatPrice(price)}</strong>
              {discount > 0 && <span>{discount}% off</span>}
            </div>

            <p className="market-delivery-note">Fast delivery available</p>
            <p className={stock > 0 ? "market-buy-stock in" : "market-buy-stock out"}>
              {stock > 0 ? "In stock" : "Currently unavailable"}
            </p>

            <div className="market-qty">
              <span>Quantity</span>
              <div>
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <strong>{quantity}</strong>
                <button type="button" onClick={() => setQuantity((value) => Math.min(stock || 99, value + 1))}>+</button>
              </div>
            </div>

            <button
              type="button"
              className="market-btn market-btn--cart full"
              onClick={handleAdd}
              disabled={stock <= 0}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="market-btn market-btn--buy full"
              onClick={handleBuyNow}
              disabled={stock <= 0}
            >
              Buy Now
            </button>

            <button type="button" className="market-btn market-btn--save full" onClick={handleWishlist}>
              {saved ? "♥ Saved to Wishlist" : "♡ Add to Wishlist"}
            </button>

            <div className="market-buy-safe">
              <div>
                <strong>Secure transaction</strong>
                <span>Checkout protected with trusted payment options.</span>
              </div>
              <div>
                <strong>Support included</strong>
                <span>Get help for orders, delivery and returns.</span>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="market-section">
            <div className="market-section__head">
              <div>
                <span className="market-eyebrow">Related Products</span>
                <h2>You may also like</h2>
              </div>
              <Link to="/products">See more →</Link>
            </div>

            <div className="market-product-rail">
              {related.map((item) => (
                <div className="market-product-rail__item" key={item._id || item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;