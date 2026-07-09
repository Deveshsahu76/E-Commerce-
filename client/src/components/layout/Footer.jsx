import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="sonic-footer">
      <div className="container sonic-footer__grid">
        <div className="sonic-footer__brand">
          <div className="sonic-footer__logo">
            <img src="/SonicRaksha.png" alt="SonicRaksha" />
          </div>

          <h2>SonicRaksha</h2>
          <p className="sonic-footer__tagline">
            Smart Protection for Home & Farm
          </p>

          <p>
            SonicRaksha provides smart repellent products for homes, farms,
            gardens and outdoor protection needs.
          </p>
        </div>

        <div className="sonic-footer__col">
          <h3>Shop</h3>
          <Link to="/products">All Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div className="sonic-footer__col">
          <h3>Customer Care</h3>
          <Link to="/support">Support</Link>
          <Link to="/track-order">Track Order</Link>
          <Link to="/support">Contact Support</Link>
        </div>

        <div className="sonic-footer__col">
          <h3>Policies</h3>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/return-refund-policy">Return & Refund Policy</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-conditions">Terms & Conditions</Link>
        </div>
      </div>

      <div className="container sonic-footer__bottom">
        <p>2026 SonicRaksha. All rights reserved.</p>
        <p>Secure Checkout | Quality Products | Customer Support</p>
      </div>
    </footer>
  );
};

export default Footer;