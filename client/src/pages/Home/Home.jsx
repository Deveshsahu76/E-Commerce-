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
    <section className="home-section">
      <div className="home-section__head">
        <div>
          <span className="home-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <Link to={to} className="home-section__link">
          View More →
        </Link>
      </div>

      <div className="home-product-rail">
        {products.map((product) => (
          <div className="home-product-rail__item" key={product._id || product.id}>
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

    const fetchProducts = async () => {
      try {
        const response = await storefrontApi.getProducts({ page: 1, limit: 18 });
        const normalized = normalizeProductsResponse(response);

        if (mounted) {
          setProducts(normalized.products || []);
          setStatus("success");
        }
      } catch (error) {
        if (mounted) {
          setStatus("error");
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.isFeatured);
    return (featured.length ? featured : products).slice(0, 8);
  }, [products]);

  const latestProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 8);
  }, [products]);

  const bestSellerProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
      .slice(0, 8);
  }, [products]);

  const offerProducts = useMemo(() => {
    const discounted = products.filter(
      (product) => calculateDiscount(product) > 0 || product.offerTitle
    );
    return discounted.slice(0, 8);
  }, [products]);

  return (
    <div className="store-home">
      <section className="store-hero">
        <div className="container store-hero__grid">
          <div className="store-hero__content">
            <span className="home-eyebrow">{storefrontContent.hero.eyebrow}</span>
            <h1>{storefrontContent.hero.title}</h1>
            <p>{storefrontContent.hero.subtitle}</p>

            <div className="store-hero__actions">
              <Link
                to={storefrontContent.hero.primaryCta.link}
                className="store-btn store-btn--primary"
              >
                {storefrontContent.hero.primaryCta.label}
              </Link>

              <Link
                to={storefrontContent.hero.secondaryCta.link}
                className="store-btn store-btn--secondary"
              >
                {storefrontContent.hero.secondaryCta.label}
              </Link>
            </div>

            <div className="store-hero__highlights">
              {storefrontContent.topHighlights.map((item) => (
                <div key={item.title} className="store-hero__highlight">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="store-hero__visual">
            <img
              src={storefrontContent.hero.image}
              alt="Premium shopping experience"
            />

            {storefrontContent.heroPromo.enabled ? (
              <div className="store-hero__promo">
                <span>{storefrontContent.heroPromo.badge}</span>
                <strong>{storefrontContent.heroPromo.title}</strong>
                <p>{storefrontContent.heroPromo.description}</p>
                <Link to={storefrontContent.heroPromo.ctaLink}>
                  {storefrontContent.heroPromo.ctaLabel}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="store-trust-grid">
        <div className="container store-trust-grid__inner">
          {storefrontContent.trustCards.map((item) => (
            <div key={item.title} className="store-trust-card">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container store-feature-banner">
        <div>
          <span className="home-eyebrow">Storefront Experience</span>
          <h2>Showcase products in a clean and customer-friendly way.</h2>
          <p>
            Keep the homepage modern, easy to browse, and focused on conversions.
          </p>
        </div>

        <Link to="/products" className="store-btn store-btn--secondary">
          Browse Store
        </Link>
      </section>

      <div className="container">
        {status === "loading" ? (
          <section className="home-section">
            <div className="home-section__head">
              <div>
                <span className="home-eyebrow">Loading Products</span>
                <h2>Fetching products for your storefront</h2>
              </div>
            </div>
            <LoadingGrid count={4} />
          </section>
        ) : null}

        {status === "error" ? (
          <div className="store-empty-state">
            <h2>Products are taking a little longer to load</h2>
            <p>Please refresh the page after a few seconds.</p>
          </div>
        ) : null}

        {status === "success" ? (
          <>
            {offerProducts.length > 0 ? (
              <ProductRail
                eyebrow="Today’s Picks"
                title="Special selections for quick shopping"
                subtitle="Promoted products and highlighted offers can appear here when available."
                products={offerProducts}
                to="/offers"
              />
            ) : null}

            <ProductRail
              eyebrow="Featured Products"
              title="Products worth highlighting"
              subtitle="Show important or promoted products with a premium presentation."
              products={featuredProducts}
              to="/products"
            />

            <ProductRail
              eyebrow="New Arrivals"
              title="Recently added products"
              subtitle="Help customers discover what’s new in the store."
              products={latestProducts}
              to="/new-arrivals"
            />

            <ProductRail
              eyebrow="Best Sellers"
              title="Products customers love"
              subtitle="Use popular products to build trust and improve conversions."
              products={bestSellerProducts}
              to="/best-sellers"
            />
          </>
        ) : null}
      </div>

      <section className="store-support-strip">
        <div className="container store-support-strip__inner">
          <div>
            <span className="home-eyebrow">Store Promise</span>
            <h2>{storefrontContent.supportingStrip.title}</h2>
            <p>{storefrontContent.supportingStrip.description}</p>
          </div>

          <div className="store-support-strip__actions">
            <Link
              to={storefrontContent.supportingStrip.primaryCta.link}
              className="store-btn store-btn--primary"
            >
              {storefrontContent.supportingStrip.primaryCta.label}
            </Link>

            <Link
              to={storefrontContent.supportingStrip.secondaryCta.link}
              className="store-btn store-btn--secondary"
            >
              {storefrontContent.supportingStrip.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      <section className="store-newsletter">
        <div className="container store-newsletter__card">
          <div>
            <span className="home-eyebrow">Newsletter</span>
            <h2>{storefrontContent.newsletter.title}</h2>
            <p>{storefrontContent.newsletter.description}</p>
          </div>

          <form onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder={storefrontContent.newsletter.placeholder}
              aria-label="Email address"
            />
            <button type="submit">
              {storefrontContent.newsletter.buttonText}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;