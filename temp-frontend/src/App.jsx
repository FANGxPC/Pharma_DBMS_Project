import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
    },
  },
};

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Pharmacy Management System
              </h1>
              <p className="text-gray-600">
                Complete inventory and order management
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Dashboard</p>
            <p className="text-sm text-gray-500">Real-time monitoring</p>
          </div>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64"
        >
          <div className="glass-card p-4 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 px-2">
              Navigation
            </h3>
            <div className="space-y-2">
              {[
                { id: "inventory", label: "📦 Inventory", icon: "📦" },
                { id: "orders", label: "🛒 Orders", icon: "🛒" },
                { id: "suppliers", label: "🏭 Suppliers", icon: "🏭" },
                { id: "customers", label: "👥 Customers", icon: "👥" },
                { id: "reports", label: "📊 Reports", icon: "📊" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-lg mr-3">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 mt-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-gray-600">Active Medicines</span>
                <span className="font-bold text-blue-600">
                  {inventory.filter((item) => item.is_active === "Y").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-bold text-green-600">
                  {orders.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-gray-600">Customers</span>
                <span className="font-bold text-purple-600">
                  {customers.length}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl mb-6 ${
                message.type === "error"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center rounded-2xl"
            >
              <div className="flex justify-center items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-600 text-lg">Loading...</span>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 rounded-2xl shadow-lg"
              >
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
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800"
        >
          Inventory Management
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 mt-4 lg:mt-0"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Medicine"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpdateStock(!showUpdateStock)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            {showUpdateStock ? "Cancel" : "📊 Update Stock"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchLowStock}
            className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
          >
            🔔 Low Stock
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchExpiringMeds}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            ⏰ Expiring
          </motion.button>
          <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded text-blue-500"
            />
            <span className="text-gray-700">Show Retired</span>
          </label>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-6 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Add New Medicine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.form}
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Add Medicine
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdateStock && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleStockUpdate}
            className="glass-card p-6 mb-6 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Update Stock Quantity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={stockUpdateData.medicine_id}
                onChange={(e) =>
                  setStockUpdateData({
                    ...stockUpdateData,
                    medicine_id: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <p className="text-gray-600 mb-4">
              Use positive numbers to add stock, negative to reduce
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Update Stock
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLowStock && lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-yellow-800">
                ⚠️ Low Stock Items
              </h3>
              <button
                onClick={() => setShowLowStock(false)}
                className="text-yellow-600 hover:text-yellow-800 text-xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-200">
                    <th className="text-left py-2 text-yellow-800">ID</th>
                    <th className="text-left py-2 text-yellow-800">Name</th>
                    <th className="text-left py-2 text-yellow-800">
                      Current Qty
                    </th>
                    <th className="text-left py-2 text-yellow-800">
                      Min Threshold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr
                      key={item.medicine_id}
                      className="border-b border-yellow-100"
                    >
                      <td className="py-3">{item.medicine_id}</td>
                      <td className="py-3">{item.name}</td>
                      <td className="py-3 text-red-600 font-semibold">
                        {item.qty}
                      </td>
                      <td className="py-3">{item.min_threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExpiring &&
          (expiringMeds.expired.length > 0 ||
            expiringMeds.near_expiry.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-red-800">
                  ⏰ Expiring Medicines
                </h3>
                <button
                  onClick={() => setShowExpiring(false)}
                  className="text-red-600 hover:text-red-800 text-xl"
                >
                  ×
                </button>
              </div>

              {expiringMeds.expired.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-red-700 mb-3">
                    Expired Medicines
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-red-200">
                          <th className="text-left py-2 text-red-800">ID</th>
                          <th className="text-left py-2 text-red-800">Name</th>
                          <th className="text-left py-2 text-red-800">
                            Expiry Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringMeds.expired.map((med) => (
                          <tr
                            key={med.medicine_id}
                            className="border-b border-red-100"
                          >
                            <td className="py-3">{med.medicine_id}</td>
                            <td className="py-3">{med.name}</td>
                            <td className="py-3 text-red-600">
                              {med.expiry_date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {expiringMeds.near_expiry.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-orange-700 mb-3">
                    Near Expiry (Next 90 Days)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-200">
                          <th className="text-left py-2 text-orange-800">ID</th>
                          <th className="text-left py-2 text-orange-800">
                            Name
                          </th>
                          <th className="text-left py-2 text-orange-800">
                            Expiry Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringMeds.near_expiry.map((med) => (
                          <tr
                            key={med.medicine_id}
                            className="border-b border-orange-100"
                          >
                            <td className="py-3">{med.medicine_id}</td>
                            <td className="py-3">{med.name}</td>
                            <td className="py-3 text-orange-600">
                              {med.expiry_date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Form
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Strength
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Price (₹)
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Quantity
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Expiry Date
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter((item) => includeInactive || item.is_active === "Y")
                .map((item) => (
                  <motion.tr
                    key={item.medicine_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      isExpired(item.expiry_date) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="py-4 px-6">{item.medicine_id}</td>
                    <td className="py-4 px-6 font-medium">{item.name}</td>
                    <td className="py-4 px-6">{item.pharma_form}</td>
                    <td className="py-4 px-6">{item.strength}</td>
                    <td className="py-4 px-6">
                      ₹{parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td
                      className={`py-4 px-6 ${
                        item.qty < 20 ? "text-red-600 font-semibold" : ""
                      }`}
                    >
                      {item.qty}
                    </td>
                    <td className="py-4 px-6">{item.expiry_date}</td>
                    <td className="py-4 px-6">
                      {item.is_active === "N" ? (
                        <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                          Retired
                        </span>
                      ) : isExpired(item.expiry_date) ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Expired
                        </span>
                      ) : isNearExpiry(item.expiry_date) ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          Near Expiry
                        </span>
                      ) : item.qty < 20 ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.is_active === "Y" ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRetire(item.medicine_id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Retire
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRestore(item.medicine_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Restore
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800"
        >
          Orders Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Order"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitOrder}
            className="glass-card p-6 mb-6 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Create New Order
            </h3>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} - {c.phone}
                </option>
              ))}
            </select>

            <h4 className="text-lg font-semibold mb-3 text-gray-700">
              Order Items
            </h4>
            {orderItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row gap-4 mb-4"
              >
                <select
                  value={item.medicine_id}
                  onChange={(e) =>
                    handleItemChange(index, "medicine_id", e.target.value)
                  }
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  disabled={orderItems.length === 1}
                >
                  Remove
                </motion.button>
              </motion.div>
            ))}

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                + Add Item
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Place Order
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Order ID
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Customer
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Total Amount
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.order_id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 font-medium">#{order.order_id}</td>
                    <td className="py-4 px-6">{order.order_date}</td>
                    <td className="py-4 px-6">
                      {order.customer_name || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setExpandedOrder(
                            expandedOrder === order.order_id
                              ? null
                              : order.order_id
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        {expandedOrder === order.order_id ? "Hide" : "View"}{" "}
                        Items
                      </motion.button>
                    </td>
                  </motion.tr>
                  {expandedOrder === order.order_id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-blue-50"
                    >
                      <td colSpan="6" className="p-6">
                        <div className="bg-white rounded-xl p-4 shadow-inner">
                          <h4 className="text-lg font-semibold mb-3 text-gray-800">
                            Order Items:
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 text-gray-700">
                                    Medicine
                                  </th>
                                  <th className="text-left py-2 text-gray-700">
                                    Quantity
                                  </th>
                                  <th className="text-left py-2 text-gray-700">
                                    Unit Price
                                  </th>
                                  <th className="text-left py-2 text-gray-700">
                                    Line Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-3">
                                      {item.medicine_name}
                                    </td>
                                    <td className="py-3">{item.quantity}</td>
                                    <td className="py-3">
                                      ₹{item.unit_price.toFixed(2)}
                                    </td>
                                    <td className="py-3">
                                      ₹{item.line_total.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800"
        >
          Supplier Management
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 mt-4 lg:mt-0"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Supplier"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchPerformance}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            📊 Performance
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-6 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Add New Supplier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Supplier Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Add Supplier
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerformance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-800">
                📊 Supplier Performance
              </h3>
              <button
                onClick={() => setShowPerformance(false)}
                className="text-blue-600 hover:text-blue-800 text-xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 text-blue-800">Supplier</th>
                    <th className="text-left py-2 text-blue-800">
                      Medicines Count
                    </th>
                    <th className="text-left py-2 text-blue-800">Avg Price</th>
                    <th className="text-left py-2 text-blue-800">Max Price</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((perf) => (
                    <tr
                      key={perf.supplier_id}
                      className="border-b border-blue-100"
                    >
                      <td className="py-3">{perf.name}</td>
                      <td className="py-3">{perf.medicines_count}</td>
                      <td className="py-3">₹{perf.avg_price.toFixed(2)}</td>
                      <td className="py-3">₹{perf.max_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Phone
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <motion.tr
                  key={supplier.supplier_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">{supplier.supplier_id}</td>
                  <td className="py-4 px-6 font-medium">{supplier.name}</td>
                  <td className="py-4 px-6">{supplier.contact_email}</td>
                  <td className="py-4 px-6">{supplier.phone}</td>
                  <td className="py-4 px-6">{supplier.created_at}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-gray-800"
        >
          Customer Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Customer"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 mb-6 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Add New Customer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Add Customer
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Phone
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                  Address
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <motion.tr
                  key={customer.customer_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">{customer.customer_id}</td>
                  <td className="py-4 px-6 font-medium">{customer.name}</td>
                  <td className="py-4 px-6">{customer.phone || "N/A"}</td>
                  <td className="py-4 px-6">{customer.email || "N/A"}</td>
                  <td className="py-4 px-6">{customer.address || "N/A"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-bold text-gray-800 mb-6"
      >
        Reports & Analytics
      </motion.h2>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "sales", label: "📈 Sales Summary", icon: "📈" },
          { id: "pricing", label: "💰 Above Avg Price", icon: "💰" },
          { id: "audit", label: "📋 Audit Log", icon: "📋" },
        ].map((report) => (
          <motion.button
            key={report.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              activeReport === report.id
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
            }`}
            onClick={() => setActiveReport(report.id)}
          >
            {report.label}
          </motion.button>
        ))}
      </motion.div>

      {activeReport === "sales" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Sales Summary
            </h3>
            <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border">
              <span className="text-gray-700">Show last</span>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="focus:outline-none"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-6 rounded-2xl text-center"
                >
                  <h4 className="text-gray-600 mb-2">Total Orders</h4>
                  <p className="text-3xl font-bold text-blue-600">
                    {salesData.reduce((sum, d) => sum + d.orders, 0)}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-6 rounded-2xl text-center"
                >
                  <h4 className="text-gray-600 mb-2">Total Sales</h4>
                  <p className="text-3xl font-bold text-green-600">
                    ₹
                    {salesData
                      .reduce((sum, d) => sum + d.total_sales, 0)
                      .toFixed(2)}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="glass-card p-6 rounded-2xl text-center"
                >
                  <h4 className="text-gray-600 mb-2">Average Order</h4>
                  <p className="text-3xl font-bold text-purple-600">
                    ₹
                    {(
                      salesData.reduce((sum, d) => sum + d.total_sales, 0) /
                        salesData.reduce((sum, d) => sum + d.orders, 0) || 0
                    ).toFixed(2)}
                  </p>
                </motion.div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                          Date
                        </th>
                        <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                          Orders
                        </th>
                        <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                          Total Sales
                        </th>
                        <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                          Avg Order
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((day, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-6">{day.sale_date}</td>
                          <td className="py-4 px-6">{day.orders}</td>
                          <td className="py-4 px-6">
                            ₹{day.total_sales.toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            ₹{day.avg_order.toFixed(2)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center rounded-2xl"
            >
              <p className="text-gray-600 text-lg">
                No sales data available for the selected period
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeReport === "pricing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Medicines Priced Above Average
          </h3>
          {aboveAvgMeds.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Medicine ID
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Name
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Unit Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aboveAvgMeds.map((med) => (
                      <motion.tr
                        key={med.medicine_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">{med.medicine_id}</td>
                        <td className="py-4 px-6 font-medium">{med.name}</td>
                        <td className="py-4 px-6">
                          ₹{med.unit_price.toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center rounded-2xl"
            >
              <p className="text-gray-600 text-lg">
                No medicines found above average price
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeReport === "audit" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Audit Log (Recent 50 entries)
          </h3>
          {auditLog.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        ID
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        User
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Action
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Object
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Details
                      </th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((log) => (
                      <motion.tr
                        key={log.audit_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">{log.audit_id}</td>
                        <td className="py-4 px-6">{log.action_by}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              log.action === "INSERT"
                                ? "bg-green-100 text-green-800"
                                : log.action === "UPDATE"
                                ? "bg-yellow-100 text-yellow-800"
                                : log.action === "DELETE"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6">{log.object_name}</td>
                        <td className="py-4 px-6">{log.details}</td>
                        <td className="py-4 px-6">{log.action_time}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center rounded-2xl"
            >
              <p className="text-gray-600 text-lg">
                No audit log entries found
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default App;
