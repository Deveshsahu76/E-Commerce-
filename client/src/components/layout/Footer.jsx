import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Link to="/" className="footer__brand">
            <span className="navbar__brand-icon">S</span>
            <span>ShopSphere</span>
          </Link>
          <p>
            A modern MERN e-commerce store built for fast shopping, secure checkout,
            and scalable product discovery.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Create Account</Link>
        </div>

        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <h4>Trust</h4>
          <p>Secure payments</p>
          <p>Fast delivery</p>
          <p>Quality products</p>
        </div>
      </div>

      <div className="footer__bottom">
        © {new Date().getFullYear()} ShopSphere. Built with MERN stack.
      </div>
    </footer>
  );
};

export default Footer;