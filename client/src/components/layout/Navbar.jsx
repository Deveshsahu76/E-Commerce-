import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

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
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
          <NavLink to="/checkout" onClick={closeMenu}>
            Checkout
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="btn btn--ghost">
            Login
          </Link>
          <Link to="/register" className="btn">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;