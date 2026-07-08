import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("loading");
  const [filters, setFilters] = useState({
    keyword: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
    stock: "",
    offersOnly: false,
  });
  const [page, setPage] = useState(1);

  const apiSort = useMemo(() => {
    const map = {
      newest: "newest",
      "price-low": "price-low",
      "price-high": "price-high",
      rating: "rating",
      "best-sellers": "sold",
      discount: "discount",
    };

    return map[filters.sort] || "newest";
  }, [filters.sort]);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setStatus("loading");

      try {
        const response = await storefrontApi.getProducts({
          page,
          limit: 12,
          keyword: filters.keyword,
          sort: apiSort,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });

        const normalized = normalizeProductsResponse(response);

        if (mounted) {
          setProducts(normalized.products);
          setPagination(normalized.pagination);
          setStatus("success");
        }
      } catch {
        if (mounted) setStatus("error");
      }
    };

    const timer = setTimeout(loadProducts, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [filters.keyword, filters.minPrice, filters.maxPrice, apiSort, page]);

  const visibleProducts = useMemo(() => {
    let items = [...products];

    if (filters.stock === "in") {
      items = items.filter((product) => Number(product.stock || 0) > 0);
    }

    if (filters.offersOnly) {
      items = items.filter((product) => {
        const original = Number(product.originalPrice || product.mrp || 0);
        return original > Number(product.price || 0) || product.offerTitle;
      });
    }

    return items;
  }, [products, filters.stock, filters.offersOnly]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({
      keyword: "",
      sort: "newest",
      minPrice: "",
      maxPrice: "",
      stock: "",
      offersOnly: false,
    });
  };

  return (
    <section className="page-section products-page">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Shop Products</span>
          <h1>Browse products made for your everyday needs.</h1>
          <p>Search, filter, and choose quality products with a smooth shopping experience.</p>
        </div>

        <div className="products-layout">
          <aside className="filters-panel">
            <div className="filter-header">
              <h2>Filters</h2>
              <button type="button" onClick={clearFilters}>Clear</button>
            </div>

            <label>
              Search
              <input
                type="search"
                value={filters.keyword}
                onChange={(event) => updateFilter("keyword", event.target.value)}
                placeholder="Search products"
              />
            </label>

            <label>
              Sort by
              <select
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Discount</option>
              </select>
            </label>

            <div className="two-field">
              <label>
                Min Price
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter("minPrice", event.target.value)}
                  placeholder="₹ Min"
                />
              </label>
              <label>
                Max Price
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter("maxPrice", event.target.value)}
                  placeholder="₹ Max"
                />
              </label>
            </div>

            <label>
              Availability
              <select
                value={filters.stock}
                onChange={(event) => updateFilter("stock", event.target.value)}
              >
                <option value="">All Products</option>
                <option value="in">In Stock</option>
              </select>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={filters.offersOnly}
                onChange={(event) => updateFilter("offersOnly", event.target.checked)}
              />
              Offers only
            </label>
          </aside>

          <div className="products-content">
            <div className="listing-toolbar">
              <div>
                <strong>{visibleProducts.length}</strong>
                <span> products found</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            {status === "loading" && <LoadingGrid count={8} />}

            {status === "error" && (
              <div className="state-card">
                <h2>Unable to load products</h2>
                <p>Please refresh and try again.</p>
              </div>
            )}

            {status === "success" && visibleProducts.length === 0 && (
              <div className="state-card">
                <h2>No products found</h2>
                <p>Try changing your search or filters.</p>
              </div>
            )}

            {status === "success" && visibleProducts.length > 0 && (
              <>
                <div className="product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard product={product} key={product._id || product.id} />
                  ))}
                </div>

                <div className="pagination-row">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(value - 1, 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page || page} of {pagination.pages || 1}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page >= (pagination.pages || 1)}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;