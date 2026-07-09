import { Link } from "react-router-dom";
import { useState } from "react";
import { storefrontApi } from "../../services/storefrontApi";

const ForgotPassword = () => {
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const sendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setStatus("loading");

      const response = await storefrontApi.forgotPassword({
        email: form.email,
      });

      setMessage(response?.message || "OTP sent to your email if the account exists.");
      setStep("reset");
      setStatus("idle");
    } catch (otpError) {
      setError(otpError.message || "Unable to send OTP. Please try again.");
      setStatus("idle");
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (form.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setStatus("loading");

      const response = await storefrontApi.resetPassword({
        email: form.email,
        otp: form.otp,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setMessage(response?.message || "Password reset successfully.");
      setStep("done");
      setStatus("idle");
    } catch (resetError) {
      setError(resetError.message || "Unable to reset password. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="auth-page page-section forgot-page">
      <div className="auth-card">
        <span className="eyebrow">Password Help</span>
        <h1>Reset your password</h1>
        <p>
          Enter your registered email and we will send a secure OTP to reset your password.
        </p>

        {step === "email" && (
          <form onSubmit={sendOtp}>
            <label>
              Registered Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="info-text">{message}</p>}

            <button className="btn btn-primary full" disabled={status === "loading"}>
              {status === "loading" ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={resetPassword}>
            {message && <p className="info-text">{message}</p>}

            <label>
              OTP
              <input
                value={form.otp}
                onChange={(event) => updateForm("otp", event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6 digit OTP"
                inputMode="numeric"
                maxLength={6}
                required
              />
            </label>

            <label>
              New Password
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  placeholder="Create new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label>
              Confirm New Password
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => updateForm("confirmPassword", event.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && <p className="error-text">{error}</p>}

            <button className="btn btn-primary full" disabled={status === "loading"}>
              {status === "loading" ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setStep("email");
                setError("");
                setMessage("");
              }}
            >
              Use another email
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="forgot-success">
            <span className="success-icon"></span>
            <h2>Password updated</h2>
            {message && <p className="info-text">{message}</p>}
            <Link className="btn btn-primary full" to="/login">
              Login Now
            </Link>
          </div>
        )}

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;