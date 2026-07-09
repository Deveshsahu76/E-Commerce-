import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartCount } from "../../utils/cartUtils";
import { getUser, isLoggedIn, logout } from "../../utils/authUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
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

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <header className="rep-header">
      <div className="rep-container rep-header__inner">
        <Link to="/" className="rep-logo" onClick={closeMenu}>
          <span className="brand-logo-img-wrap"><img src="/sonicraksha-logo.png" alt="SonicRaksha" /></span>
          <div>
            <strong>SonicRaksha</strong>
            <small>Smart Protection for Home & Farm</small>
          </div>
        </Link>

        <form className="rep-search" onSubmit={handleSearch}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search snake, solar, ultrasonic repellers"
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <nav className="rep-nav">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/support">Support</NavLink>
          <NavLink to="/track-order">Track Order</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/cart" className="rep-cart">Cart ({cartCount})</NavLink>

          {isLoggedIn() ? (
            <>
              <span className="rep-user">Hi, {firstName}</span>
              <button type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="rep-register">Register</NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          className="rep-menu"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Open menu"
        >
          Ã¢ËœÂ°
        </button>
      </div>

      {menuOpen ? (
        <div className="rep-mobile">
          <div className="rep-container">
            <form className="rep-search rep-search--mobile" onSubmit={handleSearch}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>

            <div className="rep-mobile__links">
              <Link to="/products" onClick={closeMenu}>Products</Link>
              <Link to="/support" onClick={closeMenu}>Support</Link>
              <Link to="/track-order" onClick={closeMenu}>Track Order</Link>
              <Link to="/orders" onClick={closeMenu}>Orders</Link>
              <Link to="/cart" onClick={closeMenu}>Cart ({cartCount})</Link>

              {isLoggedIn() ? (
                <button type="button" onClick={handleLogout}>Logout</button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>Login</Link>
                  <Link to="/register" onClick={closeMenu}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;