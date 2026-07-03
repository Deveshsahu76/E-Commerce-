import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCartCount } from "../../utils/cartStorage";
import { clearAuthData, getAuthUser } from "../../utils/authStorage";

const Navbar = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const closeMenu = () => setOpen(false);

  const refreshCartCount = () => {
    setCartCount(getCartCount());
  };

  const refreshAuthUser = () => {
    setUser(getAuthUser());
  };

  useEffect(() => {
    refreshCartCount();
    refreshAuthUser();

    window.addEventListener("cart-updated", refreshCartCount);
    window.addEventListener("auth-updated", refreshAuthUser);
    window.addEventListener("storage", refreshCartCount);
    window.addEventListener("storage", refreshAuthUser);

    return () => {
      window.removeEventListener("cart-updated", refreshCartCount);
      window.removeEventListener("auth-updated", refreshAuthUser);
      window.removeEventListener("storage", refreshCartCount);
      window.removeEventListener("storage", refreshAuthUser);
    };
  }, []);

  const handleLogout = () => {
    clearAuthData();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__brand-icon">S</span>
          <span>ShopSphere</span>
        </Link>

        <button
          className="navbar__toggle"
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>
          <NavLink to="/cart" onClick={closeMenu}>
            Cart
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/cart" className="cart-pill" aria-label="Open cart">
            🛒
            <span>{cartCount}</span>
          </Link>

          {user ? (
            <div className="user-menu">
              <span className="user-menu__avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <div>
                <strong>{user?.name || "User"}</strong>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Login
              </Link>
              <Link to="/register" className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;