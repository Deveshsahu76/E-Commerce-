import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { orderApi } from "../../services/ecommerceApi";
import { isLoggedIn } from "../../utils/authStorage";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const formatDateTime = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    if (!isLoggedIn()) {
      toast.error("Please login to view order details");
      navigate("/login", { state: { from: `/orders/${id}` } });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await orderApi.getById(id);
      setOrder(data?.order || null);
    } catch (err) {
      setError(err?.message || "Unable to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");

    if (!confirmCancel) return;

    setCancelLoading(true);

    try {
      await orderApi.cancel(id);
      toast.success("Order cancelled successfully");
      loadOrder();
    } catch (err) {
      toast.error(err?.message || "Unable to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="container">
          <div className="product-detail-skeleton" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="container">
          <div className="empty-state empty-state--large">
            <h3>{error}</h3>
            <p>Order details could not be loaded right now.</p>
            <Link to="/orders" className="btn">
              Back to orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) return null;

  const canCancel = ["pending", "paid", "processing"].includes(order.status);
  const address = order.shippingAddress || {};

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Order Details</span>
          <h1>Order #{order._id?.slice(-8)}</h1>
          <p>
            Track payment, delivery, shipping address, and products included in this order.
          </p>
        </div>
      </section>

      <section className="section order-details-section">
        <div className="container order-details-grid">
          <div className="order-details-main">
            <div className="order-details-card">
              <div className="order-details-card__header">
                <div>
                  <h2>Order Items</h2>
                  <p>Placed on {formatDateTime(order.createdAt)}</p>
                </div>

                <span className={`order-status order-status--${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-details-items">
                {(order.orderItems || []).map((item, index) => (
                  <div className="order-details-item" key={`${item.product}-${index}`}>
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={item.name}
                    />

                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        Qty {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>

                    <strong>
                      {formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-details-card">
              <h2>Shipping Address</h2>

              <div className="address-box">
                <strong>{address.fullName}</strong>
                <p>{address.phone}</p>
                <p>{address.email}</p>
                <p>
                  {address.address}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p>{address.country || "India"}</p>
              </div>
            </div>
          </div>

          <aside className="order-details-summary">
            <h2>Payment Summary</h2>

            <div className="summary-row">
              <span>Items Price</span>
              <strong>{formatPrice(order.itemsPrice)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>
                {Number(order.deliveryPrice || 0) === 0
                  ? "Free"
                  : formatPrice(order.deliveryPrice)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Platform Fee</span>
              <strong>{formatPrice(order.platformFee)}</strong>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <strong>{formatPrice(order.taxPrice)}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-row--total">
              <span>Total</span>
              <strong>{formatPrice(order.totalPrice)}</strong>
            </div>

            <div className="order-payment-box">
              <div>
                <span>Payment Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <strong>{order.isPaid ? "Paid" : "Pending"}</strong>
              </div>

              <div>
                <span>Paid At</span>
                <strong>{order.isPaid ? formatDateTime(order.paidAt) : "Not paid"}</strong>
              </div>

              <div>
                <span>Delivery Status</span>
                <strong>{order.isDelivered ? "Delivered" : "In Progress"}</strong>
              </div>
            </div>

            <div className="order-details-actions">
              <Link to="/orders" className="btn btn--ghost">
                Back to Orders
              </Link>

              {canCancel && (
                <button
                  type="button"
                  className="btn"
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default OrderDetails;