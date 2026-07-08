import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../../utils/money";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const amount = location.state?.amount;
  const method = location.state?.method;

  return (
    <section className="page-section">
      <div className="container">
        <div className="state-card spacious success-card">
          <span className="success-icon">✓</span>
          <h1>Order placed successfully</h1>
          <p>Your order has been confirmed. You can track it from the My Orders section.</p>

          <div className="success-details">
            {orderId && (
              <div>
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
            )}
            {amount !== undefined && (
              <div>
                <span>Amount</span>
                <strong>{formatPrice(amount)}</strong>
              </div>
            )}
            {method && (
              <div>
                <span>Payment Method</span>
                <strong>{method}</strong>
              </div>
            )}
          </div>

          <div className="hero-actions centered">
            <Link className="btn btn-primary" to="/orders">View Orders</Link>
            <Link className="btn btn-ghost" to="/products">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;