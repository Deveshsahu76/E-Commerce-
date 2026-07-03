import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">ShopSphere</h3>
            <p className="mt-2 text-sm text-slate-600">Modern MERN store — built for demos and small shops.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link to="/products" className="hover:text-slate-900">Products</Link></li>
              <li><Link to="/about" className="hover:text-slate-900">About</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">From our Blog</h4>
            <div className="mt-3 text-sm text-slate-600">
              <p className="truncate">How we pick featured products: a quick guide to curating items that sell.</p>
              <Link to="/blog" className="mt-3 inline-block text-sm font-semibold text-slate-900">Read more →</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ShopSphere. Built with ❤️.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
