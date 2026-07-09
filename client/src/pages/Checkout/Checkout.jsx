import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { clearCart, getCartSummary } from "../../utils/cartUtils";
import { getToken, getUser } from "../../utils/authUtils";
import { formatPrice } from "../../utils/money";
import { storefrontApi } from "../../services/storefrontApi";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://e-commerce-backend-1i0x.onrender.com/api";

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

const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

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

  const buildOrderPayload = (paymentResult = null) => {
    return {
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
      paymentResult,
    };
  };

  const createFinalOrder = async (paymentResult = null) => {
    const response = await storefrontApi.createOrder(buildOrderPayload(paymentResult));
    return response.order || response.data || response;
  };

  const handleCodOrder = async () => {
    const order = await createFinalOrder(null);
    clearCart();

    navigate("/order-success", {
      state: {
        orderId: order._id || order.id,
        amount: order.totalPrice || order.totalAmount || summary.total,
        method: order.paymentMethod || form.paymentMethod,
      },
    });
  };

  const handleOnlineOrder = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Unable to load payment gateway. Please try COD.");
    }

    const razorpayOrderData = await apiRequest("/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify({ amount: summary.total }),
    });

    const razorpayOrder = razorpayOrderData.order;
    const keyId = razorpayOrderData.keyId;

    if (!razorpayOrder || !keyId) {
      throw new Error("Payment order could not be created.");
    }

    await new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SonicRaksha",
        description: "SonicRaksha Product Order",
        order_id: razorpayOrder.id,
        prefill: {
          name: form.fullName,
          email: user?.email || "",
          contact: form.phone,
        },
        notes: {
          address: form.address,
        },
        theme: {
          color: "#1f7a4d",
        },
        handler: async (response) => {
          try {
            const verifyData = await apiRequest("/payments/razorpay/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });

            const order = await createFinalOrder(verifyData.payment || response);

            clearCart();

            navigate("/order-success", {
              state: {
                orderId: order._id || order.id,
                amount: order.totalPrice || order.totalAmount || summary.total,
                method: "Online Payment",
              },
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user."));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setPlacing(true);
    setMessage("Processing your order...");

    try {
      if (form.paymentMethod === "Online Payment") {
        await handleOnlineOrder();
      } else {
        await handleCodOrder();
      }
    } catch (error) {
      setMessage(error.message || "Unable to place order.");

      if (form.paymentMethod === "Online Payment") {
        navigate("/payment-failed", {
          state: {
            message: error.message || "Payment failed.",
          },
        });
      }
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
              <option>Online Payment</option>
            </select>
          </label>

          <button type="submit" disabled={placing}>
            {placing ? "Processing..." : "Place Order"}
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
                    {item.quantity}  {formatPrice(item.price)}
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