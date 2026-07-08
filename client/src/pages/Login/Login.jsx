import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { saveAuth } from "../../utils/authUtils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password.trim()) {
      setError("Please enter your password.");
      return;
    }

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
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="auth-row">
            <span>Forgot your password?</span>
            <Link to="/forgot-password">Reset Password</Link>
          </div>

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