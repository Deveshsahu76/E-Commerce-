import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products");
        setProducts(data.products);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Shop</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">All products</h1>
        </div>
        <Link to="/" className="text-slate-600 hover:text-slate-900">
          Back to home
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading products...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product._id} className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1">
            <div className="h-64 overflow-hidden bg-slate-100">
              <img src={product.images?.[0] || "https://via.placeholder.com/480x360"} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-900">${product.price.toFixed(2)}</span>
                <Link
                  to={`/products/${product._id}`}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
