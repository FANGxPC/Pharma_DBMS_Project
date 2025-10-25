import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "inventory":
          const invResponse = await axios.get(`${API_URL}/inventory`);
          setInventory(invResponse.data);
          const supResponse = await axios.get(`${API_URL}/suppliers`);
          setSuppliers(supResponse.data);
          break;
        case "suppliers":
          const supResp = await axios.get(`${API_URL}/suppliers`);
          setSuppliers(supResp.data);
          break;
        case "customers":
          const custResponse = await axios.get(`${API_URL}/customers`);
          setCustomers(custResponse.data);
          break;
        case "orders":
          const ordResponse = await axios.get(`${API_URL}/orders`);
          setOrders(ordResponse.data);
          const invResp = await axios.get(`${API_URL}/inventory`);
          setInventory(invResp.data);
          const custResp = await axios.get(`${API_URL}/customers`);
          setCustomers(custResp.data);
          break;
        case "reports":
          // Reports will fetch their own data
          break;
        default:
          break;
      }
    } catch (error) {
      showMessage("Error fetching data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏥 Pharmacy Management System</h1>
      </header>

      <nav className="tab-nav">
        <button
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Inventory
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          🛒 Orders
        </button>
        <button
          className={activeTab === "suppliers" ? "active" : ""}
          onClick={() => setActiveTab("suppliers")}
        >
          🏭 Suppliers
        </button>
        <button
          className={activeTab === "customers" ? "active" : ""}
          onClick={() => setActiveTab("customers")}
        >
          👥 Customers
        </button>
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          📊 Reports
        </button>
      </nav>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <main className="content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === "inventory" && (
              <InventoryTab
                inventory={inventory}
                suppliers={suppliers}
                onRefresh={fetchData}
                showMessage={showMessage}
              />
            )}
            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                inventory={inventory}
                customers={customers}
                onRefresh={fetchData}
                showMessage={showMessage}
              />
            )}
            {activeTab === "suppliers" && (
              <SuppliersTab
                suppliers={suppliers}
                onRefresh={fetchData}
                showMessage={showMessage}
              />
            )}
            {activeTab === "customers" && (
              <CustomersTab
                customers={customers}
                onRefresh={fetchData}
                showMessage={showMessage}
              />
            )}
            {activeTab === "reports" && (
              <ReportsTab showMessage={showMessage} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ========== INVENTORY TAB ==========
function InventoryTab({ inventory, suppliers, onRefresh, showMessage }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [expiringMeds, setExpiringMeds] = useState({
    expired: [],
    near_expiry: [],
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    form: "Tablet",
    strength: "",
    price: "",
    quantity: "",
    supplier_id: "",
    expiry_date: "",
  });

  const [stockUpdateData, setStockUpdateData] = useState({
    medicine_id: "",
    quantity: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/inventory/medicine`, formData);
      showMessage("Medicine added successfully!", "success");
      setShowAddForm(false);
      setFormData({
        name: "",
        form: "Tablet",
        strength: "",
        price: "",
        quantity: "",
        supplier_id: "",
        expiry_date: "",
      });
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/inventory/stock`, stockUpdateData);
      showMessage("Stock updated successfully!", "success");
      setShowUpdateStock(false);
      setStockUpdateData({ medicine_id: "", quantity: "" });
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const handleRetire = async (medicineId) => {
    if (!window.confirm("Are you sure you want to retire this medicine?"))
      return;

    try {
      await axios.put(`${API_URL}/inventory/retire/${medicineId}`);
      showMessage("Medicine retired successfully!", "success");
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const handleRestore = async (medicineId) => {
    if (!window.confirm("Are you sure you want to restore this medicine?"))
      return;

    try {
      await axios.put(`${API_URL}/inventory/restore/${medicineId}`);
      showMessage("Medicine restored successfully!", "success");
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const fetchExpiringMeds = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/expiring`);
      setExpiringMeds(response.data);
      setShowExpiring(true);
    } catch (error) {
      showMessage("Error fetching expiring medicines", "error");
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/low-stock`);
      setLowStockItems(response.data);
      setShowLowStock(true);
    } catch (error) {
      showMessage("Error fetching low stock items", "error");
    }
  };

  const isExpired = (date) => {
    return new Date(date) < new Date();
  };

  const isNearExpiry = (date) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate - today) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Inventory Management</h2>
        <div className="button-group">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? "Cancel" : "+ Add Medicine"}
          </button>
          <button
            onClick={() => setShowUpdateStock(!showUpdateStock)}
            className="btn-secondary"
          >
            {showUpdateStock ? "Cancel" : "📊 Update Stock"}
          </button>
          <button onClick={fetchLowStock} className="btn-warning">
            🔔 Low Stock
          </button>
          <button onClick={fetchExpiringMeds} className="btn-warning">
            ⏰ Expiring
          </button>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            Show Retired
          </label>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Add New Medicine</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Medicine Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <select
              value={formData.form}
              onChange={(e) =>
                setFormData({ ...formData, form: e.target.value })
              }
              required
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
            </select>
            <input
              type="text"
              placeholder="Strength (e.g., 500mg)"
              value={formData.strength}
              onChange={(e) =>
                setFormData({ ...formData, strength: e.target.value })
              }
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Unit Price (₹)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
            <select
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) =>
                setFormData({ ...formData, expiry_date: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Add Medicine
          </button>
        </form>
      )}

      {showUpdateStock && (
        <form onSubmit={handleStockUpdate} className="form-card">
          <h3>Update Stock Quantity</h3>
          <div className="form-grid">
            <select
              value={stockUpdateData.medicine_id}
              onChange={(e) =>
                setStockUpdateData({
                  ...stockUpdateData,
                  medicine_id: e.target.value,
                })
              }
              required
            >
              <option value="">Select Medicine</option>
              {inventory
                .filter((m) => m.is_active === "Y")
                .map((m) => (
                  <option key={m.medicine_id} value={m.medicine_id}>
                    {m.name} - {m.pharma_form} ({m.strength})
                  </option>
                ))}
            </select>
            <input
              type="number"
              placeholder="Quantity to add/subtract"
              value={stockUpdateData.quantity}
              onChange={(e) =>
                setStockUpdateData({
                  ...stockUpdateData,
                  quantity: e.target.value,
                })
              }
              required
            />
          </div>
          <p className="help-text">
            Use positive numbers to add stock, negative to reduce
          </p>
          <button type="submit" className="btn-primary">
            Update Stock
          </button>
        </form>
      )}

      {showLowStock && lowStockItems.length > 0 && (
        <div className="alert-card alert-warning">
          <h3>⚠️ Low Stock Items</h3>
          <button className="close-btn" onClick={() => setShowLowStock(false)}>
            ×
          </button>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Current Qty</th>
                <th>Min Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.medicine_id}>
                  <td>{item.medicine_id}</td>
                  <td>{item.name}</td>
                  <td className="low-stock">{item.qty}</td>
                  <td>{item.min_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showExpiring &&
        (expiringMeds.expired.length > 0 ||
          expiringMeds.near_expiry.length > 0) && (
          <div className="alert-card alert-danger">
            <h3>⏰ Expiring Medicines</h3>
            <button
              className="close-btn"
              onClick={() => setShowExpiring(false)}
            >
              ×
            </button>

            {expiringMeds.expired.length > 0 && (
              <>
                <h4>Expired Medicines</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringMeds.expired.map((med) => (
                      <tr key={med.medicine_id} className="expired-row">
                        <td>{med.medicine_id}</td>
                        <td>{med.name}</td>
                        <td>{med.expiry_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {expiringMeds.near_expiry.length > 0 && (
              <>
                <h4>Near Expiry (Next 90 Days)</h4>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringMeds.near_expiry.map((med) => (
                      <tr key={med.medicine_id}>
                        <td>{med.medicine_id}</td>
                        <td>{med.name}</td>
                        <td>{med.expiry_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Form</th>
              <th>Strength</th>
              <th>Price (₹)</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory
              .filter((item) => includeInactive || item.is_active === "Y")
              .map((item) => (
                <tr
                  key={item.medicine_id}
                  className={isExpired(item.expiry_date) ? "expired-row" : ""}
                >
                  <td>{item.medicine_id}</td>
                  <td>{item.name}</td>
                  <td>{item.pharma_form}</td>
                  <td>{item.strength}</td>
                  <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className={item.qty < 20 ? "low-stock" : ""}>
                    {item.qty}
                  </td>
                  <td>{item.expiry_date}</td>
                  <td>
                    {item.is_active === "N" ? (
                      <span className="badge badge-secondary">Retired</span>
                    ) : isExpired(item.expiry_date) ? (
                      <span className="badge badge-danger">Expired</span>
                    ) : isNearExpiry(item.expiry_date) ? (
                      <span className="badge badge-warning">Near Expiry</span>
                    ) : item.qty < 20 ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>
                    {item.is_active === "Y" ? (
                      <button
                        onClick={() => handleRetire(item.medicine_id)}
                        className="btn-sm btn-danger"
                      >
                        Retire
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(item.medicine_id)}
                        className="btn-sm btn-success"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== ORDERS TAB ==========
function OrdersTab({ orders, inventory, customers, onRefresh, showMessage }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { medicine_id: "", quantity: "" },
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { medicine_id: "", quantity: "" }]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const items = orderItems.map((item) => parseInt(item.medicine_id));
      const quantities = orderItems.map((item) => parseInt(item.quantity));

      await axios.post(`${API_URL}/orders`, {
        customer_id: parseInt(selectedCustomer),
        items,
        quantities,
      });

      showMessage("Order placed successfully!", "success");
      setShowCreateForm(false);
      setOrderItems([{ medicine_id: "", quantity: "" }]);
      setSelectedCustomer("");
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const isExpired = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Orders Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Cancel" : "+ New Order"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmitOrder} className="form-card">
          <h3>Create New Order</h3>

          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            required
            className="full-width"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.name} - {c.phone}
              </option>
            ))}
          </select>

          <h4>Order Items</h4>
          {orderItems.map((item, index) => (
            <div key={index} className="order-item-row">
              <select
                value={item.medicine_id}
                onChange={(e) =>
                  handleItemChange(index, "medicine_id", e.target.value)
                }
                required
              >
                <option value="">Select Medicine</option>
                {inventory
                  .filter(
                    (m) => m.is_active === "Y" && !isExpired(m.expiry_date)
                  )
                  .map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.name} - {m.pharma_form} ({m.strength}) - ₹
                      {m.unit_price} [Stock: {m.qty}]
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                required
                min="1"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="btn-danger"
                disabled={orderItems.length === 1}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="btn-secondary"
          >
            + Add Item
          </button>
          <button type="submit" className="btn-primary">
            Place Order
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.order_id}>
                <tr>
                  <td>#{order.order_id}</td>
                  <td>{order.order_date}</td>
                  <td>{order.customer_name || "N/A"}</td>
                  <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="badge badge-success">{order.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.order_id
                            ? null
                            : order.order_id
                        )
                      }
                      className="btn-sm btn-secondary"
                    >
                      {expandedOrder === order.order_id ? "Hide" : "View"} Items
                    </button>
                  </td>
                </tr>
                {expandedOrder === order.order_id && (
                  <tr className="expanded-row">
                    <td colSpan="6">
                      <div className="order-items">
                        <h4>Order Items:</h4>
                        <table className="nested-table">
                          <thead>
                            <tr>
                              <th>Medicine</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.medicine_name}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.unit_price.toFixed(2)}</td>
                                <td>₹{item.line_total.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== SUPPLIERS TAB ==========
function SuppliersTab({ suppliers, onRefresh, showMessage }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performance, setPerformance] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/suppliers`, formData);
      showMessage("Supplier added successfully!", "success");
      setShowAddForm(false);
      setFormData({ name: "", email: "", phone: "" });
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await axios.get(`${API_URL}/suppliers/performance`);
      setPerformance(response.data);
      setShowPerformance(true);
    } catch (error) {
      showMessage("Error fetching supplier performance", "error");
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Supplier Management</h2>
        <div className="button-group">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? "Cancel" : "+ Add Supplier"}
          </button>
          <button onClick={fetchPerformance} className="btn-secondary">
            📊 Performance
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Add New Supplier</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Supplier Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Add Supplier
          </button>
        </form>
      )}

      {showPerformance && (
        <div className="alert-card alert-info">
          <h3>📊 Supplier Performance</h3>
          <button
            className="close-btn"
            onClick={() => setShowPerformance(false)}
          >
            ×
          </button>
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Medicines Count</th>
                <th>Avg Price</th>
                <th>Max Price</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((perf) => (
                <tr key={perf.supplier_id}>
                  <td>{perf.name}</td>
                  <td>{perf.medicines_count}</td>
                  <td>₹{perf.avg_price.toFixed(2)}</td>
                  <td>₹{perf.max_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.supplier_id}>
                <td>{supplier.supplier_id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.contact_email}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== CUSTOMERS TAB ==========
function CustomersTab({ customers, onRefresh, showMessage }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/customers`, formData);
      showMessage("Customer added successfully!", "success");
      setShowAddForm(false);
      setFormData({ name: "", phone: "", email: "", address: "" });
      onRefresh();
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Customer Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>Add New Customer</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Customer Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="full-width"
            />
          </div>
          <button type="submit" className="btn-primary">
            Add Customer
          </button>
        </form>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customer_id}>
                <td>{customer.customer_id}</td>
                <td>{customer.name}</td>
                <td>{customer.phone || "N/A"}</td>
                <td>{customer.email || "N/A"}</td>
                <td>{customer.address || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ========== REPORTS TAB ==========
function ReportsTab({ showMessage }) {
  const [activeReport, setActiveReport] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [aboveAvgMeds, setAboveAvgMeds] = useState([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, days]);

  const fetchReportData = async () => {
    try {
      switch (activeReport) {
        case "sales":
          const salesResp = await axios.get(
            `${API_URL}/reports/sales-summary?days=${days}`
          );
          setSalesData(salesResp.data);
          break;
        case "audit":
          const auditResp = await axios.get(
            `${API_URL}/reports/audit-log?limit=50`
          );
          setAuditLog(auditResp.data);
          break;
        case "pricing":
          const pricingResp = await axios.get(
            `${API_URL}/reports/above-average-price`
          );
          setAboveAvgMeds(pricingResp.data);
          break;
        default:
          break;
      }
    } catch (error) {
      showMessage("Error fetching report data", "error");
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Reports & Analytics</h2>
      </div>

      <div className="report-tabs">
        <button
          className={activeReport === "sales" ? "active" : ""}
          onClick={() => setActiveReport("sales")}
        >
          📈 Sales Summary
        </button>
        <button
          className={activeReport === "pricing" ? "active" : ""}
          onClick={() => setActiveReport("pricing")}
        >
          💰 Above Avg Price
        </button>
        <button
          className={activeReport === "audit" ? "active" : ""}
          onClick={() => setActiveReport("audit")}
        >
          📋 Audit Log
        </button>
      </div>

      {activeReport === "sales" && (
        <div className="report-content">
          <div className="report-controls">
            <label>
              Show last
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </label>
          </div>

          {salesData.length > 0 ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Orders</h4>
                  <p className="stat-value">
                    {salesData.reduce((sum, d) => sum + d.orders, 0)}
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Total Sales</h4>
                  <p className="stat-value">
                    ₹
                    {salesData
                      .reduce((sum, d) => sum + d.total_sales, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="stat-card">
                  <h4>Average Order</h4>
                  <p className="stat-value">
                    ₹
                    {(
                      salesData.reduce((sum, d) => sum + d.total_sales, 0) /
                        salesData.reduce((sum, d) => sum + d.orders, 0) || 0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Total Sales</th>
                    <th>Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((day, idx) => (
                    <tr key={idx}>
                      <td>{day.sale_date}</td>
                      <td>{day.orders}</td>
                      <td>₹{day.total_sales.toFixed(2)}</td>
                      <td>₹{day.avg_order.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="no-data">
              No sales data available for the selected period
            </p>
          )}
        </div>
      )}

      {activeReport === "pricing" && (
        <div className="report-content">
          <h3>Medicines Priced Above Average</h3>
          {aboveAvgMeds.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Medicine ID</th>
                  <th>Name</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {aboveAvgMeds.map((med) => (
                  <tr key={med.medicine_id}>
                    <td>{med.medicine_id}</td>
                    <td>{med.name}</td>
                    <td>₹{med.unit_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No medicines found above average price</p>
          )}
        </div>
      )}

      {activeReport === "audit" && (
        <div className="report-content">
          <h3>Audit Log (Recent 50 entries)</h3>
          {auditLog.length > 0 ? (
            <div className="audit-log">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Object</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((log) => (
                    <tr key={log.audit_id}>
                      <td>{log.audit_id}</td>
                      <td>{log.action_by}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            log.action === "INSERT"
                              ? "success"
                              : log.action === "UPDATE"
                              ? "warning"
                              : log.action === "DELETE"
                              ? "danger"
                              : "secondary"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>{log.object_name}</td>
                      <td>{log.details}</td>
                      <td>{log.action_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No audit log entries found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
