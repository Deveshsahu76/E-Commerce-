import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../../utils/cartStorage";

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const Cart = () => {
  const [items, setItems] = useState([]);

  const loadCart = () => {
    setItems(getCartItems());
  };

  useEffect(() => {
    loadCart();

    window.addEventListener("cart-updated", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("cart-updated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [items]);

  const deliveryFee = subtotal === 0 || subtotal >= 999 ? 0 : 99;
  const platformFee = subtotal === 0 ? 0 : 19;
  const total = subtotal + deliveryFee + platformFee;

  const handleQuantityChange = (productId, quantity) => {
    const updated = updateCartItemQuantity(productId, quantity);
    setItems(updated);
  };

  const handleRemove = (productId) => {
    const updated = removeCartItem(productId);
    setItems(updated);
    toast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    clearCart();
    setItems([]);
    toast.success("Cart cleared");
  };

  if (items.length === 0) {
    return (
      <main>
        <section className="page-hero">
          <div className="container page-hero__inner">
            <span className="eyebrow">Shopping Cart</span>
            <h1>Your cart is empty.</h1>
            <p>
              Add products to your cart and continue to checkout when you are ready.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="empty-state empty-state--large">
              <h3>No items in cart</h3>
              <p>Browse products and add your favourite items to start shopping.</p>
              <Link to="/products" className="btn btn--large">
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Shopping Cart</span>
          <h1>Review your cart before checkout.</h1>
          <p>
            Update quantities, remove items, and continue to secure payment checkout.
          </p>
        </div>
      </section>

      <section className="section cart-section">
        <div className="container cart-grid">
          <div className="cart-list">
            <div className="cart-list__header">
              <div>
                <h2>Cart items</h2>
                <p>
                  {items.length} item{items.length === 1 ? "" : "s"} added
                </p>
              </div>

              <button type="button" className="btn btn--ghost" onClick={handleClearCart}>
                Clear Cart
              </button>
            </div>

            {items.map((item) => (
              <article className="cart-item" key={item.productId}>
                <Link to={`/products/${item.productId}`} className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </Link>

                <div className="cart-item__content">
                  <div>
                    <span className="cart-item__category">{item.category}</span>
                    <h3>
                      <Link to={`/products/${item.productId}`}>{item.name}</Link>
                    </h3>
                    <p>{formatPrice(item.price)} per item</p>
                  </div>

                  <div className="cart-item__actions">
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.productId, Number(item.quantity) - 1)
                        }
                        disabled={Number(item.quantity) <= 1}
                      >
                        −
                      </button>
                      <strong>{item.quantity}</strong>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item.productId, Number(item.quantity) + 1)
                        }
                        disabled={
                          Number(item.stock || 999) > 0 &&
                          Number(item.quantity) >= Number(item.stock)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => handleRemove(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item__total">
                  <strong>
                    {formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}
                  </strong>
                  <span>{item.stock} in stock</span>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</strong>
            </div>

            <div className="summary-row">
              <span>Platform fee</span>
              <strong>{formatPrice(platformFee)}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-row--total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <Link to="/checkout" className="btn btn--large cart-summary__checkout">
              Proceed to Checkout
            </Link>

            <Link to="/products" className="cart-summary__continue">
              Continue shopping →
            </Link>

            <div className="cart-summary__trust">
              <p>🔒 Secure checkout ready</p>
              <p>💳 Razorpay payment flow next</p>
              <p>📦 Order tracking API next</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Cart;