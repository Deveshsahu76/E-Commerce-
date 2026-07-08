import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="page-section">
      <div className="container">
        <div className="state-card spacious">
          <span className="empty-icon">404</span>
          <h1>Page not found</h1>
          <p>The page you are looking for may have moved or does not exist.</p>
          <div className="hero-actions centered">
            <Link className="btn btn-primary" to="/">Go Home</Link>
            <Link className="btn btn-ghost" to="/products">Shop Products</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;