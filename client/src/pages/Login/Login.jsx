import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../services/api";
import { saveAuth } from "../../utils/authUtils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      const { data } = await api.post("/auth/login", formData);

      saveAuth(data);

      toast.success("Login successful");

      const redirectTo = location.state?.from || "/products";
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span>Welcome Back</span>
        <h1>Login</h1>
        <p>Access your account and continue shopping.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
              })}
            />
            {errors.email ? <small>{errors.email.message}</small> : null}
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password ? <small>{errors.password.message}</small> : null}
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-switch">
          Password reset is available through customer support.
        </p>
      </section>
    </main>
  );
};

export default Login;