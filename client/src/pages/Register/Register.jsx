import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { saveAuth } from "../../utils/authUtils";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) return "";
    if (password.length < 6) return "Password should be at least 6 characters.";
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return "Tip: Use uppercase letters and numbers for a stronger password.";
    }

    return "Strong password.";
  }, [form.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setStatus("loading");

    try {
      const response = await storefrontApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      saveAuth(response);
      navigate("/");
    } catch (registerError) {
      setError(registerError.message || "Unable to create account. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="auth-page page-section">
      <div className="auth-card">
        <span className="eyebrow">Create Account</span>
        <h1>Start shopping with SonicRaksha</h1>
        <p>Create your account to place orders and track purchases easily.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Enter your full name"
              required
            />
          </label>

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
                placeholder="Create password"
                required
                minLength={6}
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

          {passwordStrength && (
            <p className={passwordStrength === "Strong password." ? "info-text compact" : "helper-text"}>
              {passwordStrength}
            </p>
          )}

          <label>
            Confirm Password
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                placeholder="Confirm password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p className="error-text compact">Password and confirm password do not match.</p>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary full" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;