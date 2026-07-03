import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/common/ProductCard";
import SectionTitle from "../../components/common/SectionTitle";

const categories = [
  {
    title: "Fashion",
    text: "Trending outfits and daily essentials.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Electronics",
    text: "Smart gadgets for work and lifestyle.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Home",
    text: "Useful picks for modern homes.",
    image:
      "https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&w=900&q=80",
  },
];

const stats = [
  { value: "10K+", label: "Monthly shoppers ready" },
  { value: "99.9%", label: "API uptime target" },
  { value: "24/7", label: "Store availability" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/products");
        const productList = Array.isArray(data?.products) ? data.products : [];
        setFeatured(productList.slice(0, 6));
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="eyebrow">MERN Commerce Platform</span>
            <h1>Build a premium online store your customers can trust.</h1>
            <p>
              ShopSphere combines a clean shopping experience, product discovery,
              fast checkout flow, and scalable APIs for real e-commerce use cases.
            </p>

            <div className="hero__actions">
              <Link to="/products" className="btn btn--large">
                Browse Products
              </Link>
              <Link to="/register" className="btn btn--light btn--large">
                Create Account
              </Link>
            </div>

            <div className="hero__stats">
              {stats.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__card hero__card--main">
              <img
                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80"
                alt="Online shopping"
              />
            </div>
            <div className="floating-card floating-card--top">
              <strong>Secure Checkout</strong>
              <span>Razorpay ready payment flow</span>
            </div>
            <div className="floating-card floating-card--bottom">
              <strong>Fast Product APIs</strong>
              <span>Search, filters, pagination</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Categories"
            title="Shop by popular categories"
            text="A cleaner discovery section helps users quickly understand what your store sells."
            align="center"
          />

          <div className="category-grid">
            {categories.map((category) => (
              <Link to="/products" className="category-card" key={category.title}>
                <img src={category.image} alt={category.title} />
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <div className="section-row">
            <SectionTitle
              eyebrow="Featured"
              title="Trending products"
              text="Products are loaded from your backend API."
            />
            <Link to="/products" className="link-arrow">
              View all →
            </Link>
          </div>

          {loading && (
            <div className="grid products-grid">
              {[1, 2, 3].map((item) => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          )}

          {error && <div className="alert alert--error">{error}</div>}

          {!loading && !error && featured.length === 0 && (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Add products from backend/admin to show featured products here.</p>
            </div>
          )}

          {!loading && featured.length > 0 && (
            <div className="grid products-grid">
              {featured.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container trust-grid">
          <div className="trust-card">
            <span>🚚</span>
            <h3>Fast Delivery</h3>
            <p>Optimized store flow for quick ordering and smooth fulfilment.</p>
          </div>
          <div className="trust-card">
            <span>🔒</span>
            <h3>Secure Payments</h3>
            <p>Ready for Razorpay order creation, verification, and order tracking.</p>
          </div>
          <div className="trust-card">
            <span>📦</span>
            <h3>Real Inventory</h3>
            <p>Stock-aware product pages help avoid fake or unavailable orders.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;