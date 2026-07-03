import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto py-16 px-4">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <p className="text-red-500">{error}</p>
        <Link to="/products" className="text-slate-900 hover:text-slate-700">
          Back to products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white shadow-lg">
          <img src={product.images?.[0] || "https://via.placeholder.com/640x480"} alt={product.name} className="h-[420px] w-full object-cover" />
          <div className="p-8">
            <h1 className="text-3xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-slate-600">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>Category: {product.category?.name || "Unknown"}</span>
              <span>Stock: {product.stock}</span>
              <span>Rating: {product.rating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Price</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">${product.price.toFixed(2)}</p>
            </div>
            <button className="w-full rounded-2xl bg-slate-900 px-6 py-4 text-white transition hover:bg-slate-800">
              Add to cart
            </button>
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
              <p>Products are stored in MongoDB with a backend API running at /api.</p>
            </div>
            <Link to="/products" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-slate-700">
              ← Back to products
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetails;
