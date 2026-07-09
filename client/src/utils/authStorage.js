const USER_KEY = "SonicRakshaUser";
const TOKEN_KEY = "SonicRakshaToken";

export const getAuthUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
};

export const setAuthData = ({ user, token }) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("token", token);
  }

  window.dispatchEvent(new Event("auth-updated"));
};

export const clearAuthData = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  window.dispatchEvent(new Event("auth-updated"));
};

export const isLoggedIn = () => {
  return Boolean(getAuthToken());
};