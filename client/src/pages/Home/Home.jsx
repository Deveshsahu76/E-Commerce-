import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { storefrontContent, isRepellentProduct } from "../../data/storefrontContent";

const getCategoryKeyword = (category) => {
  return String(category || "")
    .replace("Repellers", "")
    .replace("Devices", "")
    .replace("Control", "rodent")
    .trim()
    .toLowerCase();
};

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
          setProducts(repellentProducts.length ? repellentProducts : allProducts);
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

  return (
    <main className="safe-home">
      <section className="safe-hero">
        <div className="safe-container safe-hero-grid">
          <div>
            <span>{storefrontContent.hero.eyebrow}</span>
            <h1>{storefrontContent.hero.title}</h1>
            <p>{storefrontContent.hero.subtitle}</p>

            <div className="safe-hero-actions">
              <Link to={storefrontContent.hero.primaryCta.link}>
                {storefrontContent.hero.primaryCta.label}
              </Link>
              <Link to={storefrontContent.hero.secondaryCta.link}>
                {storefrontContent.hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="safe-info-card">
            <h2>Product Categories</h2>

            <div className="safe-category-list">
              {storefrontContent.categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?keyword=${encodeURIComponent(getCategoryKeyword(category))}`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="safe-container safe-products-section">
        <div className="safe-section-head">
          <div>
            <span>Products</span>
            <h2>Available Repellent Products</h2>
            <p>Snake, solar, ultrasonic and rodent control products will appear here.</p>
          </div>

          <Link to="/products">View all</Link>
        </div>

        {status === "loading" && <LoadingGrid count={4} />}

        {status === "error" && (
          <div className="safe-empty">
            <h2>Unable to load products</h2>
            <p>Backend may be sleeping. Refresh after a few seconds.</p>
          </div>
        )}

        {status === "success" && products.length === 0 && (
          <div className="safe-empty">
            <h2>No products found</h2>
            <p>Add your snake repellent products in MongoDB.</p>
          </div>
        )}

        {status === "success" && products.length > 0 && (
          <div className="safe-product-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard product={product} key={product._id || product.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;