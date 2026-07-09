import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../../utils/cartUtils";
import { formatPrice } from "../../utils/money";
import { getCartSummary, removeFromCart, updateCartQuantity } from "../../utils/cartUtils";
import { toggleWishlist } from "../../utils/wishlistUtils";

const Cart = () => {
  const [summary, setSummary] = useState(getCartSummary());

  const syncCart = () => setSummary(getCartSummary());

  useEffect(() => {
    window.addEventListener("cart:updated", syncCart);
    return () => window.removeEventListener("cart:updated", syncCart);
  }, []);

  const handleMoveToWishlist = (item) => {
    toggleWishlist(item.product || item);
    removeFromCart(item.id);
  };

  if (!summary.cart.length) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="state-card spacious">
            <span className="empty-icon">Ã°Å¸â€ºâ€™</span>
            <h1>Your cart is empty</h1>
            <p>Explore products and add your favourites to start shopping.</p>
            <Link className="btn btn-primary" to="/products">Shop Products</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section cart-page">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Shopping Cart</span>
          <h1>Review your products before checkout.</h1>
          <p>Update quantity, remove items, or continue shopping before placing your order.</p>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {summary.cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <span>{item.brand || "Trusted Brand"}</span>
                  <h2>{item.name}</h2>
                  <strong>{formatPrice(item.price)}</strong>
                  {item.stock <= item.quantity && (
                    <small className="warning-text">Selected quantity matches available stock.</small>
                  )}
                  <div className="cart-item-actions">
                    <button type="button" onClick={() => handleMoveToWishlist(item)}>
                      Move to Wishlist
                    </button>
                    <button type="button" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>

                <div className="quantity-row compact">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  >
                    Ã¢Ë†â€™
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <h2>Order Summary</h2>

            <div className="coupon-box">
              <input placeholder="Coupon code" />
              <button type="button">Apply</button>
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(summary.subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery Fee</span>
              <strong>{summary.deliveryFee === 0 ? "Free" : formatPrice(summary.deliveryFee)}</strong>
            </div>
            <div className="summary-line">
              <span>Discount</span>
              <strong>{formatPrice(summary.discount)}</strong>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <strong>{formatPrice(summary.total)}</strong>
            </div>

            {summary.subtotal < 999 && (
              <p className="free-delivery-note">
                Add products worth {formatPrice(999 - summary.subtotal)} more for free delivery.
              </p>
            )}

            <Link className="btn btn-primary full" to="/checkout">Proceed to Checkout</Link>
            <Link className="btn btn-ghost full" to="/products">Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Cart;