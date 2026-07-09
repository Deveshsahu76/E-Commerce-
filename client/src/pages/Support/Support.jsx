import { useState } from "react";

const faqs = [
  {
    question: "How do I use a solar snake repeller?",
    answer:
      "Place the device in soil or an open outdoor area where sunlight is available. Keep it stable and avoid covering the solar panel.",
  },
  {
    question: "Where should I place the device?",
    answer:
      "Use it around gardens, farms, lawns, home boundaries, storage areas or outdoor surroundings where protection is needed.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes. Use the Track Order page and enter your order ID. You can also contact support with your order details.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Returns depend on product condition and policy. Contact support with your order ID and reason for return.",
  },
];

const Support = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="support-page">
      <section className="support-hero">
        <div className="container support-hero__grid">
          <div>
            <span>Customer Support</span>
            <h1>Need help choosing or using a repellent product?</h1>
            <p>
              Get help for product selection, order tracking, delivery support,
              returns and product usage guidance.
            </p>
          </div>

          <div className="support-card">
            <h2>Support Hours</h2>
            <p>Monday to Saturday</p>
            <strong>10:00 AM - 7:00 PM</strong>
            <p className="support-note">
              Email/OTP service can be connected later using Resend/Brevo or paid SMTP.
            </p>
          </div>
        </div>
      </section>

      <section className="container support-grid">
        <form className="support-form" onSubmit={handleSubmit}>
          <span>Contact Form</span>
          <h2>Send your query</h2>

          {submitted ? (
            <div className="support-success">
              <h3>Query received</h3>
              <p>
                This demo form is ready for client handover. Email sending can be
                connected later with a production email provider.
              </p>
            </div>
          ) : null}

          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </label>

          <label>
            Order ID Optional
            <input
              name="orderId"
              value={form.orderId}
              onChange={handleChange}
              placeholder="Enter order ID if available"
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your issue or question"
              required
            />
          </label>

          <button type="submit">Submit Query</button>
        </form>

        <div className="support-faq">
          <span>Help Center</span>
          <h2>Common Questions</h2>

          {faqs.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Support;