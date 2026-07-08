import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartCount } from "../../utils/cartUtils";
import { getUser, isLoggedIn, logout } from "../../utils/authUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(getCartCount());
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const sync = () => {
      setCartCount(getCartCount());
      setUser(getUser());
    };

    window.addEventListener("cart:updated", sync);
    window.addEventListener("auth:updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("cart:updated", sync);
      window.removeEventListener("auth:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = search.trim();

    if (!value) {
      navigate("/products");
      return;
    }

    navigate(`/products?keyword=${encodeURIComponent(value)}`);
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth:updated"));
    navigate("/");
  };

  return (
    <header className="safe-header">
      <div className="safe-container safe-header-main">
        <Link to="/" className="safe-logo">
          <span>S</span>
          <div>
            <strong>ShopSphere</strong>
            <small>Repellent Store</small>
          </div>
        </Link>

        <form className="safe-search" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search snake, solar, ultrasonic repellers"
          />
          <button type="submit">Search</button>
        </form>

        <div className="safe-actions">
          {isLoggedIn() ? (
            <>
              <span className="safe-user">Hi, {user?.name?.split(" ")[0] || "User"}</span>
              <button type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          <Link to="/orders">Orders</Link>
          <Link to="/cart" className="safe-cart">Cart ({cartCount})</Link>
        </div>
      </div>

      <nav className="safe-nav">
        <div className="safe-container">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/products?keyword=snake">Snake Repellers</NavLink>
          <NavLink to="/products?keyword=solar">Solar Repellers</NavLink>
          <NavLink to="/products?keyword=ultrasonic">Ultrasonic</NavLink>
          <NavLink to="/support">Support</NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;