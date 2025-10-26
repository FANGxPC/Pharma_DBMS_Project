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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
            >
              <span className="text-3xl">🏥</span>
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Pharmacy Management
              </h1>
              <p className="text-blue-100 mt-2">
                Complete inventory and order management system
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-right"
          >
            <p className="text-blue-200">Dashboard</p>
            <p className="text-sm text-blue-300">Real-time monitoring</p>
          </motion.div>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-80"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 px-2">
              Navigation
            </h3>
            <div className="space-y-3">
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
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-blue-100 hover:bg-white/10 hover:shadow-lg"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-xl mr-4">{tab.icon}</span>
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
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex justify-between items-center p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30"
              >
                <span className="text-blue-100">Active Medicines</span>
                <span className="font-bold text-white text-xl">
                  {inventory.filter((item) => item.is_active === "Y").length}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex justify-between items-center p-4 bg-green-500/20 rounded-2xl border border-green-400/30"
              >
                <span className="text-green-100">Total Orders</span>
                <span className="font-bold text-white text-xl">
                  {orders.length}
                </span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex justify-between items-center p-4 bg-purple-500/20 rounded-2xl border border-purple-400/30"
              >
                <span className="text-purple-100">Customers</span>
                <span className="font-bold text-white text-xl">
                  {customers.length}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl mb-6 ${
                message.type === "error"
                  ? "bg-red-500/20 text-red-100 border border-red-400/30"
                  : "bg-green-500/20 text-green-100 border border-green-400/30"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12 text-center"
            >
              <div className="flex justify-center items-center space-x-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="text-white text-lg">Loading...</span>
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
                className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8"
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
  const [formData, setFormData] = useState({
    name: "",
    form: "Tablet",
    strength: "",
    price: "",
    quantity: "",
    supplier_id: "",
    expiry_date: "",
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white"
        >
          📦 Inventory Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all"
        >
          {showAddForm ? "✕ Cancel" : "+ Add Medicine"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Medicine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.form}
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Tablet" className="text-black">
                  Tablet
                </option>
                <option value="Capsule" className="text-black">
                  Capsule
                </option>
                <option value="Syrup" className="text-black">
                  Syrup
                </option>
                <option value="Injection" className="text-black">
                  Injection
                </option>
              </select>
              <input
                type="text"
                placeholder="Strength (e.g., 500mg)"
                value={formData.strength}
                onChange={(e) =>
                  setFormData({ ...formData, strength: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="text-black">
                  Select Supplier
                </option>
                {suppliers.map((s) => (
                  <option
                    key={s.supplier_id}
                    value={s.supplier_id}
                    className="text-black"
                  >
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
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all"
            >
              Add Medicine
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Form
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Strength
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Price (₹)
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Quantity
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <motion.tr
                  key={item.medicine_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 text-white">{item.medicine_id}</td>
                  <td className="py-4 px-6 text-white font-medium">
                    {item.name}
                  </td>
                  <td className="py-4 px-6 text-blue-200">
                    {item.pharma_form}
                  </td>
                  <td className="py-4 px-6 text-blue-200">{item.strength}</td>
                  <td className="py-4 px-6 text-green-300">
                    ₹{parseFloat(item.unit_price).toFixed(2)}
                  </td>
                  <td
                    className={`py-4 px-6 ${
                      item.qty < 20
                        ? "text-red-300 font-semibold"
                        : "text-white"
                    }`}
                  >
                    {item.qty}
                  </td>
                  <td className="py-4 px-6">
                    {item.is_active === "N" ? (
                      <span className="px-3 py-1 bg-gray-500/50 text-gray-200 rounded-full text-sm">
                        Retired
                      </span>
                    ) : item.qty < 20 ? (
                      <span className="px-3 py-1 bg-yellow-500/50 text-yellow-200 rounded-full text-sm">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500/50 text-green-200 rounded-full text-sm">
                        Active
                      </span>
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white"
        >
          🛒 Orders Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all"
        >
          {showCreateForm ? "✕ Cancel" : "+ New Order"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitOrder}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Create New Order
            </h3>

            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="text-black">
                Select Customer
              </option>
              {customers.map((c) => (
                <option
                  key={c.customer_id}
                  value={c.customer_id}
                  className="text-black"
                >
                  {c.name} - {c.phone}
                </option>
              ))}
            </select>

            <h4 className="text-lg font-semibold mb-4 text-white">
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
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="text-black">
                    Select Medicine
                  </option>
                  {inventory
                    .filter((m) => m.is_active === "Y")
                    .map((m) => (
                      <option
                        key={m.medicine_id}
                        value={m.medicine_id}
                        className="text-black"
                      >
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
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="px-4 py-3 bg-red-500/50 text-white rounded-xl hover:bg-red-600/50 transition-colors"
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
                className="px-6 py-3 bg-purple-500/50 text-white rounded-xl hover:bg-purple-600/50 transition-colors"
              >
                + Add Item
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Place Order
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Order ID
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Customer
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Total Amount
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.order_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 text-white font-medium">
                    #{order.order_id}
                  </td>
                  <td className="py-4 px-6 text-blue-200">
                    {order.order_date}
                  </td>
                  <td className="py-4 px-6 text-white">
                    {order.customer_name || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-green-300">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-green-500/50 text-green-200 rounded-full text-sm">
                      {order.status}
                    </span>
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

// ========== SUPPLIERS TAB ==========
function SuppliersTab({ suppliers, onRefresh, showMessage }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white"
        >
          🏭 Supplier Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all"
        >
          {showAddForm ? "✕ Cancel" : "+ Add Supplier"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Supplier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Supplier Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all"
            >
              Add Supplier
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <motion.tr
                  key={supplier.supplier_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 text-white">
                    {supplier.supplier_id}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    {supplier.name}
                  </td>
                  <td className="py-4 px-6 text-blue-200">
                    {supplier.contact_email}
                  </td>
                  <td className="py-4 px-6 text-blue-200">{supplier.phone}</td>
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-white"
        >
          👥 Customer Management
        </motion.h2>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all"
        >
          {showAddForm ? "✕ Cancel" : "+ Add Customer"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Customer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Customer Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all"
            >
              Add Customer
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Phone
                </th>
                <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <motion.tr
                  key={customer.customer_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 text-white">
                    {customer.customer_id}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">
                    {customer.name}
                  </td>
                  <td className="py-4 px-6 text-blue-200">
                    {customer.phone || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-blue-200">
                    {customer.email || "N/A"}
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

// ========== REPORTS TAB ==========
function ReportsTab({ showMessage }) {
  const [activeReport, setActiveReport] = useState("sales");
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [activeReport]);

  const fetchReportData = async () => {
    try {
      if (activeReport === "sales") {
        const salesResp = await axios.get(
          `${API_URL}/reports/sales-summary?days=7`
        );
        setSalesData(salesResp.data);
      }
    } catch (error) {
      showMessage("Error fetching report data", "error");
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h2
        variants={itemVariants}
        className="text-3xl font-bold text-white mb-8"
      >
        📊 Reports & Analytics
      </motion.h2>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
        {[
          { id: "sales", label: "📈 Sales Summary", icon: "📈" },
          { id: "pricing", label: "💰 Pricing Analytics", icon: "💰" },
          { id: "audit", label: "📋 Audit Log", icon: "📋" },
        ].map((report) => (
          <motion.button
            key={report.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-2xl transition-all duration-300 ${
              activeReport === report.id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-white/10 text-blue-100 hover:bg-white/20 hover:shadow-lg border border-white/20"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6 text-center"
            >
              <h4 className="text-blue-200 mb-2">Total Orders</h4>
              <p className="text-3xl font-bold text-white">
                {salesData.reduce((sum, d) => sum + d.orders, 0)}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6 text-center"
            >
              <h4 className="text-green-200 mb-2">Total Sales</h4>
              <p className="text-3xl font-bold text-white">
                ₹
                {salesData
                  .reduce((sum, d) => sum + d.total_sales, 0)
                  .toFixed(2)}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl border border-white/20 p-6 text-center"
            >
              <h4 className="text-purple-200 mb-2">Average Order</h4>
              <p className="text-3xl font-bold text-white">
                ₹
                {(
                  salesData.reduce((sum, d) => sum + d.total_sales, 0) /
                    salesData.reduce((sum, d) => sum + d.orders, 0) || 0
                ).toFixed(2)}
              </p>
            </motion.div>
          </div>

          {salesData.length > 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/10 border-b border-white/20">
                      <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                        Orders
                      </th>
                      <th className="text-left py-4 px-6 text-blue-200 font-semibold">
                        Total Sales
                      </th>
                      <th className="text-left py-4 px-6 text-blue-200 font-semibold">
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
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6 text-white">
                          {day.sale_date}
                        </td>
                        <td className="py-4 px-6 text-blue-200">
                          {day.orders}
                        </td>
                        <td className="py-4 px-6 text-green-300">
                          ₹{day.total_sales.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-purple-300">
                          ₹{day.avg_order.toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center"
            >
              <p className="text-blue-200 text-lg">
                No sales data available for the selected period
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeReport !== "sales" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center"
        >
          <p className="text-blue-200 text-lg">
            {activeReport === "pricing" && "Pricing analytics coming soon..."}
            {activeReport === "audit" && "Audit log features coming soon..."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default App;
