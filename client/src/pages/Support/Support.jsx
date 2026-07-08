import { Link } from "react-router-dom";

const Support = () => {
  const supportCards = [
    {
      title: "Order Help",
      text: "Need help with an order, delivery update, or cancellation?",
      to: "/orders",
    },
    {
      title: "Payment Support",
      text: "Facing a payment issue or failed transaction?",
      to: "/payment-failed",
    },
    {
      title: "Return Support",
      text: "Need help with a return or refund request?",
      to: "/return-refund-policy",
    },
    {
      title: "General Query",
      text: "Have a question before buying?",
      to: "/contact",
    },
  ];

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Help & Support</span>
          <h1>How can we help you today?</h1>
          <p>Choose a support topic and get help with shopping, orders, payments, and returns.</p>
        </div>

        <div className="support-grid">
          {supportCards.map((card) => (
            <Link className="support-card" to={card.to} key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.text}</p>
              <span>Get help →</span>
            </Link>
          ))}
        </div>

        <div className="soft-cta">
          <div>
            <span className="eyebrow">Quick Tip</span>
            <h2>Keep your order ID ready</h2>
            <p>It helps support resolve order, payment, or delivery questions faster.</p>
          </div>
          <Link className="btn btn-primary" to="/contact">Contact Us</Link>
        </div>
      </div>
    </section>
  );
};

export default Support;