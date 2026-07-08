import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { calculateDiscount } from "../../utils/money";
import { storefrontContent } from "../../data/storefrontContent";

const ProductRail = ({ eyebrow, title, subtitle, products, to }) => {
  if (!products.length) return null;

  return (
    <section className="ss-section">
      <div className="ss-section__head">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <Link to={to}>View all</Link>
      </div>

      <div className="ss-product-rail">
        {products.map((product) => (
          <div className="ss-product-rail__item" key={product._id || product.id}>
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
        const response = await storefrontApi.getProducts({ page: 1, limit: 18 });
        const normalized = normalizeProductsResponse(response);

        if (mounted) {
          setProducts(normalized.products || []);
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
    return products
      .filter((product) => calculateDiscount(product) > 0 || product.offerTitle)
      .slice(0, 8);
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
    <main className="ss-home">
      <section className="ss-hero">
        <div className="container ss-hero__grid">
          <div className="ss-hero__content">
            <span className="ss-eyebrow">{storefrontContent.hero.eyebrow}</span>
            <h1>{storefrontContent.hero.title}</h1>
            <p>{storefrontContent.hero.subtitle}</p>

            <div className="ss-hero__actions">
              <Link className="ss-btn ss-btn--primary" to={storefrontContent.hero.primaryCta.link}>
                {storefrontContent.hero.primaryCta.label}
              </Link>

              <Link className="ss-btn ss-btn--light" to={storefrontContent.hero.secondaryCta.link}>
                {storefrontContent.hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="ss-hero__visual">
            <div className="ss-device-mockup">
              <div className="ss-device-mockup__top"></div>
              <div className="ss-device-mockup__body"></div>
              <div className="ss-device-mockup__waves">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="ss-visual-card">
              <span>Outdoor Safety</span>
              <strong>Solar and ultrasonic protection devices</strong>
              <p>Made for gardens, lawns, farms and home surroundings.</p>
            </div>

            <div className="ss-category-cloud">
              {storefrontContent.categories.map((category) => (
                <Link to={`/products?keyword=${encodeURIComponent(category)}`} key={category}>
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ss-trust">
        <div className="container ss-trust__grid">
          {storefrontContent.trustCards.map((item) => (
            <div className="ss-trust-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container ss-feature-strip">
        <div>
          <span className="ss-eyebrow">Product Focus</span>
          <h2>Built for pest control, outdoor safety and garden protection products.</h2>
          <p>
            Product cards show full product images, readable names, clear price and direct cart action.
          </p>
        </div>
        <Link className="ss-btn ss-btn--primary" to="/products">Browse Store</Link>
      </section>

      <div className="container">
        {status === "loading" ? (
          <section className="ss-section">
            <div className="ss-section__head">
              <div>
                <span>Loading Products</span>
                <h2>Preparing protection products</h2>
              </div>
            </div>
            <LoadingGrid count={4} />
          </section>
        ) : null}

        {status === "error" ? (
          <div className="ss-empty">
            <h2>Products are taking longer to load</h2>
            <p>Please refresh after a few seconds. Free backend may take time to wake up.</p>
          </div>
        ) : null}

        {status === "success" ? (
          <>
            {deals.length > 0 ? (
              <ProductRail
                eyebrow="Today’s Picks"
                title="Recommended protection devices"
                subtitle="Offer and promoted products can appear here when enabled."
                products={deals}
                to="/offers"
              />
            ) : null}

            <ProductRail
              eyebrow="Featured Products"
              title="Popular pest control products"
              subtitle="Browse solar, ultrasonic and outdoor protection products."
              products={featured}
              to="/products"
            />

            <ProductRail
              eyebrow="New Arrivals"
              title="Recently added devices"
              subtitle="Fresh products for home, farm, garden and outdoor spaces."
              products={latest}
              to="/new-arrivals"
            />

            <ProductRail
              eyebrow="Best Sellers"
              title="Most preferred products"
              subtitle="Products customers are more likely to trust and buy."
              products={bestSellers}
              to="/best-sellers"
            />
          </>
        ) : null}
      </div>

      <section className="ss-support">
        <div className="container ss-support__card">
          <div>
            <span className="ss-eyebrow">Customer Care</span>
            <h2>Need help choosing the right protection device?</h2>
            <p>Customers can contact support for order, delivery and product usage help.</p>
          </div>

          <div className="ss-support__actions">
            <Link className="ss-btn ss-btn--primary" to="/support">Get Support</Link>
            <Link className="ss-btn ss-btn--light" to="/track-order">Track Order</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;