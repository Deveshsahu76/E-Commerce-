import api from "./api";

// AUTH
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// PRODUCTS
export const productApi = {
  getAll: (params = {}) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

// CART
export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId, quantity = 1) =>
    api.post("/cart", { productId, quantity }),
  update: (itemId, quantity) =>
    api.patch(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

// ORDERS
export const orderApi = {
  create: (data) => api.post("/orders", data),
  myOrders: () => api.get("/orders/my"),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

// PAYMENTS
export const paymentApi = {
  createRazorpayOrder: (data) =>
    api.post("/payments/razorpay/create-order", data),

  verifyRazorpayPayment: (data) =>
    api.post("/payments/razorpay/verify", data),
};

// CATEGORIES
export const categoryApi = {
  getAll: () => api.get("/categories"),
};

// REVIEWS
export const reviewApi = {
  getByProduct: (productId) =>
    api.get(`/products/${productId}/reviews`),

  create: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),
};