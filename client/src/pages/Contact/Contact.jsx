import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log("Contact form data:", data);
    toast.success("Message submitted successfully");
    reset();
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Contact Us</span>
          <h1>Need help with your order or store setup?</h1>
          <p>
            Send a message for product queries, order support, partnership, or
            custom e-commerce development requirements.
          </p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Support</span>
            <h2>We are here to help.</h2>
            <p>
              This page is frontend-ready. In backend phase, we can connect this
              form with email service, database storage, or admin contact dashboard.
            </p>

            <div className="contact-cards">
              <div>
                <span>📧</span>
                <strong>Email Support</strong>
                <p>support@shopsphere.com</p>
              </div>

              <div>
                <span>📞</span>
                <strong>Phone</strong>
                <p>+91 98765 43210</p>
              </div>

              <div>
                <span>📍</span>
                <strong>Location</strong>
                <p>India-based online store</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="checkout-card__header">
              <h2>Send Message</h2>
              <p>Fill the form and we will get back to you soon.</p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  placeholder="Your name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
                {errors.name && <small className="form-error">{errors.name.message}</small>}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && <small className="form-error">{errors.email.message}</small>}
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  placeholder="How can we help?"
                  {...register("subject", {
                    required: "Subject is required",
                  })}
                />
                {errors.subject && (
                  <small className="form-error">{errors.subject.message}</small>
                )}
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows="5"
                  placeholder="Write your message..."
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters",
                    },
                  })}
                />
                {errors.message && (
                  <small className="form-error">{errors.message.message}</small>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn--large contact-submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Contact;