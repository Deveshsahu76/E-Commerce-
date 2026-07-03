import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products");
        setFeatured(data.products.slice(0, 3));
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="text-4xl font-semibold text-slate-900">Welcome to ShopSphere</h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Discover products stored directly in MongoDB, with a working API backend and React frontend.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800"
            >
              Browse Products
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-900 transition hover:bg-slate-50"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl bg-slate-900 p-10 text-white shadow-lg">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          {loading && <p className="text-slate-300">Loading featured products...</p>}
          {error && <p className="text-red-300">{error}</p>}
          <div className="space-y-4">
            {featured.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="block rounded-3xl bg-slate-800 p-5 transition hover:bg-slate-700"
              >
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-300 line-clamp-2">{product.description}</p>
                <p className="mt-3 text-sm text-slate-400">Price: ${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
