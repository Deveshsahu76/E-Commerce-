import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import SectionTitle from "../../components/common/SectionTitle";
import { productApi } from "../../services/ecommerceApi";

const getCategoryName = (product) => {
  if (typeof product?.category === "string") return product.category;
  return product?.category?.name || "Other";
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await productApi.getAll();
        const productList = Array.isArray(data?.products) ? data.products : [];
        setProducts(productList);
      } catch (err) {
        setError(err?.message || "Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => getCategoryName(product)));
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = products.filter((product) => {
      const name = product?.name?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";
      const categoryName = getCategoryName(product).toLowerCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        description.includes(keyword) ||
        categoryName.includes(keyword);

      const matchesCategory =
        category === "all" || categoryName === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      if (sort === "price-low") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "price-high") return Number(b.price || 0) - Number(a.price || 0);
      if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sort === "stock") return Number(b.stock || 0) - Number(a.stock || 0);

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [products, search, category, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setVisibleCount(12);
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Shop Collection</span>
          <h1>Explore products built for modern customers.</h1>
          <p>
            Search, filter, and sort products with a clean shopping experience.
            Backend pagination and advanced filters will be added in the API phase.
          </p>
        </div>
      </section>

      <section className="section products-page">
        <div className="container">
          <div className="section-row">
            <SectionTitle
              eyebrow="Products"
              title="All products"
              text={`${filteredProducts.length} product${
                filteredProducts.length === 1 ? "" : "s"
              } found`}
            />
            <Link to="/" className="link-arrow">
              ← Back to home
            </Link>
          </div>

          <div className="shop-toolbar">
            <div className="shop-toolbar__search">
              <label htmlFor="product-search">Search products</label>
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(12);
                }}
                placeholder="Search by name, description, category..."
              />
            </div>

            <div className="shop-toolbar__field">
              <label htmlFor="product-category">Category</label>
              <select
                id="product-category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setVisibleCount(12);
                }}
              >
                {categories.map((item) => (
                  <option value={item} key={item}>
                    {item === "all" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="shop-toolbar__field">
              <label htmlFor="product-sort">Sort by</label>
              <select
                id="product-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top rated</option>
                <option value="stock">Stock available</option>
              </select>
            </div>

            <button type="button" className="btn btn--ghost" onClick={resetFilters}>
              Reset
            </button>
          </div>

          {loading && (
            <div className="grid products-grid">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          )}

          {error && <div className="alert alert--error">{error}</div>}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>No matching products</h3>
              <p>Try changing your search keyword, category, or sorting option.</p>
              <button type="button" className="btn" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && visibleProducts.length > 0 && (
            <>
              <div className="grid products-grid">
                {visibleProducts.map((product) => (
                  <ProductCard product={product} key={product._id} />
                ))}
              </div>

              {visibleProducts.length < filteredProducts.length && (
                <div className="load-more-wrap">
                  <button
                    type="button"
                    className="btn btn--large"
                    onClick={() => setVisibleCount((count) => count + 12)}
                  >
                    Load more products
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Products;