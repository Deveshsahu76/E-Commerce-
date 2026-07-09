const rawBase =
  process.env.REACT_APP_API_URL ||
  "https://e-commerce-backend-1i0x.onrender.com/api";

const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export const getAdminToken = () => {
  const directKeys = ["token", "authToken", "SonicRakshaToken", "userToken"];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  const possibleUserKeys = ["user", "currentUser", "SonicRakshaUser"];

  for (const key of possibleUserKeys) {
    try {
      const user = JSON.parse(localStorage.getItem(key) || "{}");
      if (user?.token) return user.token;
    } catch {
      // ignore invalid storage
    }
  }

  return "";
};

export const setAdminSession = (data = {}) => {
  const token = data.token || data.accessToken || data.user?.token || "";

  if (token) {
    localStorage.setItem("token", token);
  }

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return token;
};

export const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("SonicRakshaToken");
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("SonicRakshaUser");
};

export const adminRequest = async (path, options = {}) => {
  const token = getAdminToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const adminLogin = async ({ email, password }) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  setAdminSession(data);
  return data;
};