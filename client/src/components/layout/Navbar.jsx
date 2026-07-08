import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getCartCount } from "../../utils/cartUtils";
import { getUser, isLoggedIn, logout } from "../../utils/authUtils";

const navItems = [
  { label: "Products", to: "/products" },
  { label: "Offers", to: "/offers" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Best Sellers", to: "/best-sellers" },
  { label: "Support", to: "/support" },
  { label: "Track Order", to: "/track-order" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(getCartCount());
  const [user, setUser] = useState(getUser());

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
    return name ? name.split(" ")[0] : "Account";
  }, [user]);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (event) => {
    event.preventDefault();

    const value = search.trim();
    closeMenu();

    if (!value) {
      navigate("/products");
      return;
    }

    navigate(`/products?keyword=${encodeURIComponent(value)}`);
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth:updated"));
    closeMenu();
    navigate("/");
  };

  return (
    <>
      <header className="ss-header">
        <div className="container ss-header__inner">
          <Link to="/" className="ss-brand" onClick={closeMenu}>
            <span className="ss-brand__logo">S</span>
            <span className="ss-brand__text">
              <strong>ShopSphere</strong>
              <small>Premium Store</small>
            </span>
          </Link>

          <form className="ss-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products, brands and offers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <nav className="ss-actions">
            {isLoggedIn() ? (
              <div className="ss-user">
                <span>Hello,</span>
                <strong>{userName}</strong>
              </div>
            ) : (
              <Link to="/login" className="ss-action-link">
                <span>Account</span>
                <strong>Login</strong>
              </Link>
            )}

            <Link to="/orders" className="ss-action-link">
              <span>Your</span>
              <strong>Orders</strong>
            </Link>

            <Link to="/cart" className="ss-cart">
              <span>{cartCount}</span>
              <strong>Cart</strong>
            </Link>

            {!isLoggedIn() ? (
              <Link to="/register" className="ss-register">
                Register
              </Link>
            ) : (
              <button type="button" className="ss-logout" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>

          <button
            type="button"
            className="ss-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        <div className="ss-nav-row">
          <div className="container ss-nav-row__inner">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {menuOpen ? (
          <div className="ss-mobile-panel">
            <div className="container">
              <form className="ss-search ss-search--mobile" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search products"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search products"
                />
                <button type="submit">Search</button>
              </form>

              <div className="ss-mobile-links">
                {!isLoggedIn() ? (
                  <>
                    <Link to="/login" onClick={closeMenu}>Login</Link>
                    <Link to="/register" onClick={closeMenu}>Register</Link>
                  </>
                ) : (
                  <button type="button" onClick={handleLogout}>Logout</button>
                )}

                <Link to="/cart" onClick={closeMenu}>Cart ({cartCount})</Link>
                <Link to="/orders" onClick={closeMenu}>Orders</Link>

                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <nav className="ss-bottom-nav">
        <NavLink to="/"><span>Home</span></NavLink>
        <NavLink to="/products"><span>Products</span></NavLink>
        <NavLink to="/cart"><span>Cart</span></NavLink>
        <NavLink to="/orders"><span>Orders</span></NavLink>
        <NavLink to={isLoggedIn() ? "/orders" : "/login"}><span>Account</span></NavLink>
      </nav>
    </>
  );
};

export default Navbar;