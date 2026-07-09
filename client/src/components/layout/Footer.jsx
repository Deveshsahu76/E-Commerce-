import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand footer-logo" to="/">
            <span className="brand-mark">S</span>
            <span>
              <strong>SonicRaksha</strong>
              <small>Premium Store</small>
            </span>
          </Link>
          <p>
            Discover quality products, smooth ordering, secure checkout, and friendly support
            for a trusted shopping experience.
          </p>
          <div className="social-row">
            <a href="/" aria-label="Instagram">Instagram</a>
            <a href="/" aria-label="Facebook">Facebook</a>
            <a href="/" aria-label="WhatsApp">WhatsApp</a>
          </div>
        </div>

        <div>
          <h3>Shop</h3>
          <Link to="/products">All Products</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/new-arrivals">New Arrivals</Link>
          <Link to="/best-sellers">Best Sellers</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>

        <div>
          <h3>Customer Care</h3>
          <Link to="/contact">Contact</Link>
          <Link to="/support">Support</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/track-order">Track Order</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div>
          <h3>Policies</h3>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/return-refund-policy">Return & Refund Policy</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-conditions">Terms & Conditions</Link>
          <Link to="/cancellation-policy">Cancellation Policy</Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <span> {new Date().getFullYear()} SonicRaksha. All rights reserved.</span>
        <span>Secure Checkout  Quality Products  Customer Support</span>
      </div>
    </footer>
  );
};

export default Footer;