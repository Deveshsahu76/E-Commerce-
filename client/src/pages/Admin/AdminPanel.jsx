import { useEffect, useState } from "react";
import ProductImageUploader from "../../components/admin/ProductImageUploader";
import "./admin.css";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://e-commerce-backend-1i0x.onrender.com/api";

const emptyProduct = {
  name: "",
  category: "Snake Repeller",
  brand: "SonicRaksha",
  price: "",
  originalPrice: "",
  stock: "",
  shortDescription: "",
  description: "",
  highlights: "",
  tags: "",
  images: "",
  isFeatured: false,
  isActive: true,
};

const categories = [
  "Snake Repeller",
  "Solar Repeller",
  "Ultrasonic Pest Repeller",
  "Rodent Control",
  "Outdoor Protection",
];

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("SonicRakshaToken") ||
    ""
  );
};

const setAdminSession = (data = {}) => {
  const token =
    data.token ||
    data.accessToken ||
    data.user?.token ||
    data.data?.token ||
    "";

  const user = data.user || data.data?.user || data;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return token;
};

const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("SonicRakshaToken");
  localStorage.removeItem("user");
};

const request = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

const adminLogin = async ({ email, password }) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  const token = setAdminSession(data);

  if (!token) {
    throw new Error("Login token not received from backend");
  }

  return data;
};

const formatPrice = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getImage = (product = {}) => {
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }

  return product.image || product.imageUrl || "";
};

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Checking admin access...");

    try {
      await adminLogin(form);
      setMessage("");
      onLogin();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span>Protected Admin</span>
        <h1>SonicRaksha Admin Login</h1>
        <p>Only the configured admin account can access product and order management.</p>

        <label>
          Admin Email
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />
        </label>

        <button type="submit">Login as Admin</button>

        {message ? <p className="admin-alert">{message}</p> : null}

        <a href="/" className="admin-back-link">
          Back to Store
        </a>
      </form>
    </main>
  );
};

const AdminPanel = () => {
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));
  const [checkingAccess, setCheckingAccess] = useState(Boolean(getToken()));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const logoutAdmin = () => {
    clearAdminSession();
    setIsAuthed(false);
    setProducts([]);
    setOrders([]);
    setMessage("");
  };

  const handleAuthError = (error) => {
    const text = String(error.message || "");

    if (
      text.includes("401") ||
      text.includes("403") ||
      text.toLowerCase().includes("admin") ||
      text.toLowerCase().includes("token") ||
      text.toLowerCase().includes("access")
    ) {
      clearAdminSession();
      setIsAuthed(false);
    }

    setMessage(text);
  };

  const loadProducts = async () => {
    const data = await request("/admin/products");
    setProducts(data.products || []);
  };

  const loadOrders = async () => {
    try {
      const data = await request("/admin/orders");
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
  };

  const loadAll = async () => {
    if (!getToken()) {
      setIsAuthed(false);
      setCheckingAccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await loadProducts();
      await loadOrders();
      setIsAuthed(true);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      loadAll();
    } else {
      setCheckingAccess(false);
    }
  }, [isAuthed]);

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setMessage("Saving product...");

      const payload = {
        ...form,
        price: Number(form.price || 0),
        originalPrice: Number(form.originalPrice || 0),
        stock: Number(form.stock || 0),
        images: String(form.images || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await request(`/admin/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setMessage("Product updated successfully");
      } else {
        await request("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setMessage("Product added successfully");
      }

      resetForm();
      setActiveTab("products");
      await loadProducts();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id || product.id);

    setForm({
      name: product.name || "",
      category: product.category || "Snake Repeller",
      brand: product.brand || "SonicRaksha",
      price: product.price || "",
      originalPrice: product.originalPrice || product.mrp || "",
      stock: product.stock || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      highlights: Array.isArray(product.highlights)
        ? product.highlights.join("\n")
        : "",
      tags: Array.isArray(product.tags)
        ? product.tags.join("\n")
        : "",
      images: Array.isArray(product.images)
        ? product.images
            .map((item) => (typeof item === "string" ? item : item?.url || ""))
            .filter(Boolean)
            .join("\n")
        : product.image || product.imageUrl || "",
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive === undefined ? true : Boolean(product.isActive),
    });

    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await request(`/admin/products/${id}`, {
        method: "DELETE",
      });

      setMessage("Product deleted successfully");
      await loadProducts();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleOrderStatus = async (id, value) => {
    try {
      await request(`/admin/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: value }),
      });

      setMessage("Order status updated");
      await loadOrders();
    } catch (error) {
      handleAuthError(error);
    }
  };

  if (checkingAccess) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <span>Checking</span>
          <h1>Verifying admin access...</h1>
          <p>Please wait.</p>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return <AdminLogin onLogin={() => setIsAuthed(true)} />;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-logo-img-wrap"><img src="/sonicraksha-logo.png" alt="SonicRaksha" /></span>
          <div>
            <strong>SonicRaksha</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <button type="button" onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        <button type="button" onClick={() => setActiveTab("products")}>
          Products
        </button>
        <button type="button" onClick={() => setActiveTab("add")}>
          Add Product
        </button>
        <button type="button" onClick={() => setActiveTab("orders")}>
          Orders
        </button>

        <a href="/">Back to Store</a>

        <button type="button" onClick={logoutAdmin}>
          Logout Admin
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Smart Protection for Home & Farm</span>
            <h1>Admin Management</h1>
          </div>

          <button type="button" onClick={loadAll}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {message ? <p className="admin-alert">{message}</p> : null}

        {activeTab === "dashboard" ? (
          <section className="admin-cards">
            <article>
              <span>Total Products</span>
              <strong>{products.length}</strong>
            </article>

            <article>
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </article>

            <article>
              <span>Low Stock</span>
              <strong>
                {products.filter((product) => Number(product.stock || 0) <= 5).length}
              </strong>
            </article>
          </section>
        ) : null}

        {activeTab === "products" ? (
          <section className="admin-panel-card">
            <div className="admin-card-head">
              <h2>Products</h2>
              <button type="button" onClick={() => setActiveTab("add")}>
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="admin-empty">
                <h3>No products added yet</h3>
                <p>Admin can add products from Add Product section.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id || product.id}>
                        <td>
                          <div className="admin-product-cell">
                            {getImage(product) ? (
                              <img src={getImage(product)} alt={product.name} />
                            ) : (
                              <span>No Image</span>
                            )}
                            <strong>{product.name}</strong>
                          </div>
                        </td>
                        <td>{product.category || "-"}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.stock || 0}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button type="button" onClick={() => handleEdit(product)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDelete(product._id || product.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "add" ? (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-card-head">
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
              {editingId ? (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <div className="admin-form-grid">
              <label>
                Product Name *
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>

              <label>
                Category
                <select name="category" value={form.category} onChange={handleChange}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Brand
                <input name="brand" value={form.brand} onChange={handleChange} />
              </label>

              <label>
                Price *
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Original Price
                <input
                  name="originalPrice"
                  type="number"
                  value={form.originalPrice}
                  onChange={handleChange}
                />
              </label>

              <label>
                Stock *
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Short Description
              <input
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
              />
            </label>

            <label>
              Full Description
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Write complete product description, usage and benefits"
              />
            </label>

            <label>
              Product Highlights
              <textarea
                name="highlights"
                rows="6"
                value={form.highlights}
                onChange={handleChange}
                placeholder={"Write one highlight per line\n\nExample:\nSolar powered device\nWeather resistant body\nEasy installation\nSuitable for home and farm\nLow maintenance"}
              />
              <small>Write one product highlight on each line.</small>
            </label>

            <label>
              Search Tags
              <textarea
                name="tags"
                rows="4"
                value={form.tags}
                onChange={handleChange}
                placeholder={"Write one search tag per line\n\nExample:\nsnake repellent\nsolar pest control\nfarm protection\ngarden safety"}
              />
              <small>These tags will help users find the product.</small>
            </label>

            <ProductImageUploader
              value={form.images}
              onChange={(images) =>
                setForm((previous) => ({
                  ...previous,
                  images,
                }))
              }
              onMessage={setMessage}
            />

            <div className="admin-product-options">
              <label className="admin-check">
                <input
                  name="isFeatured"
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured Product
              </label>

              <label className="admin-check">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                Active Product
              </label>
            </div>

            <button type="submit" className="admin-primary-btn">
              {editingId ? "Update Product" : "Add Product"}
            </button>
          </form>
        ) : null}

        {activeTab === "orders" ? (
          <section className="admin-panel-card">
            <div className="admin-card-head">
              <h2>Orders</h2>
              <button type="button" onClick={loadOrders}>
                Refresh Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty">
                <h3>No orders yet</h3>
                <p>Customer orders will appear here.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id || order.id}>
                        <td>{String(order._id || order.id).slice(-8)}</td>
                        <td>{formatPrice(order.totalAmount || order.totalPrice || order.total)}</td>
                        <td>
                          <select
                            value={order.orderStatus || order.status || "Pending"}
                            onChange={(event) =>
                              handleOrderStatus(order._id || order.id, event.target.value)
                            }
                          >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Packed</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
};

export default AdminPanel;