const CART_KEY = "SonicRaksha_cart";

export const getCartItems = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
};

export const saveCartItems = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
};

export const getCartCount = () => {
  return getCartItems().reduce((total, item) => total + Number(item.quantity || 0), 0);
};

export const addProductToCart = (product, quantity = 1) => {
  const items = getCartItems();
  const productId = product?._id;

  if (!productId) {
    throw new Error("Invalid product");
  }

  const existingIndex = items.findIndex((item) => item.productId === productId);
  const image =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image ||
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80";

  const cartItem = {
    productId,
    name: product?.name || "Product",
    price: Number(product?.price || 0),
    image,
    stock: Number(product?.stock || 0),
    category:
      typeof product?.category === "string"
        ? product.category
        : product?.category?.name || "Product",
    quantity: Number(quantity || 1),
  };

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    const nextQuantity = Math.min(
      Number(existing.quantity || 0) + Number(quantity || 1),
      Number(product?.stock || 999)
    );

    items[existingIndex] = {
      ...existing,
      ...cartItem,
      quantity: nextQuantity,
    };
  } else {
    items.push(cartItem);
  }

  saveCartItems(items);
  return items;
};

export const updateCartItemQuantity = (productId, quantity) => {
  const items = getCartItems();

  const updated = items
    .map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: Math.max(1, Math.min(Number(quantity), Number(item.stock || 999))),
          }
        : item
    )
    .filter((item) => item.quantity > 0);

  saveCartItems(updated);
  return updated;
};

export const removeCartItem = (productId) => {
  const updated = getCartItems().filter((item) => item.productId !== productId);
  saveCartItems(updated);
  return updated;
};

export const clearCart = () => {
  saveCartItems([]);
};