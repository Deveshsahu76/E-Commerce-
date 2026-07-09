import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { clearCart, getCartSummary } from "../../utils/cartUtils";
import { getToken, getUser } from "../../utils/authUtils";
import { formatPrice } from "../../utils/money";
import { storefrontApi } from "../../services/storefrontApi";

const Checkout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const summary = useMemo(() => getCartSummary(), []);
  const cart = summary.cart || [];

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    paymentMethod: "Cash on Delivery",
  });

  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!getToken()) {
      navigate("/login", { state: { from: "/checkout" } });
      return false;
    }

    if (!cart.length) {
      setMessage("Your cart is empty.");
      return false;
    }

    const required = ["fullName", "phone", "address", "city", "state", "postalCode"];

    for (const key of required) {
      if (!String(form[key] || "").trim()) {
        setMessage("Please fill all shipping details.");
        return false;
      }
    }

    if (String(form.phone).trim().length < 10) {
      setMessage("Please enter a valid phone number.");
      return false;
    }

    return true;
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setPlacing(true);
    setMessage("Placing your order...");

    try {
      const payload = {
        orderItems: cart.map((item) => ({
          product: item.productId || item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country || "India",
        },
        paymentMethod: form.paymentMethod,
      };

      const response = await storefrontApi.createOrder(payload);
      const order = response.order || response.data || response;

      clearCart();

      navigate("/order-success", {
        state: {
          orderId: order._id || order.id,
          amount: order.totalPrice || order.totalAmount || summary.total,
          method: order.paymentMethod || form.paymentMethod,
        },
      });
    } catch (error) {
      setMessage(error.message || "Unable to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.length) {
    return (
      <main className="checkout-page">
        <section className="container checkout-empty">
          <h1>Your cart is empty</h1>
          <p>Add products to your cart before checkout.</p>
          <Link to="/products">Shop Products</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="container checkout-grid">
        <form className="checkout-form" onSubmit={placeOrder}>
          <span>Checkout</span>
          <h1>Shipping details</h1>

          {message ? <p className="checkout-message">{message}</p> : null}

          <div className="checkout-form-grid">
            <label>
              Full Name *
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </label>

            <label>
              Phone *
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
          </div>

          <label>
            Complete Address *
            <textarea
              name="address"
              rows="4"
              value={form.address}
              onChange={handleChange}
            />
          </label>

          <div className="checkout-form-grid">
            <label>
              City *
              <input name="city" value={form.city} onChange={handleChange} />
            </label>

            <label>
              State *
              <input name="state" value={form.state} onChange={handleChange} />
            </label>

            <label>
              Pincode *
              <input name="postalCode" value={form.postalCode} onChange={handleChange} />
            </label>
          </div>

          <label>
            Payment Method
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option>Cash on Delivery</option>
            </select>
          </label>

          <button type="submit" disabled={placing}>
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <span>Order Summary</span>
          <h2>{cart.length} item(s)</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <article key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-totals">
            <p>
              <span>Subtotal</span>
              <strong>{formatPrice(summary.subtotal)}</strong>
            </p>

            <p>
              <span>Delivery</span>
              <strong>{formatPrice(summary.deliveryFee)}</strong>
            </p>

            <p className="grand">
              <span>Total</span>
              <strong>{formatPrice(summary.total)}</strong>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;