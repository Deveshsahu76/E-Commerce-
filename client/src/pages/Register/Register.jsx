import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";
import { saveAuth } from "../../utils/authUtils";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const response = await storefrontApi.register(form);
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
        <h1>Start shopping with ShopSphere</h1>
        <p>Create your account to place orders and track purchases easily.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>

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
              minLength={6}
            />
          </label>

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