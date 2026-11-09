# Vellore Pharmacy Management System

A comprehensive, full-stack web application designed for efficient pharmacy operations. This system provides robust tools for inventory control, sales processing, supplier management, and business analytics, featuring a modern, animated user interface.

##  Features

### 📦 Inventory Management

- **Stock Control:** Real-time tracking of medicine quantities, forms, and strengths.
- **Smart Alerts:** Automated dashboard notifications for **Low Stock** items and **Expiring Medicines** (both expired and near-expiry).
- **Lifecycle Management:** Functionality to add, update stock, retire, and restore medicines.

### 🛒 Sales & Orders

- **Order Processing:** Streamlined interface for creating customer orders with dynamic item selection.
- **Order History:** Detailed view of past transactions with expandable line-item details.
- **Calculations:** Automatic calculation of line totals and grand totals.

### 👥 Stakeholder Management

- **Suppliers:** Manage supplier profiles and view performance metrics (average pricing, product count).
- **Customers:** Maintain a customer database for quick order association and history.

### 📊 Analytics & Reports

- **Sales Intelligence:** Visual breakdown of sales trends, revenue, and average order value.
- **Pricing Strategy:** Analysis of premium vs. value products and market positioning.
- **Audit Logs:** Comprehensive system log tracking all database operations (`INSERT`, `UPDATE`, `DELETE`) with timestamps and user actions.
- **Advanced Queries:** Demonstrations of complex database operations like `UNION` and `INTERSECT`.

### ⚙️ Admin & Database Tools

- **Schema Management:** UI-based tools to initialize database schema, triggers, stored procedures, and views.
- **Data Seeding:** One-click generation of sample data for testing.
- **System Health:** Real-time monitoring of database connectivity and record counts.

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Backend:** Node.js / Express (Expected on port 5000)
- **Database Concepts:** Utilizes Triggers, Stored Procedures, Views, and Complex Queries.

## 🔧 Installation & Setup

### Prerequisites

- Node.js installed on your machine.
- The backend server running at `http://localhost:5000`.

### Steps

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd pharmacy-frontend
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configuration**
    The application is configured to communicate with the backend at `http://localhost:5000/api`. If your backend runs on a different port, update the `API_URL` constant in `src/App.jsx`.

4.  **Run the Application**
    ```bash
    npm run dev
    ```

## 📸 Usage Guide

1.  **First Run:** Navigate to the **Admin & Setup** tab.
2.  **Initialization:** Click **Setup Database Schema** followed by **Seed Sample Data** to populate the system.
3.  **Operations:** Use the sidebar navigation to manage inventory, process sales, or view reports.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

_This project was developed as a DBMS project demonstrating full-stack integration with advanced database concepts._
