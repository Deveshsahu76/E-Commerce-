import { getProductImage } from "./money";

const WISHLIST_KEY = "shopsphere_wishlist";

const normalizeItem = (product = {}) => {
  const id = product._id || product.id || product.productId;

  return {
    id,
    productId: id,
    name: product.name || "Product",
    brand: product.brand || "",
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || 0),
    image: getProductImage(product),
    rating: Number(product.rating || 0),
    stock: Number(product.stock || 0),
    product,
  };
};

export const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveWishlist = (items) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wishlist:updated"));
};

export const isInWishlist = (id) =>
  getWishlist().some((item) => item.id === id || item.productId === id);

export const toggleWishlist = (product) => {
  const item = normalizeItem(product);
  const wishlist = getWishlist();
  const exists = wishlist.some((wishlistItem) => wishlistItem.id === item.id);

  const next = exists
    ? wishlist.filter((wishlistItem) => wishlistItem.id !== item.id)
    : [...wishlist, item];

  saveWishlist(next);
  return { wishlist: next, added: !exists };
};

export const removeWishlistItem = (id) => {
  const next = getWishlist().filter((item) => item.id !== id);
  saveWishlist(next);
  return next;
};