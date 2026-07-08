import { useEffect, useMemo, useState } from "react";
import {
  adminLogin,
  adminRequest,
  clearAdminSession,
  getAdminToken,
} from "../../services/adminApi";
import "./admin.css";

const emptyProduct = {
  name: "",
  brand: "ShopSphere",
  category: "Snake Repeller",
  price: "",
  originalPrice: "",
  stock: "",
  shortDescription: "",
  description: "",
  images: "",
  highlights: "",
  tags: "",
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

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

const formatPrice = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getProductImage = (product = {}) => {
  if (Array.isArray(product.images) && product.images.length) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }

  return product.image || product.imageUrl || "";
};

const getOrderTotal = (order = {}) => {
  return order.totalAmount || order.totalPrice || order.total || 0;
};

const getOrderName = (order = {}) => {
  return (
    order.user?.name ||
    order.customer?.name ||
    order.shippingAddress?.name ||
    order.name ||
    "Customer"
  );
};

const AdminLogin = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Checking admin access...");

    try {
      await adminLogin(form);
      setStatus("");
      onLogin();
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span>Admin Panel</span>
        <h1>ShopSphere Admin</h1>
        <p>Login with the admin account to manage products and orders.</p>

        <label>
          Email
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

        {status ? <p className="admin-message">{status}</p> : null}
      </form>
    </main>
  );
};

const ProductForm = ({ form, setForm, onSubmit, editingId, onCancel }) => {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="admin-form__head">
        <div>
          <span>Product Form</span>
          <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
        </div>

        {editingId ? (
          <button type="button" className="admin-light-btn" onClick={onCancel}>
            Cancel Edit
          </button>
        ) : null}
      </div>

      <div className="admin-form-grid">
        <label>
          Product Name *
          <input
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Example: Solar Snake Repellent"
            required
          />
        </label>

        <label>
          Category *
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label>
          Brand
          <input
            value={form.brand}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, brand: event.target.value }))
            }
            placeholder="Brand name"
          />
        </label>

        <label>
          Price *
          <input
            type="number"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
            required
          />
        </label>

        <label>
          Original Price
          <input
            type="number"
            value={form.originalPrice}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, originalPrice: event.target.value }))
            }
          />
        </label>

        <label>
          Stock *
          <input
            type="number"
            value={form.stock}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, stock: event.target.value }))
            }
            required
          />
        </label>
      </div>

      <label>
        Short Description
        <input
          value={form.shortDescription}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, shortDescription: event.target.value }))
          }
          placeholder="Short product line for product card"
        />
      </label>

      <label>
        Full Description
        <textarea
          rows="4"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Detailed product description"
        />
      </label>

      <label>
        Product Image URLs
        <textarea
          rows="3"
          value={form.images}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, images: event.target.value }))
          }
          placeholder="Paste one image URL per line"
        />
      </label>

      <label>
        Highlights
        <textarea
          rows="3"
          value={form.highlights}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, highlights: event.target.value }))
          }
          placeholder="One highlight per line"
        />
      </label>

      <label>
        Tags
        <input
          value={form.tags}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, tags: event.target.value }))
          }
          placeholder="snake, solar, ultrasonic"
        />
      </label>

      <div className="admin-check-row">
        <label>
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))
            }
          />
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          Active
        </label>
      </div>

      <button type="submit" className="admin-primary-btn">
        {editingId ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
};

const AdminPanel = () => {
  const [isAuthed, setIsAuthed] = useState(Boolean(getAdminToken()));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => Number(product.stock || 0) <= 5);
  }, [products]);

  const loadAdminData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [dashboardData, productsData, ordersData] = await Promise.all([
        adminRequest("/admin/dashboard"),
        adminRequest("/admin/products"),
        adminRequest("/admin/orders"),
      ]);

      setStats(dashboardData.stats || {});
      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
    } catch (error) {
      setMessage(error.message);

      if (error.message.toLowerCase().includes("admin")) {
        setIsAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) loadAdminData();
  }, [isAuthed]);

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId("");
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setMessage("Saving product...");

    try {
      if (editingId) {
        await adminRequest(`/admin/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setMessage("Product updated successfully");
      } else {
        await adminRequest("/admin/products", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMessage("Product added successfully");
      }

      resetForm();
      await loadAdminData();
      setActiveTab("products");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id || product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "ShopSphere",
      category: product.category || "Snake Repeller",
      price: product.price || "",
      originalPrice: product.originalPrice || product.mrp || "",
      stock: product.stock || "",
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      images: Array.isArray(product.images)
        ? product.images
            .map((item) => (typeof item === "string" ? item : item?.url || ""))
            .filter(Boolean)
            .join("\n")
        : product.image || product.imageUrl || "",
      highlights: Array.isArray(product.highlights)
        ? product.highlights.join("\n")
        : "",
      tags: Array.isArray(product.tags) ? product.tags.join("\n") : "",
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive === undefined ? true : Boolean(product.isActive),
    });

    setActiveTab("add-product");
  };

  const handleDeleteProduct = async (productId) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    setMessage("Deleting product...");

    try {
      await adminRequest(`/admin/products/${productId}`, {
        method: "DELETE",
      });

      setMessage("Product deleted successfully");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleOrderUpdate = async (orderId, field, value) => {
    try {
      await adminRequest(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ [field]: value }),
      });

      setMessage("Order updated");
      await loadAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return <AdminLogin onLogin={() => setIsAuthed(true)} />;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>S</span>
          <div>
            <strong>ShopSphere</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("products")}>Products</button>
        <button onClick={() => setActiveTab("add-product")}>Add Product</button>
        <button onClick={() => setActiveTab("orders")}>Orders</button>

        <a href="/">Back to Store</a>
        <button onClick={handleLogout}>Logout</button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Repellent Store</span>
            <h1>Admin Management</h1>
          </div>

          <button onClick={loadAdminData}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {message ? <p className="admin-alert">{message}</p> : null}

        {activeTab === "dashboard" ? (
          <>
            <section className="admin-cards">
              <article>
                <span>Total Products</span>
                <strong>{stats?.totalProducts || products.length}</strong>
              </article>
              <article>
                <span>Active Products</span>
                <strong>{stats?.activeProducts || products.length}</strong>
              </article>
              <article>
                <span>Low Stock</span>
                <strong>{stats?.lowStockProducts || lowStockProducts.length}</strong>
              </article>
              <article>
                <span>Total Orders</span>
                <strong>{stats?.totalOrders || orders.length}</strong>
              </article>
              <article>
                <span>Pending Orders</span>
                <strong>{stats?.pendingOrders || 0}</strong>
              </article>
              <article>
                <span>Total Revenue</span>
                <strong>{formatPrice(stats?.totalRevenue || 0)}</strong>
              </article>
            </section>

            <section className="admin-panel-card">
              <div className="admin-card-head">
                <h2>Quick Product Setup</h2>
                <button onClick={() => setActiveTab("add-product")}>
                  Add Product
                </button>
              </div>

              <p>
                Product details are not needed from your side. Client/admin can add
                product name, price, stock, description and image URLs from this panel.
              </p>
            </section>
          </>
        ) : null}

        {activeTab === "products" ? (
          <section className="admin-panel-card">
            <div className="admin-card-head">
              <h2>Products</h2>
              <button onClick={() => setActiveTab("add-product")}>
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="admin-empty">
                <h3>No products added yet</h3>
                <p>Admin can add products using Add Product.</p>
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
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id || product.id}>
                        <td>
                          <div className="admin-product-cell">
                            {getProductImage(product) ? (
                              <img src={getProductImage(product)} alt={product.name} />
                            ) : (
                              <span>No Image</span>
                            )}
                            <strong>{product.name}</strong>
                          </div>
                        </td>
                        <td>{product.category || "-"}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.stock || 0}</td>
                        <td>{product.isActive === false ? "Inactive" : "Active"}</td>
                        <td>
                          <div className="admin-row-actions">
                            <button onClick={() => handleEditProduct(product)}>
                              Edit
                            </button>
                            <button
                              className="danger"
                              onClick={() =>
                                handleDeleteProduct(product._id || product.id)
                              }
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

        {activeTab === "add-product" ? (
          <ProductForm
            form={form}
            setForm={setForm}
            onSubmit={handleProductSubmit}
            editingId={editingId}
            onCancel={resetForm}
          />
        ) : null}

        {activeTab === "orders" ? (
          <section className="admin-panel-card">
            <div className="admin-card-head">
              <h2>Orders</h2>
              <button onClick={loadAdminData}>Refresh Orders</button>
            </div>

            {orders.length === 0 ? (
              <div className="admin-empty">
                <h3>No orders yet</h3>
                <p>Customer orders will appear here after checkout.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Order Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id || order.id}>
                        <td>{String(order._id || order.id).slice(-8)}</td>
                        <td>{getOrderName(order)}</td>
                        <td>{formatPrice(getOrderTotal(order))}</td>
                        <td>
                          <select
                            value={order.orderStatus || order.status || "Pending"}
                            onChange={(event) =>
                              handleOrderUpdate(
                                order._id || order.id,
                                "orderStatus",
                                event.target.value
                              )
                            }
                          >
                            {orderStatuses.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={order.paymentStatus || "Pending"}
                            onChange={(event) =>
                              handleOrderUpdate(
                                order._id || order.id,
                                "paymentStatus",
                                event.target.value
                              )
                            }
                          >
                            {paymentStatuses.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
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