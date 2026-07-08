import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartCount } from "../../utils/cartUtils";
import { getUser, isLoggedIn, logout } from "../../utils/authUtils";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">S</span>
          <span>
            <strong>ShopSphere</strong>
            <small>Premium Store</small>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`nav-links ${open ? "show" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
          <NavLink to="/offers" onClick={closeMenu}>Offers</NavLink>
          <NavLink to="/new-arrivals" onClick={closeMenu}>New Arrivals</NavLink>
          <NavLink to="/best-sellers" onClick={closeMenu}>Best Sellers</NavLink>
          <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
        </nav>

        <div className={`nav-actions ${open ? "show" : ""}`}>
          <Link className="cart-pill" to="/cart" onClick={closeMenu}>
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </Link>

          {isLoggedIn() ? (
            <div className="user-menu">
              <span>{user?.name || user?.username || "Account"}</span>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-actions">
              <Link className="btn btn-ghost btn-sm" to="/login" onClick={closeMenu}>Login</Link>
              <Link className="btn btn-primary btn-sm" to="/register" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;