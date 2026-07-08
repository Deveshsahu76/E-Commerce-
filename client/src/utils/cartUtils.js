import { getProductImage } from "./money";

const CART_KEY = "shopsphere_cart";
const LEGACY_KEYS = ["shopSphereCart", "cart"];

const normalizeItem = (item = {}) => {
  const product = item.product && typeof item.product === "object" ? item.product : item;
  const id = product._id || product.id || item.product || item.productId;

  return {
    id,
    productId: id,
    name: product.name || item.name || "Product",
    brand: product.brand || item.brand || "",
    price: Number(product.price || item.price || 0),
    originalPrice: Number(product.originalPrice || item.originalPrice || 0),
    image: getProductImage(product),
    stock: Number(product.stock ?? item.stock ?? 1),
    quantity: Number(item.quantity || item.qty || 1),
    product,
  };
};

export const getCart = () => {
  try {
    const current = localStorage.getItem(CART_KEY);
    if (current) {
      return JSON.parse(current).map(normalizeItem).filter((item) => item.id);
    }

    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        return JSON.parse(legacy).map(normalizeItem).filter((item) => item.id);
      }
    }

    return [];
  } catch {
    return [];
  }
};

export const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("cart:updated"));
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const item = normalizeItem({ ...product, quantity });
  const existingIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = Math.min(
      cart[existingIndex].quantity + quantity,
      cart[existingIndex].stock || 99
    );
  } else {
    cart.push(item);
  }

  saveCart(cart);
  return cart;
};

export const updateCartQuantity = (id, quantity) => {
  const cart = getCart().map((item) => {
    if (item.id !== id) return item;

    return {
      ...item,
      quantity: Math.max(1, Math.min(Number(quantity || 1), item.stock || 99)),
    };
  });

  saveCart(cart);
  return cart;
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
};

export const getCartCount = () =>
  getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);

export const getCartSummary = () => {
  const cart = getCart();
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const deliveryFee = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const discount = 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);

  return {
    cart,
    subtotal,
    deliveryFee,
    discount,
    total,
  };
};