import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearCart, getCartItems } from "../../utils/cartStorage";
import { paymentApi } from "../../services/ecommerceApi";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

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

  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [items]);

  const deliveryFee = subtotal === 0 || subtotal >= 999 ? 0 : 99;
  const platformFee = subtotal === 0 ? 0 : 19;
  const total = subtotal + deliveryFee + platformFee;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const missingField = requiredFields.find((field) => !form[field].trim());

    if (missingField) {
      toast.error("Please fill all delivery details");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const buildOrderPayload = () => {
    return {
      items: items.map((item) => ({
        product: item.productId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      pricing: {
        subtotal,
        deliveryFee,
        platformFee,
        total,
      },
      paymentMethod,
    };
  };

  const handleCashOrder = async () => {
    clearCart();
    setItems([]);
    toast.success("Demo order placed successfully");
    navigate("/");
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    const key = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!key) {
      toast.error("Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in client env.");
      return;
    }

    const orderPayload = buildOrderPayload();

    const { data } = await paymentApi.createRazorpayOrder({
      amount: total,
      currency: "INR",
      order: orderPayload,
    });

    const razorpayOrder = data?.order || data?.razorpayOrder || data;

    if (!razorpayOrder?.id) {
      throw new Error("Invalid Razorpay order response from backend");
    }

    const options = {
      key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "ShopSphere",
      description: "E-Commerce Order Payment",
      order_id: razorpayOrder.id,
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      notes: {
        address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
      },
      theme: {
        color: "#2563eb",
      },
      handler: async (response) => {
        try {
          await paymentApi.verifyRazorpayPayment({
            ...response,
            order: orderPayload,
          });

          clearCart();
          setItems([]);
          toast.success("Payment successful. Order placed!");
          navigate("/");
        } catch (error) {
          toast.error(error?.message || "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateForm()) return;

    setProcessing(true);

    try {
      if (paymentMethod === "cod") {
        await handleCashOrder();
        return;
      }

      await handleRazorpayPayment();
    } catch (error) {
      toast.error(error?.message || "Unable to place order right now");
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main>
        <section className="page-hero">
          <div className="container page-hero__inner">
            <span className="eyebrow">Checkout</span>
            <h1>Your cart is empty.</h1>
            <p>Add products to your cart before continuing to checkout.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="empty-state empty-state--large">
              <h3>No checkout items</h3>
              <p>Browse products and add items to continue.</p>
              <Link to="/products" className="btn btn--large">
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Secure Checkout</span>
          <h1>Complete your order details.</h1>
          <p>
            Enter delivery information, review the final amount, and continue with
            Razorpay-ready payment.
          </p>
        </div>
      </section>

      <section className="section checkout-section">
        <div className="container checkout-grid">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="checkout-card">
              <div className="checkout-card__header">
                <h2>Delivery Details</h2>
                <p>These details will be used for shipping and order updates.</p>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />
                </div>

                <div className="form-field form-field--full">
                  <label htmlFor="address">Full Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House no, street, area, landmark"
                    rows="4"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card__header">
                <h2>Payment Method</h2>
                <p>Razorpay backend verification will be connected in API phase.</p>
              </div>

              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span>
                    <strong>Razorpay</strong>
                    <small>UPI, cards, net banking, wallet</small>
                  </span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  <span>
                    <strong>Cash on Delivery Demo</strong>
                    <small>Temporary frontend-only demo order</small>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--large checkout-submit"
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : paymentMethod === "razorpay"
                ? `Pay ${formatPrice(total)}`
                : "Place Demo Order"}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {items.map((item) => (
                <div className="checkout-item" key={item.productId}>
                  <img src={item.image} alt={item.name} />
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

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</strong>
            </div>

            <div className="summary-row">
              <span>Platform fee</span>
              <strong>{formatPrice(platformFee)}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-row--total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <Link to="/cart" className="checkout-summary__edit">
              Edit cart →
            </Link>

            <div className="cart-summary__trust">
              <p>🔒 Payment verification next in backend phase</p>
              <p>📦 Order creation API next</p>
              <p>🧾 Invoice/order status can be added after payment success</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Checkout;