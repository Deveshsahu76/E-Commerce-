import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authApi } from "../../services/ecommerceApi";
import { setAuthData } from "../../utils/authStorage";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const redirectTo = location.state?.from || "/products";

  const onSubmit = async (formData) => {
    try {
      const { data } = await authApi.login(formData);

      setAuthData({
        user: data?.user,
        token: data?.token,
      });

      toast.success("Login successful");
      navigate(redirectTo);
    } catch (error) {
      toast.error(error?.message || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell container">
        <div className="auth-panel">
          <span className="eyebrow">Welcome back</span>
          <h1>Login to continue shopping.</h1>
          <p>
            Access your account, manage cart items, and continue checkout with a
            smoother shopping experience.
          </p>

          <div className="auth-benefits">
            <div>
              <span>🛒</span>
              <strong>Saved Cart</strong>
            </div>
            <div>
              <span>🔒</span>
              <strong>Secure Checkout</strong>
            </div>
            <div>
              <span>📦</span>
              <strong>Order Tracking</strong>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-card__header">
            <h2>Sign in</h2>
            <p>Enter your email and password to access your account.</p>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && <small className="form-error">{errors.email.message}</small>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <small className="form-error">{errors.password.message}</small>
            )}
          </div>

          <button type="submit" className="btn btn--large auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;