import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    if (!isLoggedIn()) {
      toast.error("Please login to view your orders");
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await orderApi.myOrders();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setPagination(data?.pagination || null);
    } catch (err) {
      setError(err?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");

    if (!confirmCancel) return;

    try {
      await orderApi.cancel(orderId);
      toast.success("Order cancelled successfully");
      loadOrders();
    } catch (err) {
      toast.error(err?.message || "Unable to cancel order");
    }
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">My Orders</span>
          <h1>Track your shopping history.</h1>
          <p>
            View your placed orders, payment status, delivery status, and order details.
          </p>
        </div>
      </section>

      <section className="section orders-section">
        <div className="container">
          {loading && (
            <div className="grid orders-grid">
              {[1, 2, 3].map((item) => (
                <div className="skeleton-card" key={item} />
              ))}
            </div>
          )}

          {error && <div className="alert alert--error">{error}</div>}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-state empty-state--large">
              <h3>No orders found</h3>
              <p>Start shopping and your orders will appear here.</p>
              <Link to="/products" className="btn btn--large">
                Browse Products
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <>
              <div className="orders-header">
                <div>
                  <h2>Your Orders</h2>
                  <p>
                    {pagination?.total || orders.length} order
                    {(pagination?.total || orders.length) === 1 ? "" : "s"} found
                  </p>
                </div>

                <Link to="/products" className="btn btn--ghost">
                  Continue Shopping
                </Link>
              </div>

              <div className="orders-grid">
                {orders.map((order) => (
                  <article className="order-card" key={order._id}>
                    <div className="order-card__top">
                      <div>
                        <span className="order-id">Order #{order._id?.slice(-8)}</span>
                        <h3>{formatPrice(order.totalPrice)}</h3>
                        <p>Placed on {formatDate(order.createdAt)}</p>
                      </div>

                      <span className={`order-status order-status--${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-items-preview">
                      {(order.orderItems || []).slice(0, 3).map((item, index) => (
                        <div className="order-preview-item" key={`${order._id}-${index}`}>
                          <img
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80"
                            }
                            alt={item.name}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            <span>
                              Qty {item.quantity} × {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__meta">
                      <div>
                        <span>Payment</span>
                        <strong>{order.isPaid ? "Paid" : "Pending"}</strong>
                      </div>

                      <div>
                        <span>Delivery</span>
                        <strong>{order.isDelivered ? "Delivered" : "In Progress"}</strong>
                      </div>

                      <div>
                        <span>Method</span>
                        <strong>{order.paymentMethod}</strong>
                      </div>
                    </div>

                    <div className="order-card__actions">
                      <Link to={`/orders/${order._id}`} className="btn btn--small">
                        View Details
                      </Link>

                      {["pending", "paid", "processing"].includes(order.status) && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--small"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Orders;