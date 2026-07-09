import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../../components/common/ProductCard";
import { getWishlist } from "../../utils/wishlistUtils";

const Wishlist = () => {
  const [items, setItems] = useState(getWishlist());

  useEffect(() => {
    const sync = () => setItems(getWishlist());
    window.addEventListener("wishlist:updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("wishlist:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-hero compact">
          <span className="eyebrow">Wishlist</span>
          <h1>Your saved products.</h1>
          <p>Keep products you like and move them to cart whenever you are ready.</p>
        </div>

        {!items.length ? (
          <div className="state-card spacious">
            <span className="empty-icon"></span>
            <h2>Your wishlist is empty</h2>
            <p>Save products you like and view them here later.</p>
            <Link className="btn btn-primary" to="/products">Explore Products</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((item) => (
              <ProductCard product={item.product || item} key={item.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;