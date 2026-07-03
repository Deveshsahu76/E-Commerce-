import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          ShopSphere
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/products" className="text-slate-600 hover:text-slate-900">
            Shop
          </Link>
          <Link to="/about" className="text-slate-600 hover:text-slate-900">
            About
          </Link>
          <Link to="/blog" className="text-slate-600 hover:text-slate-900">
            Blog
          </Link>
          <Link to="/contact" className="text-slate-600 hover:text-slate-900">
            Contact
          </Link>
          <Link to="/checkout" className="rounded-2xl bg-slate-900 px-3 py-2 text-white text-sm hover:bg-slate-800">
            Checkout
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
