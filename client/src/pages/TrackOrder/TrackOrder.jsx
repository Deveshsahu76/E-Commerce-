import { useState } from "react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!orderId.trim()) {
      setMessage("Please enter a valid order ID.");
      return;
    }

    setMessage(
      "Order tracking request received. Full live tracking can be connected with courier/order status APIs later. For now, please check your Orders page or contact support with this order ID."
    );
  };

  return (
    <main className="track-page">
      <section className="container track-card">
        <span>Track Order</span>
        <h1>Check your order status</h1>
        <p>
          Enter your order ID to check delivery progress. Admin can update order
          status from the admin panel.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Enter your order ID"
          />
          <button type="submit">Track Order</button>
        </form>

        {message ? <div className="track-message">{message}</div> : null}

        <div className="track-steps">
          <article>
            <strong>1</strong>
            <h3>Pending</h3>
            <p>Order placed and waiting for confirmation.</p>
          </article>

          <article>
            <strong>2</strong>
            <h3>Confirmed</h3>
            <p>Order confirmed by admin.</p>
          </article>

          <article>
            <strong>3</strong>
            <h3>Shipped</h3>
            <p>Product shipped for delivery.</p>
          </article>

          <article>
            <strong>4</strong>
            <h3>Delivered</h3>
            <p>Order delivered successfully.</p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default TrackOrder;