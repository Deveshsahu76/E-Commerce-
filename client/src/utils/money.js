export const formatPrice = (value = 0) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

export const calculateDiscount = (product = {}) => {
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || product.mrp || 0);

  if (!originalPrice || originalPrice <= price) {
    return Number(product.discountPercent || 0);
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const getProductImage = (product = {}) => {
  const image = Array.isArray(product.images) ? product.images[0] : product.image;

  return (
    image ||
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80"
  );
};