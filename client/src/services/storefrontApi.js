import { getToken } from "../utils/authUtils";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const request = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || data?.error || "Something went wrong";
    throw new Error(message);
  }

  return data;
};

export const storefrontApi = {
  getProducts: (params = {}) => request(`/products${buildQuery(params)}`),

  getProductById: (id) => request(`/products/${id}`),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyOrders: () => request("/orders/my"),

  getOrderById: (id) => request(`/orders/${id}`),

  cancelOrder: (id) =>
    request(`/orders/${id}/cancel`, {
      method: "PATCH",
    }),

  createOrder: (payload) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createRazorpayOrder: (payload) =>
    request("/payments/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyPayment: (payload) =>
    request("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const normalizeProductsResponse = (response) => {
  const products = response?.products || response?.data || [];
  const pagination = response?.pagination || {
    page: 1,
    pages: 1,
    total: Array.isArray(products) ? products.length : 0,
  };

  return {
    products: Array.isArray(products) ? products : [],
    pagination,
    count: response?.count ?? products.length,
  };
};