import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";
import { calculateDiscount } from "../../utils/money";

const pageConfig = {
  offers: {
    eyebrow: "Best Offers",
    title: "Special offers on selected products.",
    intro: "Explore active deals and discounted products from the store.",
  },
  "new-arrivals": {
    eyebrow: "New Arrivals",
    title: "Fresh products added recently.",
    intro: "Browse the latest products listed in the store.",
  },
  "best-sellers": {
    eyebrow: "Best Sellers",
    title: "Popular products customers are choosing.",
    intro: "Discover products that are getting more customer interest.",
  },
};

const CollectionPage = ({ type }) => {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  const config = pageConfig[type] || pageConfig.offers;

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        const response = await storefrontApi.getProducts({ page: 1, limit: 24 });
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

  const filteredProducts = useMemo(() => {
    if (type === "offers") {
      return products.filter((product) => calculateDiscount(product) > 0 || product.offerTitle);
    }

    if (type === "best-sellers") {
      return [...products].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));
    }

    return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [products, type]);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.intro}</p>
        </div>

        {status === "loading" && <LoadingGrid count={8} />}

        {status === "error" && (
          <div className="state-card">
            <h2>Unable to load products</h2>
            <p>Please refresh and try again.</p>
          </div>
        )}

        {status === "success" && filteredProducts.length === 0 && (
          <div className="state-card spacious">
            <h2>No products available here yet</h2>
            <p>Explore all products while this section gets updated.</p>
            <Link className="btn btn-primary" to="/products">View Products</Link>
          </div>
        )}

        {status === "success" && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard product={product} key={product._id || product.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionPage;