import React from "react";
import { Link } from "react-router-dom";
import SectionTitle from "../../components/common/SectionTitle";

const values = [
  {
    icon: "",
    title: "Fast Shopping",
    text: "Clean product discovery, quick cart flow, and checkout-ready structure.",
  },
  {
    icon: "",
    title: "Secure Payments",
    text: "Razorpay-ready payment flow with backend verification planned.",
  },
  {
    icon: "",
    title: "Real Orders",
    text: "Order APIs, inventory updates, and admin controls will make it production-ready.",
  },
];

const About = () => {
  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">About SonicRaksha</span>
          <h1>A modern MERN e-commerce experience.</h1>
          <p>
            SonicRaksha is built as a scalable full-stack e-commerce platform with
            product browsing, cart management, checkout flow, authentication, and
            payment-ready architecture.
          </p>
        </div>
      </section>

      <section className="section about-section">
        <div className="container about-grid">
          <div className="about-visual">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
              alt="E-commerce team"
            />
            <div className="about-floating-card">
              <strong>Production Goal</strong>
              <span>10K50K visitors ready architecture</span>
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Why this project"
              title="Built for real e-commerce learning and client demos."
              text="This project is not just a basic store UI. It is being upgraded step-by-step into a complete online shopping system with real APIs, checkout, admin, and security."
            />

            <div className="about-points">
              <div>
                <strong>Frontend</strong>
                <p>React shopping UI, cart, checkout, auth, responsive layout.</p>
              </div>

              <div>
                <strong>Backend</strong>
                <p>Node.js, Express.js, MongoDB APIs for products, orders, payment.</p>
              </div>

              <div>
                <strong>Scale Plan</strong>
                <p>Indexes, rate limiting, Cloudinary, Razorpay verification, caching.</p>
              </div>
            </div>

            <Link to="/products" className="btn btn--large">
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionTitle
            eyebrow="Core Values"
            title="What makes this store better"
            text="These sections also help your project look more complete during reviews, interviews, and client demos."
            align="center"
          />

          <div className="trust-grid">
            {values.map((item) => (
              <div className="trust-card" key={item.title}>
                <span>{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;