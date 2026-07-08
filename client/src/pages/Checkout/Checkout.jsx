import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { clearCart, getCartSummary } from "../../utils/cartUtils";
import { formatPrice } from "../../utils/money";
import { getToken } from "../../utils/authUtils";
import { storefrontApi } from "../../services/storefrontApi";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(getCartSummary());
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    setSummary(getCartSummary());
  }, []);

  const orderPayload = useMemo(() => {
    const orderItems = summary.cart.map((item) => ({
      product: item.productId || item.id,
      productId: item.productId || item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      qty: item.quantity,
    }));

    return {
      orderItems,
      items: orderItems,
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        addressLine1: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      },
      paymentMethod: paymentMethod === "online" ? "Razorpay" : "Cash on Delivery",
      itemsPrice: summary.subtotal,
      shippingPrice: summary.deliveryFee,
      taxPrice: 0,
      discountPrice: summary.discount,
      totalPrice: summary.total,
      totalAmount: summary.total,
    };
  }, [summary, form, paymentMethod]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    if (!summary.cart.length) return "Your cart is empty.";
    if (!form.fullName.trim()) return "Please enter your full name.";
    if (!form.phone.trim()) return "Please enter your phone number.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!form.address.trim()) return "Please enter your delivery address.";
    if (!form.city.trim()) return "Please enter your city.";
    if (!form.state.trim()) return "Please enter your state.";
    if (!form.postalCode.trim()) return "Please enter your postal code.";
    return "";
  };

  const placeCodOrder = async () => {
    const response = await storefrontApi.createOrder(orderPayload);
    clearCart();

    const order = response?.order || response?.data || response;

    navigate("/order-success", {
      state: {
        orderId: order?._id || order?.id || response?.orderId,
        amount: summary.total,
        method: "Cash on Delivery",
      },
    });
  };

  const placeOnlineOrder = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      navigate("/payment-failed", { state: { reason: "Unable to open secure payment window." } });
      return;
    }

    const key = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!key) {
      navigate("/payment-failed", { state: { reason: "Payment configuration is not available." } });
      return;
    }

    const paymentOrderResponse = await storefrontApi.createRazorpayOrder({
      amount: summary.total,
      currency: "INR",
      orderPayload,
    });

    const razorpayOrder =
      paymentOrderResponse?.razorpayOrder ||
      paymentOrderResponse?.order ||
      paymentOrderResponse?.data ||
      paymentOrderResponse;

    const options = {
      key,
      amount: razorpayOrder?.amount,
      currency: razorpayOrder?.currency || "INR",
      name: "ShopSphere",
      description: "Secure checkout",
      order_id: razorpayOrder?.id || razorpayOrder?.orderId,
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      handler: async (response) => {
        try {
          const verifyResponse = await storefrontApi.verifyPayment({
            ...response,
            orderPayload,
          });

          clearCart();

          const order = verifyResponse?.order || verifyResponse?.data || verifyResponse;

          navigate("/order-success", {
            state: {
              orderId: order?._id || order?.id || verifyResponse?.orderId,
              amount: summary.total,
              method: "Online Payment",
            },
          });
        } catch (paymentError) {
          navigate("/payment-failed", {
            state: { reason: paymentError.message || "Payment verification failed." },
          });
        }
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
        },
      },
      theme: {
        color: "#111827",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);

      if (paymentMethod === "online") {
        await placeOnlineOrder();
      } else {
        await placeCodOrder();
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to place order. Please try again.");
      setSubmitting(false);
    }
  };

  if (!summary.cart.length) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="state-card spacious">
            <h1>Your cart is empty</h1>
            <p>Add products to your cart before checkout.</p>
            <Link className="btn btn-primary" to="/products">Shop Products</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section checkout-page">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Secure Checkout</span>
          <h1>Complete your order safely.</h1>
          <p>Pay securely using UPI, cards, net banking, or wallets.</p>
        </div>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-form">
            <section className="form-card">
              <h2>Delivery Details</h2>
              <div className="form-grid">
                <label>
                  Full Name
                  <input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
                </label>
                <label>
                  Postal Code
                  <input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} />
                </label>
                <label className="full-field">
                  Address
                  <textarea value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
                </label>
                <label>
                  City
                  <input value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
                </label>
                <label>
                  State
                  <input value={form.state} onChange={(e) => updateForm("state", e.target.value)} />
                </label>
              </div>
            </section>

            <section className="form-card">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className={paymentMethod === "online" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                  />
                  <span>
                    <strong>Online Payment</strong>
                    <small>Pay securely using UPI, cards, net banking, or wallets.</small>
                  </span>
                </label>

                <label className={paymentMethod === "cod" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order is delivered.</small>
                  </span>
                </label>
              </div>
            </section>
          </div>

          <aside className="summary-card">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {summary.cart.map((item) => (
                <div key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(summary.subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery Fee</span>
              <strong>{summary.deliveryFee === 0 ? "Free" : formatPrice(summary.deliveryFee)}</strong>
            </div>
            <div className="summary-line">
              <span>Discount</span>
              <strong>{formatPrice(summary.discount)}</strong>
            </div>
            <div className="summary-line total">
              <span>Total Payable</span>
              <strong>{formatPrice(summary.total)}</strong>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn btn-primary full" type="submit" disabled={submitting}>
              {submitting ? "Processing..." : "Place Order"}
            </button>
            <p className="secure-note">Secure checkout with trusted payment options.</p>
          </aside>
        </form>
      </div>
    </section>
  );
};

export default Checkout;