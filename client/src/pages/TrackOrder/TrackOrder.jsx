import { useState } from "react";
import { Link } from "react-router-dom";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Track Order</span>
          <h1>Check your order status.</h1>
          <p>Enter your order ID to quickly move to your order details.</p>
        </div>

        <div className="track-card">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <label>
              Order ID
              <input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder="Enter order ID"
              />
            </label>
            <button className="btn btn-primary" type="submit">Track Order</button>
          </form>

          {submitted && (
            <div className="state-card">
              <h2>Order tracking</h2>
              <p>If you are logged in, open your order details page for live status.</p>
              {orderId ? (
                <Link className="btn btn-ghost" to={`/orders/${orderId}`}>Open Order Details</Link>
              ) : (
                <Link className="btn btn-ghost" to="/orders">Go to My Orders</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrackOrder;