import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { saveAuth } from "../../utils/authUtils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const response = await storefrontApi.login(form);
      saveAuth(response);
      navigate(redirectTo);
    } catch (loginError) {
      setError(loginError.message || "Unable to login. Please check your details.");
      setStatus("idle");
    }
  };

  return (
    <section className="auth-page page-section">
      <div className="auth-card">
        <span className="eyebrow">Welcome Back</span>
        <h1>Login to your account</h1>
        <p>Access your orders, wishlist, and saved checkout details.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email Address
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary full" disabled={status === "loading"}>
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New to ShopSphere? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;