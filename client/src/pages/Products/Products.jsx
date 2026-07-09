import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import LoadingGrid from "../../components/common/LoadingGrid";
import { normalizeProductsResponse, storefrontApi } from "../../services/storefrontApi";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState("loading");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || searchParams.get("q") || "",
    sort: searchParams.get("sort") || "newest",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    stock: "",
    offersOnly: false,
  });

  useEffect(() => {
    const nextKeyword = searchParams.get("keyword") || searchParams.get("q") || "";
    setFilters((current) => ({ ...current, keyword: nextKeyword }));
    setPage(Number(searchParams.get("page") || 1));
  }, [searchParams]);

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

  const updateUrl = (next = {}) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));

    if (["keyword", "sort", "minPrice", "maxPrice"].includes(key)) {
      updateUrl({ [key]: value, page: 1 });
    }
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
    setSearchParams({});
  };

  const keywordText = filters.keyword ? `Search results for "${filters.keyword}"` : "All Products";

  return (
    <section className="market-products-page">
      <div className="container">
        <div className="market-listing-hero">
          <div>
            <span className="market-eyebrow">SonicRaksha Marketplace</span>
            <h1>{keywordText}</h1>
            <p>Browse products with quick filters, clear pricing, delivery support and smooth checkout.</p>
          </div>
        </div>

        <div className="market-products-layout">
          <aside className="market-filter">
            <div className="market-filter__head">
              <h2>Filters</h2>
              <button type="button" onClick={clearFilters}>Clear all</button>
            </div>

            <label>
              Search products
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
                <option value="newest">Newest arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
              </select>
            </label>

            <div className="market-filter__two">
              <label>
                Min price
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter("minPrice", event.target.value)}
                  placeholder=" Min"
                />
              </label>

              <label>
                Max price
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter("maxPrice", event.target.value)}
                  placeholder=" Max"
                />
              </label>
            </div>

            <label>
              Availability
              <select
                value={filters.stock}
                onChange={(event) => updateFilter("stock", event.target.value)}
              >
                <option value="">All products</option>
                <option value="in">In stock only</option>
              </select>
            </label>

            <label className="market-check">
              <input
                type="checkbox"
                checked={filters.offersOnly}
                onChange={(event) => updateFilter("offersOnly", event.target.checked)}
              />
              Show offers only
            </label>
          </aside>

          <div className="market-listing-content">
            <div className="market-sortbar">
              <div>
                <strong>{visibleProducts.length}</strong>
                <span> results</span>
                {filters.keyword && <small> for {filters.keyword}</small>}
              </div>

              <select
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
              >
                <option value="newest">Newest arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {status === "loading" && <LoadingGrid count={8} />}

            {status === "error" && (
              <div className="market-state">
                <h2>Unable to load products</h2>
                <p>Please refresh and try again.</p>
              </div>
            )}

            {status === "success" && visibleProducts.length === 0 && (
              <div className="market-state">
                <h2>No products found</h2>
                <p>Try changing your search, price range or filters.</p>
                <button type="button" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}

            {status === "success" && visibleProducts.length > 0 && (
              <>
                <div className="market-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard product={product} key={product._id || product.id} />
                  ))}
                </div>

                <div className="market-pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const nextPage = Math.max(page - 1, 1);
                      setPage(nextPage);
                      updateUrl({ page: nextPage });
                    }}
                  >
                    Previous
                  </button>

                  <span>Page {pagination.page || page} of {pagination.pages || 1}</span>

                  <button
                    type="button"
                    disabled={page >= (pagination.pages || 1)}
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      updateUrl({ page: nextPage });
                    }}
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