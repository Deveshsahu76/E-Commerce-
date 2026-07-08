import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { calculateDiscount } from "../../utils/money";

const ProductRail = ({ eyebrow, title, subtitle, products, to }) => {
  if (!products.length) return null;

  return (
    <section className="market-section">
      <div className="market-section__head">
        <div>
          <span className="market-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Link to={to}>See more →</Link>
      </div>

      <div className="market-product-rail">
        {products.map((product) => (
          <div className="market-product-rail__item" key={product._id || product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const response = await storefrontApi.getProducts({ page: 1, limit: 16 });
        const normalized = normalizeProductsResponse(response);

        if (mounted) {
          setProducts(normalized.products);
          setStatus("success");
        }
      } catch {
        if (mounted) setStatus("error");
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const featured = useMemo(() => {
    const items = products.filter((product) => product.isFeatured);
    return (items.length ? items : products).slice(0, 8);
  }, [products]);

  const deals = useMemo(() => {
    const items = products.filter((product) => calculateDiscount(product) > 0 || product.offerTitle);
    return (items.length ? items : products).slice(0, 8);
  }, [products]);

  const latest = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
      .slice(0, 8);
  }, [products]);

  return (
    <div className="market-home">
      <section className="market-hero">
        <div className="container market-hero__grid">
          <div className="market-hero__copy">
            <span className="market-eyebrow">Secure Checkout • Fast Ordering • Best Offers</span>
            <h1>Shop premium products with deals made for everyday buyers.</h1>
            <p>
              Discover quality products, compare prices quickly, add to cart smoothly,
              and checkout with trusted payment options.
            </p>

            <div className="market-hero__actions">
              <Link className="market-cta market-cta--primary" to="/products">Shop Now</Link>
              <Link className="market-cta market-cta--secondary" to="/offers">Explore Deals</Link>
            </div>

            <div className="market-hero__mini">
              <div>
                <strong>Secure</strong>
                <span>Payments</span>
              </div>
              <div>
                <strong>Fast</strong>
                <span>Delivery Support</span>
              </div>
              <div>
                <strong>Easy</strong>
                <span>Returns Help</span>
              </div>
            </div>
          </div>

          <div className="market-hero__visual">
            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=85"
              alt="Premium shopping experience"
            />
            <div className="market-floating-deal">
              <span>Today’s Deal</span>
              <strong>Special prices on selected products</strong>
              <Link to="/offers">View deals</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="market-benefits">
        <div className="container market-benefits__grid">
          <div>
            <strong>Secure Checkout</strong>
            <span>Pay with trusted payment options</span>
          </div>
          <div>
            <strong>Fast Ordering</strong>
            <span>Quick cart and checkout flow</span>
          </div>
          <div>
            <strong>Quality Products</strong>
            <span>Clear product details and pricing</span>
          </div>
          <div>
            <strong>Customer Support</strong>
            <span>Help for orders, returns and payments</span>
          </div>
        </div>
      </section>

      <section className="container market-deal-banner">
        <div>
          <span className="market-eyebrow">Deal Zone</span>
          <h2>Today’s Deals are ready for your customers.</h2>
          <p>Highlight offers, fast-moving products, and best-value items in one premium section.</p>
        </div>
        <Link className="market-cta market-cta--light" to="/offers">Shop Deals</Link>
      </section>

      <div className="container">
        {status === "loading" && (
          <section className="market-section">
            <div className="market-section__head">
              <div>
                <span className="market-eyebrow">Loading Products</span>
                <h2>Finding the best products for you</h2>
              </div>
            </div>
            <LoadingGrid count={4} />
          </section>
        )}

        {status === "error" && (
          <div className="market-state">
            <h2>Products are taking longer to load</h2>
            <p>Please refresh the page in a few seconds.</p>
          </div>
        )}

        {status === "success" && (
          <>
            <ProductRail
              eyebrow="Today's Deals"
              title="Fresh deals for quick shopping"
              subtitle="A marketplace-style row for high-converting offers."
              products={deals}
              to="/offers"
            />

            <ProductRail
              eyebrow="Featured Products"
              title="Recommended for customers"
              subtitle="Selected products to help customers start shopping."
              products={featured}
              to="/products"
            />

            <ProductRail
              eyebrow="New Arrivals"
              title="Recently added products"
              subtitle="Keep returning visitors engaged with fresh product listings."
              products={latest}
              to="/new-arrivals"
            />

            <ProductRail
              eyebrow="Best Sellers"
              title="Popular picks from the store"
              subtitle="Show products customers are choosing often."
              products={bestSellers}
              to="/best-sellers"
            />
          </>
        )}
      </div>

      <section className="market-support-strip">
        <div className="container market-support-strip__grid">
          <div>
            <span className="market-eyebrow">Need help?</span>
            <h2>Customer support for orders, payments and delivery.</h2>
            <p>Guide customers to get help quickly without leaving the shopping flow.</p>
          </div>
          <div className="market-support-actions">
            <Link className="market-cta market-cta--primary" to="/support">Customer Support</Link>
            <Link className="market-cta market-cta--secondary" to="/track-order">Track Order</Link>
          </div>
        </div>
      </section>

      <section className="market-newsletter">
        <div className="container market-newsletter__card">
          <div>
            <span className="market-eyebrow">Stay Updated</span>
            <h2>Get updates about new products and special offers.</h2>
            <p>Use this section later for customer retention and campaigns.</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="Enter your email" aria-label="Email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;