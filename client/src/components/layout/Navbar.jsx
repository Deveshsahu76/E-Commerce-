import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCartCount } from "../../utils/cartUtils";
import { getUser, isLoggedIn, logout } from "../../utils/authUtils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [user, setUser] = useState(getUser());
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("keyword") || params.get("q") || "");
  }, [location.search]);

  useEffect(() => {
    const sync = () => {
      setCartCount(getCartCount());
      setUser(getUser());
    };

    window.addEventListener("cart:updated", sync);
    window.addEventListener("auth:updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("cart:updated", sync);
      window.removeEventListener("auth:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const userName = useMemo(() => {
    const name = user?.name || user?.username || "";
    if (!name) return "Account";
    return name.split(" ")[0];
  }, [user]);

  const closeMenu = () => setOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();
    closeMenu();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?keyword=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <>
      <header className="commerce-header">
        <div className="commerce-header__main">
          <div className="container commerce-header__inner">
            <Link className="commerce-brand" to="/" onClick={closeMenu}>
              <span className="commerce-brand__mark">S</span>
              <span>
                <strong>ShopSphere</strong>
                <small>Premium Store</small>
              </span>
            </Link>

            <form className="commerce-search" onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, brands and offers"
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>

            <button
              type="button"
              className="commerce-menu-btn"
              onClick={() => setOpen((value) => !value)}
              aria-label="Open menu"
            >
              ☰
            </button>

            <div className={`commerce-actions ${open ? "show" : ""}`}>
              {isLoggedIn() ? (
                <div className="commerce-account">
                  <span>Hello, {userName}</span>
                  <button type="button" onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <div className="commerce-auth">
                  <Link to="/login" onClick={closeMenu}>
                    <span>Hello, sign in</span>
                    <strong>Account</strong>
                  </Link>
                  <Link className="commerce-register" to="/register" onClick={closeMenu}>
                    Register
                  </Link>
                </div>
              )}

              <Link className="commerce-action-link" to="/orders" onClick={closeMenu}>
                <span>Returns</span>
                <strong>& Orders</strong>
              </Link>

              <Link className="commerce-cart" to="/cart" onClick={closeMenu}>
                <span className="commerce-cart__count">{cartCount}</span>
                <strong>Cart</strong>
              </Link>
            </div>
          </div>

          <div className={`commerce-mobile-search ${open ? "show" : ""}`}>
            <form className="commerce-search" onSubmit={handleSearch}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>

        <nav className="commerce-subnav">
          <div className="container commerce-subnav__inner">
            <NavLink to="/products" onClick={closeMenu}>All Products</NavLink>
            <NavLink to="/offers" onClick={closeMenu}>Today's Deals</NavLink>
            <NavLink to="/offers" onClick={closeMenu}>Offers</NavLink>
            <NavLink to="/new-arrivals" onClick={closeMenu}>New Arrivals</NavLink>
            <NavLink to="/best-sellers" onClick={closeMenu}>Best Sellers</NavLink>
            <NavLink to="/support" onClick={closeMenu}>Customer Support</NavLink>
            <NavLink to="/track-order" onClick={closeMenu}>Track Order</NavLink>
          </div>
        </nav>
      </header>

      <nav className="bottom-quick-nav">
        <NavLink to="/">⌂<span>Home</span></NavLink>
        <NavLink to="/products">⌕<span>Products</span></NavLink>
        <NavLink to="/cart">🛒<span>Cart</span></NavLink>
        <NavLink to="/orders">▣<span>Orders</span></NavLink>
        <NavLink to={isLoggedIn() ? "/orders" : "/login"}>👤<span>Account</span></NavLink>
      </nav>
    </>
  );
};

export default Navbar;