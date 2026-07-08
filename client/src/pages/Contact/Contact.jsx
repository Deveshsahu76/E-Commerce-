import { useState } from "react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="page-section contact-page">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Contact Us</span>
          <h1>We are here to help.</h1>
          <p>Send your query and our support team will help you with products, orders, payments, or returns.</p>
        </div>

        <div className="contact-layout">
          <form className="form-card" onSubmit={handleSubmit}>
            <h2>Send a message</h2>
            <label>
              Name
              <input required />
            </label>
            <label>
              Email
              <input type="email" required />
            </label>
            <label>
              Phone
              <input />
            </label>
            <label>
              Subject
              <input required />
            </label>
            <label>
              Message
              <textarea required />
            </label>
            {submitted && <p className="info-text">Thanks! Your message is ready for support review.</p>}
            <button className="btn btn-primary" type="submit">Submit Query</button>
          </form>

          <aside className="summary-card">
            <h2>Store Support</h2>
            <p>Use these contact details as placeholders and update them with client information before final handover.</p>
            <div className="support-lines">
              <span>Email: support@shopsphere.com</span>
              <span>Phone: +91 00000 00000</span>
              <span>WhatsApp: Add client number</span>
              <span>Address: Add store address</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Contact;