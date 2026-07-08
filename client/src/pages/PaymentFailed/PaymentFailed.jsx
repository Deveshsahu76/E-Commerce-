import { Link, useLocation } from "react-router-dom";

const PaymentFailed = () => {
  const location = useLocation();

  return (
    <section className="page-section">
      <div className="container">
        <div className="state-card spacious">
          <span className="empty-icon">!</span>
          <h1>Payment could not be completed</h1>
          <p>
            {location.state?.reason ||
              "Your payment was not completed. You can retry checkout or contact support."}
          </p>
          <div className="hero-actions centered">
            <Link className="btn btn-primary" to="/checkout">Retry Checkout</Link>
            <Link className="btn btn-ghost" to="/support">Contact Support</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentFailed;