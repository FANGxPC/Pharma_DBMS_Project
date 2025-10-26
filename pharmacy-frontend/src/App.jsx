import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api";

// Enhanced Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
    },
  },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 100,
    },
  }),
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
        case "admin":
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Enhanced Header */}
      <motion.header
        initial="initial"
        animate="in"
        variants={pageVariants}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl"
            >
              <span className="text-3xl text-white">🏥</span>
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
              >
                Pharmacy Management System
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-600 mt-2 text-lg"
              >
                Advanced inventory control and analytics platform
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-right"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200">
              <p className="text-slate-700 font-semibold">Dashboard</p>
              <p className="text-sm text-slate-500">Real-time analytics</p>
            </div>
          </motion.div>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Enhanced Sidebar Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:w-80 flex-shrink-0"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <h3 className="text-lg font-semibold text-slate-800 mb-6 px-2 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Navigation Menu
            </h3>
            <div className="space-y-3">
              {[
                {
                  id: "inventory",
                  label: "Inventory Management",
                  icon: "📦",
                  color: "blue",
                },
                {
                  id: "orders",
                  label: "Sales & Orders",
                  icon: "🛒",
                  color: "green",
                },
                {
                  id: "suppliers",
                  label: "Supplier Network",
                  icon: "🏭",
                  color: "purple",
                },
                {
                  id: "customers",
                  label: "Customer Relations",
                  icon: "👥",
                  color: "orange",
                },
                {
                  id: "reports",
                  label: "Analytics & Reports",
                  icon: "📊",
                  color: "indigo",
                },
                {
                  id: "admin",
                  label: "Admin & Setup",
                  icon: "⚙️",
                  color: "gray",
                },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 border-l-4 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-50 to-${tab.color}-100 text-${tab.color}-800 border-${tab.color}-500 shadow-lg`
                      : "text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-300"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-4">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
              Quick Metrics
            </h3>
            <div className="space-y-4">
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white">💊</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Active Medicines</p>
                    <p className="font-bold text-slate-800 text-xl">
                      {
                        inventory.filter((item) => item.is_active === "Y")
                          .length
                      }
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-blue-500"
                >
                  ↗
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white">📈</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Total Orders</p>
                    <p className="font-bold text-slate-800 text-xl">
                      {orders.length}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-green-500"
                >
                  ⚡
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white">👥</span>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm">Customers</p>
                    <p className="font-bold text-slate-800 text-xl">
                      {customers.length}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-purple-500"
                >
                  👆
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Main Content Area */}
        <main className="flex-1">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`p-4 rounded-2xl mb-6 backdrop-blur-lg border ${
                message.type === "error"
                  ? "bg-red-50 text-red-800 border-red-200 shadow-lg"
                  : "bg-green-50 text-green-800 border-green-200 shadow-lg"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${
                    message.type === "error"
                      ? "bg-red-500 animate-pulse"
                      : "bg-green-500 animate-pulse"
                  }`}
                ></span>
                {message.text}
              </div>
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-12 text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity },
                  }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <div>
                  <p className="text-slate-700 text-lg font-medium">
                    Loading Data
                  </p>
                  <p className="text-slate-500 text-sm">
                    Please wait while we fetch the latest information
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8"
              >
                {activeTab === "inventory" && (
                  <EnhancedInventoryTab
                    inventory={inventory}
                    suppliers={suppliers}
                    onRefresh={fetchData}
                    showMessage={showMessage}
                  />
                )}
                {activeTab === "orders" && (
                  <EnhancedOrdersTab
                    orders={orders}
                    inventory={inventory}
                    customers={customers}
                    onRefresh={fetchData}
                    showMessage={showMessage}
                  />
                )}
                {activeTab === "suppliers" && (
                  <EnhancedSuppliersTab
                    suppliers={suppliers}
                    onRefresh={fetchData}
                    showMessage={showMessage}
                  />
                )}
                {activeTab === "customers" && (
                  <EnhancedCustomersTab
                    customers={customers}
                    onRefresh={fetchData}
                    showMessage={showMessage}
                  />
                )}
                {activeTab === "reports" && (
                  <EnhancedReportsTab
                    showMessage={showMessage}
                    inventory={inventory}
                  />
                )}
                {activeTab === "admin" && (
                  <EnhancedAdminTab
                    showMessage={showMessage}
                    onRefresh={fetchData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}

// ========== ENHANCED INVENTORY TAB ==========
function EnhancedInventoryTab({
  inventory,
  suppliers,
  onRefresh,
  showMessage,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showRetiredMedicines, setShowRetiredMedicines] = useState(false);
  const [retiredMedicines, setRetiredMedicines] = useState([]);
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
    // if (!window.confirm("Are you sure you want to retire this medicine?"))
    //   return;
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
  const fetchRetiredMedicines = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/inventory?include_inactive=true`
      );
      const retired = response.data.filter((item) => item.is_active === "N");
      setRetiredMedicines(retired);
      setShowRetiredMedicines(true);
    } catch (error) {
      showMessage(
        "Error fetching retired medicines: " + error.message,
        "error"
      );
    }
  };

  // Add this function to handle restoring medicines
  const handleRestore = async (medicineId) => {
    // if (!window.confirm("Are you sure you want to restore this medicine?"))
    //   return;
    try {
      await axios.put(`${API_URL}/inventory/restore/${medicineId}`);
      showMessage("Medicine restored successfully!", "success");
      // Remove from retired list
      setRetiredMedicines((prev) =>
        prev.filter((med) => med.medicine_id !== medicineId)
      );
      // Refresh main inventory
      onRefresh();
    } catch (error) {
      showMessage("Error restoring medicine: " + error.message, "error");
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

  const isExpired = (date) => new Date(date) < new Date();
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent"
          >
            📦 Inventory Management
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-600 mt-2">
            Manage medicine stock, pricing, and availability
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-3 mt-4 lg:mt-0"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            {showAddForm ? "✕ Cancel" : "+ Add Medicine"}
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRetiredMedicines}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            🔄 Restore Retired
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpdateStock(!showUpdateStock)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            {showUpdateStock ? "✕ Cancel" : "📊 Update Stock"}
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchLowStock}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            🔔 Low Stock
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchExpiringMeds}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            ⏰ Expiring
          </motion.button>
        </motion.div>
      </div>

      {/* Add Medicine Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 mb-8 shadow-lg"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              Add New Medicine
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <select
                value={formData.form}
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <select
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">💾</span> Save Medicine
              </span>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Update Stock Form */}
      <AnimatePresence>
        {showUpdateStock && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleStockUpdate}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6 mb-8 shadow-lg"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
              Update Stock Quantity
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={stockUpdateData.medicine_id}
                onChange={(e) =>
                  setStockUpdateData({
                    ...stockUpdateData,
                    medicine_id: e.target.value,
                  })
                }
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <p className="text-slate-600 mb-4">
              Use positive numbers to add stock, negative to reduce
            </p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              Update Stock
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Enhanced Alerts */}
      <AnimatePresence>
        {showLowStock && lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-6 rounded-2xl mb-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-yellow-800 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                ⚠️ Low Stock Alert
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLowStock(false)}
                className="text-yellow-600 hover:text-yellow-800 text-xl transition-colors"
              >
                ✕
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-yellow-100/50 border-b border-yellow-200">
                    <th className="text-left py-3 px-4 text-yellow-800 font-semibold">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-yellow-800 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-yellow-800 font-semibold">
                      Current Qty
                    </th>
                    <th className="text-left py-3 px-4 text-yellow-800 font-semibold">
                      Min Threshold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, index) => (
                    <motion.tr
                      key={item.medicine_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-yellow-100 hover:bg-yellow-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.medicine_id}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{item.name}</td>
                      <td className="py-3 px-4 font-semibold text-red-600">
                        {item.qty}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.min_threshold}
                      </td>
                    </motion.tr>
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
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-6 rounded-2xl mb-8 shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-red-800 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                  ⏰ Expiry Management
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowExpiring(false)}
                  className="text-red-600 hover:text-red-800 text-xl transition-colors"
                >
                  ✕
                </motion.button>
              </div>

              {expiringMeds.expired.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                    Expired Medicines
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-red-100/50 border-b border-red-200">
                          <th className="text-left py-3 px-4 text-red-800 font-semibold">
                            ID
                          </th>
                          <th className="text-left py-3 px-4 text-red-800 font-semibold">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 text-red-800 font-semibold">
                            Expiry Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringMeds.expired.map((med, index) => (
                          <motion.tr
                            key={med.medicine_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-red-100 hover:bg-red-50/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {med.medicine_id}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {med.name}
                            </td>
                            <td className="py-3 px-4 font-semibold text-red-600">
                              {med.expiry_date}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {expiringMeds.near_expiry.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-orange-700 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Near Expiry (Next 90 Days)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-100/50 border-b border-orange-200">
                          <th className="text-left py-3 px-4 text-orange-800 font-semibold">
                            ID
                          </th>
                          <th className="text-left py-3 px-4 text-orange-800 font-semibold">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 text-orange-800 font-semibold">
                            Expiry Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringMeds.near_expiry.map((med, index) => (
                          <motion.tr
                            key={med.medicine_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-orange-100 hover:bg-orange-50/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {med.medicine_id}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {med.name}
                            </td>
                            <td className="py-3 px-4 font-semibold text-orange-600">
                              {med.expiry_date}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* ↓↓↓ ADD THE RETIRED MEDICINES SECTION HERE ↓↓↓ */}
      <AnimatePresence>
        {showRetiredMedicines && retiredMedicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 p-6 rounded-2xl mb-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="w-3 h-3 bg-gray-500 rounded-full mr-3"></span>
                🔄 Retired Medicines
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowRetiredMedicines(false)}
                className="text-gray-600 hover:text-gray-800 text-xl transition-colors"
              >
                ✕
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Form
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Strength
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Price (₹)
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Expiry Date
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {retiredMedicines.map((medicine, index) => (
                    <motion.tr
                      key={medicine.medicine_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {medicine.medicine_id}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {medicine.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {medicine.pharma_form}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {medicine.strength}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">
                          ₹{parseFloat(medicine.unit_price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {medicine.expiry_date}
                      </td>
                      <td className="py-3 px-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRestore(medicine.medicine_id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                        >
                          Restore
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {retiredMedicines.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No retired medicines found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Inventory Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                {[
                  "ID",
                  "Name",
                  "Form",
                  "Strength",
                  "Price (₹)",
                  "Quantity",
                  "Expiry Date",
                  "Status",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={header}
                    className="text-left py-4 px-6 text-slate-700 font-semibold"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {header}
                    </motion.div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter((item) => item.is_active === "Y")
                .map((item, index) => (
                  <motion.tr
                    key={item.medicine_id}
                    custom={index}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    className={`border-b border-slate-100 transition-colors ${
                      isExpired(item.expiry_date) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.medicine_id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {item.pharma_form}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {item.strength}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-600">
                        ₹{parseFloat(item.unit_price).toFixed(2)}
                      </span>
                    </td>
                    <td
                      className={`py-4 px-6 font-semibold ${
                        item.qty < 20 ? "text-red-500" : "text-slate-700"
                      }`}
                    >
                      {item.qty}
                      {item.qty < 20 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full"
                        >
                          Low
                        </motion.span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {item.expiry_date}
                    </td>
                    <td className="py-4 px-6">
                      {isExpired(item.expiry_date) ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Expired
                        </span>
                      ) : isNearExpiry(item.expiry_date) ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          Near Expiry
                        </span>
                      ) : item.qty < 20 ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRetire(item.medicine_id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Retire
                      </motion.button>
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

// ========== ENHANCED ORDERS TAB ==========
function EnhancedOrdersTab({
  orders,
  inventory,
  customers,
  onRefresh,
  showMessage,
}) {
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
      // Validate all items have medicine selected and quantity
      const isValid = orderItems.every(
        (item) =>
          item.medicine_id && item.quantity && parseInt(item.quantity) > 0
      );

      if (!isValid) {
        showMessage(
          "Please fill all medicine selections and quantities",
          "error"
        );
        return;
      }

      if (!selectedCustomer) {
        showMessage("Please select a customer", "error");
        return;
      }

      // Create the order data in the correct format
      const orderData = {
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map((item) => parseInt(item.medicine_id)),
        quantities: orderItems.map((item) => parseInt(item.quantity)),
      };

      console.log("Sending order data:", orderData); // For debugging

      await axios.post(`${API_URL}/orders`, orderData);

      showMessage("Order placed successfully!", "success");
      setShowCreateForm(false);
      setOrderItems([{ medicine_id: "", quantity: "" }]);
      setSelectedCustomer("");
      onRefresh();
    } catch (error) {
      console.error("Order error:", error);
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-green-700 bg-clip-text text-transparent"
          >
            🛒 Sales & Orders
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-600 mt-2">
            Process orders and manage customer transactions
          </motion.p>
        </div>
        <motion.button
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
        >
          {showCreateForm ? (
            <span className="flex items-center">
              <span className="mr-2">✕</span> Cancel
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2">+</span> New Order
            </span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleSubmitOrder}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 mb-8 shadow-lg"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Create New Order
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <label className="block text-slate-700 mb-2 font-medium">
                Select Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="" className="text-slate-500">
                  Select Customer
                </option>
                {customers.map((c) => (
                  <option
                    key={c.customer_id}
                    value={c.customer_id}
                    className="text-slate-700"
                  >
                    {c.name} - {c.phone}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Order Items
            </motion.h4>

            {orderItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-white rounded-xl border border-slate-200"
              >
                <select
                  value={item.medicine_id}
                  onChange={(e) =>
                    handleItemChange(index, "medicine_id", e.target.value)
                  }
                  required
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="" className="text-slate-500">
                    Select Medicine
                  </option>
                  {inventory
                    .filter(
                      (m) => m.is_active === "Y" && !isExpired(m.expiry_date)
                    )
                    .map((m) => (
                      <option
                        key={m.medicine_id}
                        value={m.medicine_id}
                        className="text-slate-700"
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
                  className="px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                {orderItems.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                  >
                    Remove
                  </motion.button>
                )}
              </motion.div>
            ))}

            <div className="flex gap-4 mt-6">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleAddItem}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
              >
                <span className="flex items-center">
                  <span className="mr-2">+</span> Add Item
                </span>
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
              >
                <span className="flex items-center">
                  <span className="mr-2">💳</span> Place Order
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                {[
                  "Order ID",
                  "Date",
                  "Customer",
                  "Total Amount",
                  "Status",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={header}
                    className="text-left py-4 px-6 text-slate-700 font-semibold"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {header}
                    </motion.div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <React.Fragment key={order.order_id}>
                  <motion.tr
                    custom={index}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.05)" }}
                    className="border-b border-slate-100 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      #{order.order_id}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {order.order_date}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">
                        {order.customer_name || "N/A"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleOrderExpansion(order.order_id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium"
                      >
                        {expandedOrder === order.order_id ? (
                          <span className="flex items-center">
                            <span className="mr-2">👆</span> Hide Details
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="mr-2">👇</span> View Details
                          </span>
                        )}
                      </motion.button>
                    </td>
                  </motion.tr>
                  {expandedOrder === order.order_id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50/50"
                    >
                      <td colSpan="6" className="p-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl p-6 shadow-inner border border-blue-200"
                        >
                          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                            Order Items - #{order.order_id}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-blue-50 border-b border-blue-200">
                                  <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                                    Medicine
                                  </th>
                                  <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                                    Quantity
                                  </th>
                                  <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                                    Unit Price
                                  </th>
                                  <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                                    Line Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-b border-blue-100 hover:bg-blue-50/30 transition-colors"
                                  >
                                    <td className="py-3 px-4 text-slate-700 font-medium">
                                      {item.medicine_name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {item.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      ₹{item.unit_price.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-green-600">
                                      ₹{item.line_total.toFixed(2)}
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
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

// ========== ENHANCED SUPPLIERS TAB ==========
function EnhancedSuppliersTab({ suppliers, onRefresh, showMessage }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performance, setPerformance] = useState([]);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-700 bg-clip-text text-transparent"
          >
            🏭 Supplier Network
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-600 mt-2">
            Manage supplier relationships and performance metrics
          </motion.p>
        </div>
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-3 mt-4 lg:mt-0"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            {showAddForm ? "✕ Cancel" : "+ Add Supplier"}
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchPerformance}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            📊 Performance
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6 mb-8 shadow-lg"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
              Add New Supplier
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  label: "Supplier Name",
                  type: "text",
                  value: formData.name,
                  onChange: (e) =>
                    setFormData({ ...formData, name: e.target.value }),
                  required: true,
                },
                {
                  label: "Email",
                  type: "email",
                  value: formData.email,
                  onChange: (e) =>
                    setFormData({ ...formData, email: e.target.value }),
                  required: true,
                },
                {
                  label: "Phone",
                  type: "tel",
                  value: formData.phone,
                  onChange: (e) =>
                    setFormData({ ...formData, phone: e.target.value }),
                  required: true,
                },
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <input
                    type={field.type}
                    placeholder={field.label}
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required={field.required}
                  />
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">💾</span> Save Supplier
              </span>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerformance && performance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl mb-8 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                📊 Supplier Performance Analytics
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPerformance(false)}
                className="text-slate-500 hover:text-slate-700 text-xl transition-colors"
              >
                ✕
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-100/50 border-b border-blue-200">
                    <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                      Medicines Count
                    </th>
                    <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                      Avg Price
                    </th>
                    <th className="text-left py-3 px-4 text-blue-700 font-semibold">
                      Max Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((perf, index) => (
                    <motion.tr
                      key={perf.supplier_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-blue-100 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {perf.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {perf.medicines_count}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ₹{perf.avg_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-orange-600">
                        ₹{perf.max_price.toFixed(2)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                {["ID", "Name", "Email", "Phone", "Created At"].map(
                  (header, index) => (
                    <th
                      key={header}
                      className="text-left py-4 px-6 text-slate-700 font-semibold"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {header}
                      </motion.div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <motion.tr
                  key={supplier.supplier_id}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.05)" }}
                  className="border-b border-slate-100 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {supplier.supplier_id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">
                      {supplier.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {supplier.contact_email}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{supplier.phone}</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">
                    {supplier.created_at}
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

// ========== ENHANCED CUSTOMERS TAB ==========
function EnhancedCustomersTab({ customers, onRefresh, showMessage }) {
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
        <div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-orange-700 bg-clip-text text-transparent"
          >
            👥 Customer Relations
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-600 mt-2">
            Manage customer information and relationships
          </motion.p>
        </div>
        <motion.button
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
        >
          {showAddForm ? (
            <span className="flex items-center">
              <span className="mr-2">✕</span> Cancel
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2">+</span> Add Customer
            </span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6 mb-8 shadow-lg"
          >
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-slate-800 mb-4 flex items-center"
            >
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
              Add New Customer
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  label: "Customer Name",
                  type: "text",
                  value: formData.name,
                  onChange: (e) =>
                    setFormData({ ...formData, name: e.target.value }),
                  required: true,
                },
                {
                  label: "Phone",
                  type: "tel",
                  value: formData.phone,
                  onChange: (e) =>
                    setFormData({ ...formData, phone: e.target.value }),
                },
                {
                  label: "Email",
                  type: "email",
                  value: formData.email,
                  onChange: (e) =>
                    setFormData({ ...formData, email: e.target.value }),
                },
                {
                  label: "Address",
                  type: "text",
                  value: formData.address,
                  onChange: (e) =>
                    setFormData({ ...formData, address: e.target.value }),
                  fullWidth: true,
                },
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={field.fullWidth ? "md:col-span-2" : ""}
                >
                  <input
                    type={field.type}
                    placeholder={field.label}
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required={field.required}
                  />
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">💾</span> Save Customer
              </span>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                {["ID", "Name", "Phone", "Email", "Address"].map(
                  (header, index) => (
                    <th
                      key={header}
                      className="text-left py-4 px-6 text-slate-700 font-semibold"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {header}
                      </motion.div>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <motion.tr
                  key={customer.customer_id}
                  custom={index}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.05)" }}
                  className="border-b border-slate-100 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {customer.customer_id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800">
                      {customer.name}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {customer.phone || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-slate-600">
                    {customer.email || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                    {customer.address || "N/A"}
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

// ========== ENHANCED REPORTS TAB ==========
// ========== ENHANCED REPORTS TAB ==========
// ========== ENHANCED REPORTS TAB ==========
function EnhancedReportsTab({ showMessage, inventory }) {
  const [activeReport, setActiveReport] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [inventoryThresholdData, setInventoryThresholdData] = useState([]);
  const [unionIntersectData, setUnionIntersectData] = useState({});
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [selectedPriceMedicine, setSelectedPriceMedicine] = useState(null);
  const [showAboveAvgDetails, setShowAboveAvgDetails] = useState(false);
  const [showThresholdDetails, setShowThresholdDetails] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [activeReport, days]);

  const fetchReportData = async () => {
    setLoading(true);
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
            `${API_URL}/reports/audit-log?limit=100`
          );
          setAuditLog(auditResp.data);
          break;
        case "pricing":
          const pricingResp = await axios.get(
            `${API_URL}/reports/above-average-price`
          );
          setPricingData(pricingResp.data);
          break;
        case "inventoryThreshold":
          const thresholdResp = await axios.get(
            `${API_URL}/reports/inventory-any-threshold`
          );
          setInventoryThresholdData(thresholdResp.data);
          break;
        case "unionIntersect":
          const unionResp = await axios.get(
            `${API_URL}/reports/union-intersect`
          );
          setUnionIntersectData(unionResp.data);
          break;
        default:
          break;
      }
    } catch (error) {
      showMessage("Error fetching report data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (action) => {
    switch (action) {
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (action) => {
    switch (action) {
      case "INSERT":
        return "🟢";
      case "UPDATE":
        return "🟡";
      case "DELETE":
        return "🔴";
      default:
        return "⚪";
    }
  };

  // Find highest priced medicine
  const highestPricedMedicine =
    pricingData.length > 0
      ? pricingData.reduce(
          (max, med) => (med.unit_price > max.unit_price ? med : max),
          pricingData[0]
        )
      : null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent"
        >
          📊 Analytics & Reports
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-600 mt-2">
          Comprehensive business intelligence and system monitoring
        </motion.p>
      </div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
        {[
          {
            id: "sales",
            label: "📈 Sales Analytics",
            icon: "📈",
            color: "green",
          },
          {
            id: "pricing",
            label: "💰 Pricing Analysis",
            icon: "💰",
            color: "blue",
          },
          {
            id: "inventoryThreshold",
            label: "📦 Inventory Threshold",
            icon: "📦",
            color: "orange",
          },
          {
            id: "unionIntersect",
            label: "🔀 Union & Intersect",
            icon: "🔀",
            color: "purple",
          },
          {
            id: "audit",
            label: "🔍 System Audit Log",
            icon: "🔍",
            color: "red",
          },
        ].map((report) => (
          <motion.button
            key={report.id}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-4 rounded-2xl transition-all duration-300 font-medium ${
              activeReport === report.id
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl"
                : "bg-white text-slate-700 hover:bg-slate-50 shadow-lg border border-slate-200"
            }`}
            onClick={() => setActiveReport(report.id)}
          >
            <span className="flex items-center">
              <span className="text-xl mr-3">{report.icon}</span>
              {report.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-12 text-center"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity },
              }}
              className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
            <div>
              <p className="text-slate-700 text-lg font-medium">
                Loading Report Data
              </p>
              <p className="text-slate-500 text-sm">
                Generating insights and analytics...
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {activeReport === "sales" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-slate-800">
                  Sales Performance Analytics
                </h3>
                <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <span className="text-slate-600">Time Period:</span>
                  <select
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                  </select>
                </div>
              </div>

              {salesData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📦</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Total Orders</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        {salesData.reduce((sum, d) => sum + d.orders, 0)}
                      </p>
                    </motion.div>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border border-blue-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">💰</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Total Revenue</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        ₹
                        {salesData
                          .reduce((sum, d) => sum + d.total_sales, 0)
                          .toFixed(2)}
                      </p>
                    </motion.div>
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Avg Order Value</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        ₹
                        {(
                          salesData.reduce((sum, d) => sum + d.total_sales, 0) /
                            salesData.reduce((sum, d) => sum + d.orders, 0) || 0
                        ).toFixed(2)}
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Date
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Orders
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Total Sales
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Avg Order
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Trend
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map((day, idx) => (
                            <motion.tr
                              key={idx}
                              custom={idx}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{
                                backgroundColor: "rgba(34, 197, 94, 0.05)",
                              }}
                              className="border-b border-slate-100 transition-colors"
                            >
                              <td className="py-4 px-6 font-medium text-slate-800">
                                {day.sale_date}
                              </td>
                              <td className="py-4 px-6 text-slate-700">
                                {day.orders}
                              </td>
                              <td className="py-4 px-6 font-semibold text-green-600">
                                ₹{day.total_sales.toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-slate-700">
                                ₹{day.avg_order.toFixed(2)}
                              </td>
                              <td className="py-4 px-6">
                                {idx > 0 &&
                                day.total_sales >
                                  salesData[idx - 1].total_sales ? (
                                  <span className="text-green-500 flex items-center">
                                    ↗ <span className="ml-1 text-sm">Up</span>
                                  </span>
                                ) : idx > 0 ? (
                                  <span className="text-red-500 flex items-center">
                                    ↘ <span className="ml-1 text-sm">Down</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-400 text-2xl">📊</span>
                  </div>
                  <p className="text-slate-600 text-lg">
                    No sales data available for the selected period
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Try selecting a different time range or check your data
                    connections
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
              <h3 className="text-xl font-semibold text-slate-800 mb-8">
                Pricing Strategy Analysis
              </h3>

              {pricingData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      onClick={() => setShowAboveAvgDetails(true)}
                      className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border border-blue-200 p-6 text-center shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📈</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Above Avg Price</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        {pricingData.length}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">Products</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Click to view details
                      </p>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      onClick={() =>
                        setSelectedPriceMedicine(highestPricedMedicine)
                      }
                      className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 p-6 text-center shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">💰</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Highest Price</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        ₹
                        {highestPricedMedicine?.unit_price.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-slate-500 text-sm mt-2 truncate">
                        {highestPricedMedicine?.name || "N/A"}
                      </p>
                      {highestPricedMedicine && (
                        <p className="text-xs text-green-600 mt-1">
                          Click to view details
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Avg Premium</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        +
                        {(
                          (pricingData.reduce(
                            (sum, p) => sum + p.unit_price,
                            0
                          ) /
                            pricingData.length /
                            (inventory.reduce(
                              (sum, i) => sum + parseFloat(i.unit_price || 0),
                              0
                            ) /
                              Math.max(inventory.length, 1))) *
                            100 -
                          100
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Above Average
                      </p>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border border-orange-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">⭐</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Price Range</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        ₹
                        {Math.min(
                          ...pricingData.map((p) => p.unit_price)
                        ).toFixed(2)}
                        -₹
                        {Math.max(
                          ...pricingData.map((p) => p.unit_price)
                        ).toFixed(2)}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Premium Range
                      </p>
                    </motion.div>
                  </div>

                  {/* Above Average Price Details Modal */}
                  <AnimatePresence>
                    {showAboveAvgDetails && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAboveAvgDetails(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                              📊 Above Average Price Medicines
                            </h3>
                            <button
                              onClick={() => setShowAboveAvgDetails(false)}
                              className="text-slate-500 hover:text-slate-700 text-xl"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="overflow-y-auto max-h-[60vh]">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Medicine ID
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Medicine Name
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Form
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Strength
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Price (₹)
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Quantity
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {pricingData.map((med, index) => (
                                  <motion.tr
                                    key={med.medicine_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-slate-100 hover:bg-slate-50"
                                  >
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {med.medicine_id}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {med.name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {med.pharma_form}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {med.strength}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-green-600">
                                      ₹{med.unit_price.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {med.qty}
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 text-center text-slate-600">
                            <p>
                              Total {pricingData.length} medicines above average
                              price
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Highest Price Medicine Detail Modal - Updated */}
                  <AnimatePresence>
                    {selectedPriceMedicine && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedPriceMedicine(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-2xl p-6 max-w-md w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">
                              🏆 Highest Priced Medicine
                            </h3>
                            <button
                              onClick={() => setSelectedPriceMedicine(null)}
                              className="text-slate-500 hover:text-slate-700 text-xl"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600">
                                Medicine ID:
                              </span>
                              <span className="font-semibold">
                                {selectedPriceMedicine.medicine_id}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Name:</span>
                              <span className="font-semibold">
                                {selectedPriceMedicine.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Form:</span>
                              <span>{selectedPriceMedicine.pharma_form}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Strength:</span>
                              <span>{selectedPriceMedicine.strength}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Quantity:</span>
                              <span>{selectedPriceMedicine.qty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Price:</span>
                              <span className="font-bold text-green-600 text-lg">
                                ₹{selectedPriceMedicine.unit_price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Medicine ID
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Name
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Form
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Unit Price
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Price Tier
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Market Position
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricingData.map((med, index) => (
                            <motion.tr
                              key={med.medicine_id}
                              custom={index}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{
                                backgroundColor: "rgba(59, 130, 246, 0.05)",
                              }}
                              className="border-b border-slate-100 transition-colors"
                            >
                              <td className="py-4 px-6 text-slate-600 font-medium">
                                {med.medicine_id}
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-semibold text-slate-800">
                                  {med.name}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {med.pharma_form}
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold text-green-600">
                                  ₹{med.unit_price.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                {med.unit_price > 1000 ? (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    Premium
                                  </span>
                                ) : med.unit_price > 500 ? (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Mid-Range
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Value
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center">
                                  <div className="w-20 bg-slate-200 rounded-full h-2 mr-3">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (med.unit_price /
                                            Math.max(
                                              ...pricingData.map(
                                                (p) => p.unit_price
                                              )
                                            )) *
                                            100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-slate-600 text-sm">
                                    Top{" "}
                                    {Math.round(
                                      100 -
                                        (med.unit_price /
                                          Math.max(
                                            ...pricingData.map(
                                              (p) => p.unit_price
                                            )
                                          )) *
                                          100
                                    )}
                                    %
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-400 text-2xl">💰</span>
                  </div>
                  <p className="text-slate-600 text-lg">
                    No premium pricing data available
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Premium products analysis will appear here when available
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeReport === "inventoryThreshold" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-8">
                Inventory Threshold Analysis
              </h3>

              {inventoryThresholdData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      onClick={() => setShowThresholdDetails(true)}
                      className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border border-orange-200 p-6 text-center shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📦</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">
                        Above Threshold Items
                      </h4>
                      <p className="text-3xl font-bold text-slate-800">
                        {inventoryThresholdData.length}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Well-stocked medicines
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        Click to view details
                      </p>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">✅</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Avg Stock Level</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        {Math.round(
                          inventoryThresholdData.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          ) / inventoryThresholdData.length
                        )}
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Average quantity
                      </p>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border border-blue-200 p-6 text-center shadow-lg"
                    >
                      <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <h4 className="text-slate-600 mb-2">Safety Margin</h4>
                      <p className="text-3xl font-bold text-slate-800">
                        {Math.round(
                          (inventoryThresholdData.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          ) /
                            inventoryThresholdData.reduce(
                              (sum, item) => sum + item.min_threshold,
                              0
                            )) *
                            100
                        )}
                        %
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Above minimum
                      </p>
                    </motion.div>
                  </div>

                  {/* Above Threshold Details Modal */}
                  <AnimatePresence>
                    {showThresholdDetails && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowThresholdDetails(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                              📦 Above Threshold Inventory Items
                            </h3>
                            <button
                              onClick={() => setShowThresholdDetails(false)}
                              className="text-slate-500 hover:text-slate-700 text-xl"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="overflow-y-auto max-h-[60vh]">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Medicine ID
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Medicine Name
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Form & Strength
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Current Qty
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Min Threshold
                                  </th>
                                  <th className="text-left py-3 px-4 text-slate-700 font-semibold">
                                    Safety Margin
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {inventoryThresholdData.map((item, index) => (
                                  <motion.tr
                                    key={item.medicine_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-slate-100 hover:bg-slate-50"
                                  >
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {item.medicine_id}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800">
                                      {item.name}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {item.pharma_form} • {item.strength}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span
                                        className={`font-bold ${
                                          item.quantity > item.min_threshold * 2
                                            ? "text-green-600"
                                            : "text-orange-600"
                                        }`}
                                      >
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                      {item.min_threshold}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span
                                        className={`font-semibold ${
                                          item.quantity > item.min_threshold * 2
                                            ? "text-green-600"
                                            : "text-orange-600"
                                        }`}
                                      >
                                        {Math.round(
                                          ((item.quantity -
                                            item.min_threshold) /
                                            item.min_threshold) *
                                            100
                                        )}
                                        %
                                      </span>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-4 text-center text-slate-600">
                            <p>
                              Total {inventoryThresholdData.length} items above
                              threshold
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Medicine ID
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Name
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Current Quantity
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Min Threshold
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Safety Margin
                            </th>
                            <th className="text-left py-4 px-6 text-slate-700 font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryThresholdData.map((item, index) => (
                            <motion.tr
                              key={item.medicine_id}
                              custom={index}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{
                                backgroundColor: "rgba(249, 115, 22, 0.05)",
                              }}
                              className="border-b border-slate-100 transition-colors"
                            >
                              <td className="py-4 px-6 text-slate-600 font-medium">
                                {item.medicine_id}
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-semibold text-slate-800">
                                  {item.name}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`font-bold ${
                                    item.quantity > item.min_threshold * 2
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-slate-600">
                                {item.min_threshold}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`font-semibold ${
                                    item.quantity > item.min_threshold * 2
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  }`}
                                >
                                  {Math.round(
                                    ((item.quantity - item.min_threshold) /
                                      item.min_threshold) *
                                      100
                                  )}
                                  %
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                {item.quantity > item.min_threshold * 3 ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Excellent
                                  </span>
                                ) : item.quantity > item.min_threshold * 2 ? (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Good
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                    Adequate
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-slate-400 text-2xl">📦</span>
                  </div>
                  <p className="text-slate-600 text-lg">
                    No inventory threshold data available
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Inventory analysis will appear here when available
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeReport === "unionIntersect" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-8">
                Database Operations Demo
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 p-6 shadow-lg"
                >
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    UNION Operation
                  </h4>
                  <p className="text-slate-600 mb-4">
                    Unique names from both Suppliers and Customers tables:
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 max-h-60 overflow-y-auto">
                    {unionIntersectData.union_unique_names ? (
                      unionIntersectData.union_unique_names.map((name, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="py-2 px-3 border-b border-slate-100 last:border-b-0"
                        >
                          <span className="text-slate-700">{name}</span>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        No data available
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl border border-indigo-200 p-6 shadow-lg"
                >
                  <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></span>
                    INTERSECT Operation
                  </h4>
                  <p className="text-slate-600 mb-4">
                    Common names in both Suppliers and Customers tables:
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-slate-200 max-h-60 overflow-y-auto">
                    {unionIntersectData.intersect_common_names ? (
                      unionIntersectData.intersect_common_names.map(
                        (name, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="py-2 px-3 border-b border-slate-100 last:border-b-0"
                          >
                            <span className="text-slate-700">{name}</span>
                          </motion.div>
                        )
                      )
                    ) : (
                      <p className="text-slate-500 text-center py-4">
                        No common names found
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-slate-500 rounded-full mr-3"></span>
                  About Database Operations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600">
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-2">
                      UNION Operation
                    </h5>
                    <p className="text-sm">
                      Combines the results of two queries and removes duplicate
                      rows. Used here to find all unique names from both
                      Suppliers and Customers tables.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-2">
                      INTERSECT Operation
                    </h5>
                    <p className="text-sm">
                      Returns only the rows that are common to both query
                      results. Used here to find names that appear in both
                      Suppliers and Customers tables.
                    </p>
                  </div>
                </div>
              </div>
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
        </>
      )}
    </motion.div>
  );
}

// ========== ENHANCED ADMIN TAB ==========
function EnhancedAdminTab({ showMessage, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState({ tables: [], views: [] });
  const [healthData, setHealthData] = useState(null);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const handleAdminAction = async (action, endpoint) => {
    setLoading(true);
    try {
      let response;
      if (action === "cleanup") {
        if (!confirmCleanup) {
          setConfirmCleanup(true);
          setLoading(false);
          return;
        }
        response = await axios.post(`${API_URL}/admin/${endpoint}`, {
          confirm: true,
        });
      } else {
        response = await axios.post(`${API_URL}/admin/${endpoint}`);
      }

      showMessage(
        response.data.message || "Action completed successfully",
        "success"
      );

      if (action === "cleanup") {
        setConfirmCleanup(false);
      }

      // Refresh debug data after schema changes
      if (["setup-schema", "cleanup"].includes(action)) {
        fetchDebugData();
      }
    } catch (error) {
      showMessage(
        "Error: " + (error.response?.data?.error || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugData = async () => {
    try {
      const [tablesResponse, healthResponse] = await Promise.all([
        axios.get(`${API_URL}/debug/tables`),
        axios.get(`${API_URL}/health`),
      ]);
      setDebugData(tablesResponse.data);
      setHealthData(healthResponse.data);
    } catch (error) {
      showMessage("Error fetching debug data", "error");
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const adminActions = [
    {
      id: "setup-schema",
      label: "🛠️ Setup Database Schema",
      description: "Create all necessary tables and constraints",
      endpoint: "setup-schema",
      color: "blue",
      confirm: false,
    },
    {
      id: "create-triggers",
      label: "⚡ Create Triggers",
      description: "Set up database triggers for auditing and validation",
      endpoint: "create-triggers",
      color: "purple",
      confirm: false,
    },
    {
      id: "create-procedures",
      label: "📋 Create Stored Procedures",
      description: "Set up stored procedures for order processing",
      endpoint: "create-procedures",
      color: "green",
      confirm: false,
    },
    {
      id: "create-views",
      label: "👁️ Create Database Views",
      description: "Create views for simplified data access",
      endpoint: "create-views",
      color: "orange",
      confirm: false,
    },
    {
      id: "seed-data",
      label: "🌱 Seed Sample Data",
      description: "Populate database with sample data for testing",
      endpoint: "seed-data",
      color: "emerald",
      confirm: false,
    },
    {
      id: "cleanup",
      label: "🗑️ Cleanup Database",
      description: "Drop all tables, procedures, and triggers (DANGEROUS)",
      endpoint: "cleanup",
      color: "red",
      confirm: true,
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-8">
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-gray-700 bg-clip-text text-transparent"
        >
          ⚙️ Admin & Setup
        </motion.h2>
        <motion.p variants={itemVariants} className="text-slate-600 mt-2">
          Database management, system setup, and maintenance operations
        </motion.p>
      </div>

      {/* System Status */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
      >
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            System Health
          </h3>
          {healthData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Database Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    healthData.status === "healthy"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {healthData.status === "healthy"
                    ? "✅ Healthy"
                    : "❌ Unhealthy"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Medicines Count:</span>
                <span className="font-semibold text-slate-800">
                  {healthData.medicines_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Suppliers Count:</span>
                <span className="font-semibold text-slate-800">
                  {healthData.suppliers_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Customers Count:</span>
                <span className="font-semibold text-slate-800">
                  {healthData.customers_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Orders Count:</span>
                <span className="font-semibold text-slate-800">
                  {healthData.orders_count}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Loading health data...</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
            Database Objects
          </h3>
          {debugData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tables Count:</span>
                <span className="font-semibold text-slate-800">
                  {debugData.tables.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Views Count:</span>
                <span className="font-semibold text-slate-800">
                  {debugData.views.length}
                </span>
              </div>
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchDebugData}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Refresh Database Info
                </motion.button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Loading database info...</p>
          )}
        </div>
      </motion.div>

      {/* Admin Actions */}
      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
          <span className="w-3 h-3 bg-slate-500 rounded-full mr-3"></span>
          Database Management Actions
        </h3>

        {confirmCleanup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-6 rounded-2xl mb-6 shadow-lg"
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">⚠️</span>
              <h4 className="text-lg font-semibold text-red-800">
                Confirm Database Cleanup
              </h4>
            </div>
            <p className="text-red-700 mb-4">
              This action will DROP ALL TABLES, procedures, triggers, and views.
              This is IRREVERSIBLE and will DELETE ALL DATA. Are you absolutely
              sure?
            </p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdminAction("cleanup", "cleanup")}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                💀 Yes, Delete Everything
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmCleanup(false)}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                🚫 Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminActions.map((action, index) => (
            <motion.div
              key={action.id}
              variants={cardVariants}
              whileHover="hover"
              className={`bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 rounded-2xl border border-${action.color}-200 p-6 shadow-lg`}
            >
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                {action.label}
              </h4>
              <p className="text-slate-600 text-sm mb-4">
                {action.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdminAction(action.id, action.endpoint)}
                disabled={loading}
                className={`w-full px-4 py-3 bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Processing..." : "Execute"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Database Objects Details */}
      {debugData && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Database Tables ({debugData.tables.length})
              </h4>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {debugData.tables.length > 0 ? (
                <div className="space-y-2">
                  {debugData.tables.map((table, index) => (
                    <motion.div
                      key={table}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-2 px-3 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-700 font-medium">
                        {table}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Table
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No tables found
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Database Views ({debugData.views.length})
              </h4>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto">
              {debugData.views.length > 0 ? (
                <div className="space-y-2">
                  {debugData.views.map((view, index) => (
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-2 px-3 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-700 font-medium">{view}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        View
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No views found
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default App;
