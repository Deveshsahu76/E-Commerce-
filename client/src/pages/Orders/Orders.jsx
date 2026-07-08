import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { getToken } from "../../utils/authUtils";
import { formatPrice } from "../../utils/money";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    let mounted = true;

    const loadOrders = async () => {
      try {
        const response = await storefrontApi.getMyOrders();
        const orderList = response?.orders || response?.data || response || [];

        if (mounted) {
          setOrders(Array.isArray(orderList) ? orderList : []);
          setStatus("success");
        }
      } catch {
        if (mounted) setStatus("error");
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">My Orders</span>
          <h1>Track your purchases in one place.</h1>
          <p>View order status, payment details, and delivery updates.</p>
        </div>

        {status === "loading" && <div className="state-card">Loading your orders...</div>}

        {status === "error" && (
          <div className="state-card">
            <h2>Unable to load orders</h2>
            <p>Please refresh and try again.</p>
          </div>
        )}

        {status === "success" && orders.length === 0 && (
          <div className="state-card spacious">
            <h2>No orders yet</h2>
            <p>Your placed orders will appear here.</p>
            <Link className="btn btn-primary" to="/products">Start Shopping</Link>
          </div>
        )}

        {status === "success" && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => {
              const orderId = order._id || order.id;
              const total = order.totalPrice || order.totalAmount || order.amount || 0;

              return (
                <article className="order-card" key={orderId}>
                  <div>
                    <span className="eyebrow">Order #{String(orderId).slice(-8)}</span>
                    <h2>{formatPrice(total)}</h2>
                    <p>{new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="status-stack">
                    <span className="status-badge">{order.orderStatus || order.status || "Placed"}</span>
                    <span className="status-badge soft">{order.paymentStatus || (order.isPaid ? "Paid" : "Pending")}</span>
                  </div>
                  <Link className="btn btn-ghost btn-sm" to={`/orders/${orderId}`}>View Details</Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;