import React, { useEffect } from "react";
import api from "../../services/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePay = async () => {
    try {
      const amount = 49.99; // demo amount
      const { data } = await api.post("/payments/create-order", { amount });

      const { order, key } = data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "ShopSphere",
        description: "Test purchase",
        order_id: order.id,
        handler: function (response) {
          alert("Payment successful: " + response.razorpay_payment_id);
        },
        prefill: {
          name: "Demo User",
          email: "demo@example.com",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Payment failed");
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Checkout (Demo)</h1>
        <p className="mt-4 text-slate-600">Click below to try a test payment via Razorpay (demo mode).</p>
        <div className="mt-6">
          <button onClick={handlePay} className="rounded-2xl bg-slate-900 px-6 py-3 text-white">
            Pay $49.99
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
