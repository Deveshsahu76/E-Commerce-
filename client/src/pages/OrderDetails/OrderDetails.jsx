import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { getToken } from "../../utils/authUtils";
import { formatPrice } from "../../utils/money";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { state: { from: `/orders/${id}` } });
      return;
    }

    let mounted = true;

    const loadOrder = async () => {
      try {
        const response = await storefrontApi.getOrderById(id);
        const orderData = response?.order || response?.data || response;

        if (mounted) {
          setOrder(orderData);
          setStatus("success");
        }
      } catch {
        if (mounted) setStatus("error");
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const cancelOrder = async () => {
    try {
      await storefrontApi.cancelOrder(id);
      setMessage("Cancellation request updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to cancel this order.");
    }
  };

  if (status === "loading") {
    return (
      <section className="page-section">
        <div className="container">
          <div className="state-card">Loading order details...</div>
        </div>
      </section>
    );
  }

  if (status === "error" || !order) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="state-card">
            <h1>Order not found</h1>
            <p>Please check your order list and try again.</p>
            <Link className="btn btn-primary" to="/orders">Back to Orders</Link>
          </div>
        </div>
      </section>
    );
  }

  const items = order.orderItems || order.items || [];
  const address = order.shippingAddress || {};
  const total = order.totalPrice || order.totalAmount || 0;
  const canCancel = !["shipped", "delivered", "cancelled"].includes(
    String(order.orderStatus || order.status || "").toLowerCase()
  );

  return (
    <section className="page-section order-details-page">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Order #{String(order._id || order.id).slice(-8)}</span>
          <h1>Order details and delivery status.</h1>
          <p>Review your products, address, payment, and current order status.</p>
        </div>

        <div className="order-detail-layout">
          <div className="order-main">
            <section className="form-card">
              <h2>Order Timeline</h2>
              <div className="timeline">
                {["Placed", "Paid", "Processing", "Shipped", "Delivered"].map((step, index) => (
                  <div className="timeline-step" key={step}>
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="form-card">
              <h2>Products</h2>
              <div className="checkout-items detailed">
                {items.map((item, index) => (
                  <div key={item._id || item.product || index}>
                    <span>{item.name || item.product?.name || "Product"} Ãƒâ€” {item.quantity || item.qty || 1}</span>
                    <strong>{formatPrice(Number(item.price || 0) * Number(item.quantity || item.qty || 1))}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="form-card">
              <h2>Delivery Address</h2>
              <p>
                {address.fullName && <strong>{address.fullName}<br /></strong>}
                {address.address || address.addressLine1}<br />
                {address.city} {address.state} {address.postalCode}<br />
                {address.country || "India"}<br />
                {address.phone && <>Phone: {address.phone}</>}
              </p>
            </section>
          </div>

          <aside className="summary-card">
            <h2>Payment Summary</h2>
            <div className="summary-line">
              <span>Status</span>
              <strong>{order.orderStatus || order.status || "Placed"}</strong>
            </div>
            <div className="summary-line">
              <span>Payment</span>
              <strong>{order.paymentStatus || (order.isPaid ? "Paid" : "Pending")}</strong>
            </div>
            <div className="summary-line">
              <span>Method</span>
              <strong>{order.paymentMethod || "Selected during checkout"}</strong>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            {message && <p className="info-text">{message}</p>}

            {canCancel && (
              <button className="btn btn-ghost full" type="button" onClick={cancelOrder}>
                Cancel Order
              </button>
            )}

            <Link className="btn btn-primary full" to="/support">Need Help?</Link>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;