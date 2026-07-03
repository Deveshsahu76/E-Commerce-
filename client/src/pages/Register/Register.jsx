import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { authApi } from "../../services/ecommerceApi";
import { setAuthData } from "../../utils/authStorage";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const { data } = await authApi.register(payload);

      setAuthData({
        user: data?.user,
        token: data?.token,
      });

      toast.success("Account created successfully");
      navigate("/products");
    } catch (error) {
      toast.error(error?.message || "Registration failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell container">
        <div className="auth-panel">
          <span className="eyebrow">Create account</span>
          <h1>Start your shopping journey.</h1>
          <p>
            Create an account to get a cleaner checkout flow, saved details, and
            future order tracking support.
          </p>

          <div className="auth-benefits">
            <div>
              <span>⚡</span>
              <strong>Fast Signup</strong>
            </div>
            <div>
              <span>💳</span>
              <strong>Payment Ready</strong>
            </div>
            <div>
              <span>🚚</span>
              <strong>Delivery Flow</strong>
            </div>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-card__header">
            <h2>Create account</h2>
            <p>Fill your details to create a ShopSphere account.</p>
          </div>

          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
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
              placeholder="Minimum 6 characters"
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

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <small className="form-error">{errors.confirmPassword.message}</small>
            )}
          </div>

          <button type="submit" className="btn btn--large auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Register;