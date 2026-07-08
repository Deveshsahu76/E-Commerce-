const TOKEN_KEYS = ["shopSphereToken", "token"];
const USER_KEY = "shopSphereUser";

export const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return "";
};

export const saveAuth = (payload = {}) => {
  const token =
    payload.token ||
    payload.jwt ||
    payload.accessToken ||
    payload?.data?.token ||
    payload?.user?.token ||
    "";

  const user =
    payload.user ||
    payload.data?.user ||
    payload.data ||
    payload;

  if (token) {
    localStorage.setItem("shopSphereToken", token);
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth:updated"));

  return { token, user };
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => Boolean(getToken());

export const logout = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth:updated"));
};