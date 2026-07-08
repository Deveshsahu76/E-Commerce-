import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { calculateDiscount } from "../../utils/money";

const ProductSection = ({ eyebrow, title, subtitle, products, to }) => {
  if (!products.length) return null;

  return (
    <section className="home-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Link to={to} className="text-link">View all →</Link>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard product={product} key={product._id || product.id} />
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
        const response = await storefrontApi.getProducts({ page: 1, limit: 12 });
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
    return (items.length ? items : products).slice(0, 4);
  }, [products]);

  const latest = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
      .slice(0, 4);
  }, [products]);

  const offers = useMemo(() => {
    return products.filter((product) => calculateDiscount(product) > 0 || product.offerTitle).slice(0, 4);
  }, [products]);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Trusted Store • Smooth Ordering</span>
            <h1>Discover quality products at the best prices.</h1>
            <p>
              Shop trusted products with secure checkout, smooth ordering, and exciting offers.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/products">Shop Now</Link>
              <Link className="btn btn-ghost" to="/offers">View Offers</Link>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Secure</strong>
                <span>Checkout</span>
              </div>
              <div>
                <strong>Fast</strong>
                <span>Ordering</span>
              </div>
              <div>
                <strong>Easy</strong>
                <span>Support</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-main-card">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80"
                alt="Premium online shopping"
              />
              <div className="hero-offer-card">
                <span>Special Offers</span>
                <strong>Available on selected products</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div>
            <strong>Secure Checkout</strong>
            <span>Safe online payment options</span>
          </div>
          <div>
            <strong>Quality Products</strong>
            <span>Carefully listed items</span>
          </div>
          <div>
            <strong>Fast Support</strong>
            <span>Helpful customer assistance</span>
          </div>
          <div>
            <strong>Easy Returns</strong>
            <span>Simple support process</span>
          </div>
        </div>
      </section>

      <section className="container offer-banner">
        <div>
          <span className="eyebrow">Limited Time</span>
          <h2>Special offers available on selected products</h2>
          <p>Browse the latest deals and choose products that match your needs.</p>
        </div>
        <Link className="btn btn-light" to="/offers">Explore Offers</Link>
      </section>

      <div className="container">
        {status === "loading" && (
          <section className="home-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Featured Products</span>
                <h2>Products customers love</h2>
              </div>
            </div>
            <LoadingGrid count={4} />
          </section>
        )}

        {status === "error" && (
          <div className="state-card">
            <h2>Products are taking longer to load</h2>
            <p>Please refresh the page in a few seconds.</p>
          </div>
        )}

        {status === "success" && (
          <>
            <ProductSection
              eyebrow="Featured Products"
              title="Products customers love"
              subtitle="Explore handpicked products from the store."
              products={featured}
              to="/products"
            />

            <ProductSection
              eyebrow="Latest Products"
              title="Fresh arrivals for you"
              subtitle="Newly listed products ready to explore."
              products={latest}
              to="/new-arrivals"
            />

            <ProductSection
              eyebrow="Best Sellers"
              title="Popular picks"
              subtitle="Products customers are choosing often."
              products={bestSellers}
              to="/best-sellers"
            />

            <ProductSection
              eyebrow="Best Offers"
              title="Deals worth checking"
              subtitle="Save more on selected products."
              products={offers}
              to="/offers"
            />
          </>
        )}
      </div>

      <section className="why-section">
        <div className="container why-grid">
          <div>
            <span className="eyebrow">Why Shop With Us</span>
            <h2>Everything customers need for a smooth shopping experience.</h2>
            <p>
              From product discovery to checkout and order support, the store is built
              to keep shopping simple, clear, and reliable.
            </p>
          </div>
          <div className="why-cards">
            <article>
              <strong>Simple browsing</strong>
              <span>Find products quickly with clean listing and search.</span>
            </article>
            <article>
              <strong>Clear pricing</strong>
              <span>Product pricing and offers stay easy to understand.</span>
            </article>
            <article>
              <strong>Order support</strong>
              <span>Customers can track orders and get help when needed.</span>
            </article>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container newsletter-card">
          <div>
            <span className="eyebrow">Stay Updated</span>
            <h2>Get updates about new products and special offers.</h2>
            <p>Join the store updates list and never miss new arrivals.</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="email" placeholder="Enter your email" aria-label="Email" />
            <button className="btn btn-primary" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;