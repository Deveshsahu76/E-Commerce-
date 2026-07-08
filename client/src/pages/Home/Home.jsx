import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import {
  storefrontContent,
  getCategoryKeyword,
  isRepellentProduct,
} from "../../data/storefrontContent";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const response = await storefrontApi.getProducts({ page: 1, limit: 24 });
        const normalized = normalizeProductsResponse(response);
        const allProducts = normalized.products || [];
        const repellentProducts = allProducts.filter(isRepellentProduct);

        if (mounted) {
          setProducts(repellentProducts);
          setStatus("success");
        }
      } catch {
        if (mounted) {
          setStatus("error");
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="rep-home">
      <section className="rep-hero">
        <div className="rep-container rep-hero__grid">
          <div className="rep-hero__content">
            <span>{storefrontContent.hero.eyebrow}</span>
            <h1>{storefrontContent.hero.title}</h1>
            <p>{storefrontContent.hero.subtitle}</p>

            <div className="rep-hero__actions">
              <Link to={storefrontContent.hero.primaryCta.link}>
                {storefrontContent.hero.primaryCta.label}
              </Link>
              <Link to={storefrontContent.hero.secondaryCta.link}>
                {storefrontContent.hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <aside className="rep-category-panel">
            <h2>Product Categories</h2>

            <div className="rep-category-list">
              {storefrontContent.categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?keyword=${encodeURIComponent(getCategoryKeyword(category))}`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="rep-trust">
        <div className="rep-container rep-trust__grid">
          {storefrontContent.trustCards.map((item) => (
            <article key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rep-container rep-products-section">
        <div className="rep-section-head">
          <div>
            <span>Products</span>
            <h2>Available Repellent Products</h2>
            <p>Only snake, solar, ultrasonic and rodent control products are shown here.</p>
          </div>

          <Link to="/products">View all</Link>
        </div>

        {status === "loading" ? <LoadingGrid count={4} /> : null}

        {status === "error" ? (
          <div className="rep-empty">
            <h2>Unable to load products</h2>
            <p>Backend may be sleeping. Refresh after a few seconds.</p>
          </div>
        ) : null}

        {status === "success" && products.length === 0 ? (
          <div className="rep-empty">
            <h2>No repellent products found</h2>
            <p>
              Add snake repellent, solar repeller, ultrasonic or rodent control products
              in MongoDB/Admin panel.
            </p>
          </div>
        ) : null}

        {status === "success" && products.length > 0 ? (
          <div className="rep-product-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard product={product} key={product._id || product.id} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="rep-support">
        <div className="rep-container rep-support__card">
          <div>
            <span>Customer Support</span>
            <h2>Need help choosing the right repellent product?</h2>
            <p>Get help for product usage, orders, delivery and returns.</p>
          </div>

          <div>
            <Link to="/support">Get Support</Link>
            <Link to="/track-order">Track Order</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;