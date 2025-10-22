import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import oracledb as cx_Oracle
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from pharma_backend import connect_db
from datetime import datetime

# --- DB Connection ---
con, cur = connect_db()

# ---------- ENHANCED GUI ----------
class PharmacyGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("💊 Pharmacy Management System")
        self.root.geometry("1200x750")
        
        # Apply modern theme - 'cosmo' is clean and professional for healthcare
        self.style = ttk.Style(theme='cosmo')
        
        # Header Frame with gradient effect
        self.create_header()
        
        # Main Container
        main_container = ttk.Frame(self.root)
        main_container.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        # Enhanced Tabs with better styling
        self.tab_control = ttk.Notebook(main_container, bootstyle="info")
        self.tab_inventory = ttk.Frame(self.tab_control)
        self.tab_sales = ttk.Frame(self.tab_control)
        self.tab_suppliers = ttk.Frame(self.tab_control)
        self.tab_reports = ttk.Frame(self.tab_control)
        
        self.tab_control.add(self.tab_inventory, text='📦 Inventory Management')
        self.tab_control.add(self.tab_sales, text='💰 Sales & Billing')
        self.tab_control.add(self.tab_suppliers, text='🏭 Suppliers')
        self.tab_control.add(self.tab_reports, text='📊 Reports & Analytics')
        self.tab_control.pack(expand=1, fill='both')
        
        self.build_inventory_tab()
        self.build_sales_tab()
        self.build_suppliers_tab()
        self.build_reports_tab()
        
        # Status Bar
        self.create_status_bar()

    def create_header(self):
        """Create professional header with branding"""
        header = ttk.Frame(self.root, bootstyle="info")
        header.pack(fill='x', pady=(0, 10))
        
        # Title
        title_label = ttk.Label(
            header,
            text="💊 PHARMACY MANAGEMENT SYSTEM",
            font=('Helvetica', 20, 'bold'),
            bootstyle="inverse-info"
        )
        title_label.pack(pady=15)
        
        # Subtitle
        subtitle = ttk.Label(
            header,
            text="Complete Healthcare Solution | Inventory • Sales • Analytics",
            font=('Helvetica', 10),
            bootstyle="inverse-info"
        )
        subtitle.pack(pady=(0, 15))

    def create_status_bar(self):
        """Create status bar at bottom"""
        status_frame = ttk.Frame(self.root, bootstyle="secondary")
        status_frame.pack(fill='x', side='bottom')
        
        self.status_label = ttk.Label(
            status_frame,
            text="Ready | Database Connected ✓",
            font=('Helvetica', 9),
            bootstyle="inverse-secondary"
        )
        self.status_label.pack(side='left', padx=10, pady=5)
        
        time_label = ttk.Label(
            status_frame,
            text=f"Last Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            font=('Helvetica', 9),
            bootstyle="inverse-secondary"
        )
        time_label.pack(side='right', padx=10, pady=5)

    # ---------------- Enhanced Inventory Tab ----------------
    def build_inventory_tab(self):
        frame = self.tab_inventory
        
        # Control Panel Card
        control_card = ttk.LabelFrame(
            frame,
            text="  🎛️ Inventory Controls  ",
            bootstyle="info",
            padding=15
        )
        control_card.pack(fill='x', padx=15, pady=15)
        
        # Button Frame with better layout
        btn_frame = ttk.Frame(control_card)
        btn_frame.pack(fill='x')
        
        buttons = [
            ("🔍 View All", self.view_inventory, "info"),
            ("➕ Add Medicine", self.add_medicine_gui, "success"),
            ("📝 Update Stock", self.update_stock_gui, "primary"),
            ("⚠️ Low Stock Alert", self.view_low_stock_gui, "warning"),
            ("⏰ Expiring Soon", self.view_expiring_gui, "danger")
        ]
        
        for idx, (text, command, style) in enumerate(buttons):
            btn = ttk.Button(
                btn_frame,
                text=text,
                command=command,
                bootstyle=f"{style}-outline",
                width=20
            )
            btn.grid(row=0, column=idx, padx=5, pady=5)
        
        # Search Frame
        search_frame = ttk.Frame(frame)
        search_frame.pack(fill='x', padx=15, pady=(0, 10))
        
        ttk.Label(
            search_frame,
            text="🔍 Quick Search:",
            font=('Helvetica', 10, 'bold')
        ).pack(side='left', padx=(0, 10))
        
        self.search_var = tk.StringVar()
        search_entry = ttk.Entry(
            search_frame,
            textvariable=self.search_var,
            font=('Helvetica', 10),
            width=40
        )
        search_entry.pack(side='left', padx=5)
        
        # Data Display Card
        data_card = ttk.LabelFrame(
            frame,
            text="  📋 Medicine Inventory  ",
            bootstyle="primary",
            padding=10
        )
        data_card.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        # Treeview with scrollbar
        tree_frame = ttk.Frame(data_card)
        tree_frame.pack(fill='both', expand=True)
        
        scrollbar = ttk.Scrollbar(tree_frame, bootstyle="info-round")
        scrollbar.pack(side='right', fill='y')
        
        columns = ("ID", "Name", "Form", "Strength", "Price", "Qty", "Expiry")
        self.tree_inventory = ttk.Treeview(
            tree_frame,
            columns=columns,
            show='headings',
            height=15,
            yscrollcommand=scrollbar.set,
            bootstyle="info"
        )
        
        scrollbar.config(command=self.tree_inventory.yview)
        
        # Column configuration with better widths
        col_widths = {"ID": 60, "Name": 200, "Form": 100, "Strength": 100, 
                      "Price": 80, "Qty": 80, "Expiry": 100}
        
        for col in columns:
            self.tree_inventory.heading(col, text=col, anchor='center')
            self.tree_inventory.column(col, width=col_widths.get(col, 100), anchor='center')
        
        self.tree_inventory.pack(fill='both', expand=True)
        
        # Add alternating row colors
        self.tree_inventory.tag_configure('oddrow', background='#f9f9f9')
        self.tree_inventory.tag_configure('evenrow', background='#ffffff')

    def view_inventory(self):
        self.update_status("Loading inventory data...")
        for row in self.tree_inventory.get_children():
            self.tree_inventory.delete(row)
        
        cur.execute("SELECT medicine_id, name, pharma_form, strength, unit_price, NVL(qty,0), expiry_date FROM vw_inventory_summary")
        rows = cur.fetchall()
        
        for idx, r in enumerate(rows):
            expiry = r[6].strftime("%Y-%m-%d") if r[6] else "N/A"
            tag = 'oddrow' if idx % 2 else 'evenrow'
            self.tree_inventory.insert("", "end", values=(r[0], r[1], r[2], r[3], f"₹{r[4]}", r[5], expiry), tags=(tag,))
        
        self.update_status(f"✓ Loaded {len(rows)} medicines")

    def add_medicine_gui(self):
        # Enhanced input dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("➕ Add New Medicine")
        dialog.geometry("450x500")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (450 // 2)
        y = (dialog.winfo_screenheight() // 2) - (500 // 2)
        dialog.geometry(f'+{x}+{y}')
        
        main_frame = ttk.Frame(dialog, padding=20)
        main_frame.pack(fill='both', expand=True)
        
        ttk.Label(
            main_frame,
            text="📝 Medicine Information",
            font=('Helvetica', 14, 'bold'),
            bootstyle="info"
        ).pack(pady=(0, 20))
        
        # Form fields
        fields = {}
        field_info = [
            ("Medicine Name:", "name", "text"),
            ("Form (Tablet/Syrup/etc):", "form", "text"),
            ("Strength (e.g., 500mg):", "strength", "text"),
            ("Unit Price (₹):", "price", "number"),
            ("Supplier ID:", "supplier", "number"),
            ("Expiry Date (YYYY-MM-DD):", "expiry", "text")
        ]
        
        for label_text, key, field_type in field_info:
            field_frame = ttk.Frame(main_frame)
            field_frame.pack(fill='x', pady=8)
            
            ttk.Label(
                field_frame,
                text=label_text,
                font=('Helvetica', 10),
                width=25,
                anchor='w'
            ).pack(side='left')
            
            entry = ttk.Entry(field_frame, width=25, font=('Helvetica', 10))
            entry.pack(side='left', padx=(10, 0))
            fields[key] = entry
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(pady=30)
        
        def save_medicine():
            try:
                name = fields['name'].get()
                form = fields['form'].get()
                strength = fields['strength'].get()
                price = float(fields['price'].get())
                supplier_id = int(fields['supplier'].get() or 0)
                expiry = fields['expiry'].get()
                
                if not name:
                    messagebox.showwarning("Validation Error", "Medicine name is required!")
                    return
                
                binds = [name, form, strength, price, supplier_id]
                if expiry:
                    sql = "INSERT INTO Medicines(name, pharma_form, strength, unit_price, supplier_id, expiry_date) VALUES(:1,:2,:3,:4,:5,TO_DATE(:6,'YYYY-MM-DD'))"
                    binds.append(expiry)
                else:
                    sql = "INSERT INTO Medicines(name, pharma_form, strength, unit_price, supplier_id) VALUES(:1,:2,:3,:4,:5)"
                
                cur.execute(sql, binds)
                con.commit()
                messagebox.showinfo("Success", "✓ Medicine added successfully!")
                dialog.destroy()
                self.view_inventory()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add medicine:\n{str(e)}")
        
        ttk.Button(
            btn_frame,
            text="💾 Save Medicine",
            command=save_medicine,
            bootstyle="success",
            width=15
        ).pack(side='left', padx=5)
        
        ttk.Button(
            btn_frame,
            text="❌ Cancel",
            command=dialog.destroy,
            bootstyle="danger-outline",
            width=15
        ).pack(side='left', padx=5)

    def update_stock_gui(self):
        mid = simpledialog.askinteger("Update Stock", "Enter Medicine ID:")
        qty = simpledialog.askinteger("Quantity", "Quantity to add (negative to reduce):")
        if mid is None or qty is None:
            return
        try:
            cur.execute("UPDATE Inventory SET qty = NVL(qty,0) + :1 WHERE medicine_id = :2", (qty, mid))
            if cur.rowcount == 0:
                cur.execute("INSERT INTO Inventory(medicine_id, qty, min_threshold) VALUES(:1, :2, :3)", (mid, qty, 10))
            con.commit()
            messagebox.showinfo("Success", "✓ Stock updated successfully!")
            self.view_inventory()
            self.update_status(f"Stock updated for Medicine ID: {mid}")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def view_low_stock_gui(self):
        cur.execute("""
            SELECT m.name, i.qty, i.min_threshold
            FROM Inventory i JOIN Medicines m ON i.medicine_id = m.medicine_id
            WHERE NVL(i.qty,0) <= NVL(i.min_threshold,10)
        """)
        rows = cur.fetchall()
        
        if not rows:
            messagebox.showinfo("Low Stock", "✓ No low stock items found!")
            return
        
        # Create custom dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("⚠️ Low Stock Alert")
        dialog.geometry("500x400")
        
        ttk.Label(
            dialog,
            text="⚠️ Items Requiring Attention",
            font=('Helvetica', 14, 'bold'),
            bootstyle="warning"
        ).pack(pady=15)
        
        tree = ttk.Treeview(
            dialog,
            columns=("Medicine", "Current Qty", "Min Threshold"),
            show='headings',
            height=12,
            bootstyle="warning"
        )
        
        for col in ("Medicine", "Current Qty", "Min Threshold"):
            tree.heading(col, text=col)
            tree.column(col, width=150, anchor='center')
        
        tree.pack(fill='both', expand=True, padx=15, pady=15)
        
        for r in rows:
            tree.insert("", "end", values=(r[0], r[1], r[2]))

    def view_expiring_gui(self):
        cur.execute("SELECT name, expiry_date FROM Medicines WHERE expiry_date < TRUNC(SYSDATE)")
        expired = cur.fetchall()
        
        cur.execute("SELECT name, expiry_date FROM Medicines WHERE expiry_date BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE)+90")
        near = cur.fetchall()
        
        # Custom dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("⏰ Expiry Management")
        dialog.geometry("600x500")
        
        ttk.Label(
            dialog,
            text="⏰ Medicine Expiry Report",
            font=('Helvetica', 14, 'bold'),
            bootstyle="danger"
        ).pack(pady=15)
        
        if expired:
            ttk.Label(
                dialog,
                text=f"🔴 EXPIRED ({len(expired)} items)",
                font=('Helvetica', 11, 'bold'),
                bootstyle="danger"
            ).pack(pady=5)
            
            tree1 = ttk.Treeview(
                dialog,
                columns=("Medicine", "Expiry Date"),
                show='headings',
                height=6,
                bootstyle="danger"
            )
            for col in ("Medicine", "Expiry Date"):
                tree1.heading(col, text=col)
                tree1.column(col, width=250, anchor='center')
            tree1.pack(fill='x', padx=15, pady=5)
            
            for r in expired:
                tree1.insert("", "end", values=(r[0], r[1].strftime('%Y-%m-%d')))
        
        if near:
            ttk.Label(
                dialog,
                text=f"🟡 EXPIRING SOON ({len(near)} items - next 90 days)",
                font=('Helvetica', 11, 'bold'),
                bootstyle="warning"
            ).pack(pady=5)
            
            tree2 = ttk.Treeview(
                dialog,
                columns=("Medicine", "Expiry Date"),
                show='headings',
                height=6,
                bootstyle="warning"
            )
            for col in ("Medicine", "Expiry Date"):
                tree2.heading(col, text=col)
                tree2.column(col, width=250, anchor='center')
            tree2.pack(fill='x', padx=15, pady=5)
            
            for r in near:
                tree2.insert("", "end", values=(r[0], r[1].strftime('%Y-%m-%d')))
        
        if not expired and not near:
            ttk.Label(
                dialog,
                text="✓ All medicines are within safe expiry range",
                font=('Helvetica', 11),
                bootstyle="success"
            ).pack(pady=50)

    # ---------------- Enhanced Sales Tab ----------------
    def build_sales_tab(self):
        frame = self.tab_sales
        
        # Control Panel
        control_card = ttk.LabelFrame(
            frame,
            text="  💰 Sales Operations  ",
            bootstyle="success",
            padding=15
        )
        control_card.pack(fill='x', padx=15, pady=15)
        
        btn_frame = ttk.Frame(control_card)
        btn_frame.pack()
        
        ttk.Button(
            btn_frame,
            text="🧾 Create New Invoice",
            command=self.create_invoice_gui,
            bootstyle="success",
            width=25
        ).pack(side='left', padx=10)
        
        ttk.Button(
            btn_frame,
            text="📜 View All Orders",
            command=self.view_orders_gui,
            bootstyle="info-outline",
            width=25
        ).pack(side='left', padx=10)
        
        # Orders Display
        data_card = ttk.LabelFrame(
            frame,
            text="  📊 Order History  ",
            bootstyle="primary",
            padding=10
        )
        data_card.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        tree_frame = ttk.Frame(data_card)
        tree_frame.pack(fill='both', expand=True)
        
        scrollbar = ttk.Scrollbar(tree_frame, bootstyle="success-round")
        scrollbar.pack(side='right', fill='y')
        
        self.tree_orders = ttk.Treeview(
            tree_frame,
            columns=("OrderID", "Customer", "Date", "Total", "Status"),
            show='headings',
            yscrollcommand=scrollbar.set,
            bootstyle="success"
        )
        scrollbar.config(command=self.tree_orders.yview)
        
        col_config = {
            "OrderID": 80,
            "Customer": 200,
            "Date": 120,
            "Total": 120,
            "Status": 120
        }
        
        for col, width in col_config.items():
            self.tree_orders.heading(col, text=col, anchor='center')
            self.tree_orders.column(col, width=width, anchor='center')
        
        self.tree_orders.pack(fill='both', expand=True)

    def create_invoice_gui(self):
        cid = simpledialog.askinteger("Customer ID", "Customer ID (0 for new guest):", initialvalue=0)
        if cid == 0:
            name = simpledialog.askstring("Guest Name", "Enter customer name:")
            if not name:
                return
            cur.execute("INSERT INTO Customers(name) VALUES(:1)", (name,))
            con.commit()
            cur.execute("SELECT customer_id FROM Customers WHERE ROWID=(SELECT MAX(ROWID) FROM Customers)")
            cid = cur.fetchone()[0]

        items, qtys = [], []
        while True:
            mid = simpledialog.askinteger("Medicine ID", "Enter Medicine ID (0 to finish):", initialvalue=0)
            if mid == 0:
                break
            q = simpledialog.askinteger("Quantity", f"Quantity for Medicine {mid}:")
            if q:
                items.append(mid)
                qtys.append(q)

        if not items:
            messagebox.showwarning("Aborted", "No items selected.")
            return

        arr_items = cur.arrayvar(cx_Oracle.NUMBER, items)
        arr_qtys = cur.arrayvar(cx_Oracle.NUMBER, qtys)
        try:
            cur.callproc("sp_place_order", [cid, arr_items, arr_qtys])
            messagebox.showinfo("Success", "✓ Invoice created successfully!")
            self.view_orders_gui()
            self.update_status("New invoice created")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def view_orders_gui(self):
        self.update_status("Loading orders...")
        for row in self.tree_orders.get_children():
            self.tree_orders.delete(row)
        
        cur.execute("""
            SELECT o.order_id, c.name, o.order_date, o.total_amount, o.status
            FROM Orders o LEFT JOIN Customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        """)
        rows = cur.fetchall()
        
        for idx, r in enumerate(rows):
            tag = 'oddrow' if idx % 2 else 'evenrow'
            self.tree_orders.insert("", "end", values=(
                r[0], r[1], r[2].strftime("%Y-%m-%d"), f"₹{r[3]:.2f}", r[4]
            ), tags=(tag,))
        
        self.update_status(f"✓ Loaded {len(rows)} orders")

    # ---------------- Enhanced Suppliers Tab ----------------
    def build_suppliers_tab(self):
        frame = self.tab_suppliers
        
        control_card = ttk.LabelFrame(
            frame,
            text="  🏭 Supplier Management  ",
            bootstyle="warning",
            padding=15
        )
        control_card.pack(fill='x', padx=15, pady=15)
        
        btn_frame = ttk.Frame(control_card)
        btn_frame.pack()
        
        ttk.Button(
            btn_frame,
            text="➕ Add Supplier",
            command=self.add_supplier_gui,
            bootstyle="warning",
            width=20
        ).pack(side='left', padx=10)
        
        ttk.Button(
            btn_frame,
            text="📋 View All Suppliers",
            command=self.view_suppliers_gui,
            bootstyle="info-outline",
            width=20
        ).pack(side='left', padx=10)
        
        data_card = ttk.LabelFrame(
            frame,
            text="  📇 Supplier Directory  ",
            bootstyle="primary",
            padding=10
        )
        data_card.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        tree_frame = ttk.Frame(data_card)
        tree_frame.pack(fill='both', expand=True)
        
        scrollbar = ttk.Scrollbar(tree_frame, bootstyle="warning-round")
        scrollbar.pack(side='right', fill='y')
        
        self.tree_suppliers = ttk.Treeview(
            tree_frame,
            columns=("ID", "Name", "Email", "Phone", "Created"),
            show='headings',
            yscrollcommand=scrollbar.set,
            bootstyle="warning"
        )
        scrollbar.config(command=self.tree_suppliers.yview)
        
        col_config = {
            "ID": 60,
            "Name": 200,
            "Email": 250,
            "Phone": 150,
            "Created": 180
        }
        
        for col, width in col_config.items():
            self.tree_suppliers.heading(col, text=col, anchor='center')
            self.tree_suppliers.column(col, width=width, anchor='center')
        
        self.tree_suppliers.pack(fill='both', expand=True)

    def add_supplier_gui(self):
        name = simpledialog.askstring("Supplier Name", "Enter supplier name:")
        if not name:
            return
        email = simpledialog.askstring("Email", "Enter email address:")
        phone = simpledialog.askstring("Phone", "Enter phone number:")
        
        try:
            cur.execute("INSERT INTO Suppliers(name, contact_email, phone) VALUES(:1,:2,:3)", (name, email, phone))
            con.commit()
            messagebox.showinfo("Success", "✓ Supplier added successfully!")
            self.view_suppliers_gui()
            self.update_status("New supplier added")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def view_suppliers_gui(self):
        self.update_status("Loading suppliers...")
        for row in self.tree_suppliers.get_children():
            self.tree_suppliers.delete(row)
        
        cur.execute("SELECT supplier_id, name, contact_email, phone, created_at FROM Suppliers")
        rows = cur.fetchall()
        
        for idx, r in enumerate(rows):
            tag = 'oddrow' if idx % 2 else 'evenrow'
            self.tree_suppliers.insert("", "end", values=(
                r[0], r[1], r[2], r[3], r[4].strftime("%Y-%m-%d %H:%M:%S")
            ), tags=(tag,))
        
        self.update_status(f"✓ Loaded {len(rows)} suppliers")

    # ---------------- Enhanced Reports Tab ----------------
    def build_reports_tab(self):
        frame = self.tab_reports
        
        # Header
        header = ttk.Label(
            frame,
            text="📊 Analytics & Reports Dashboard",
            font=('Helvetica', 16, 'bold'),
            bootstyle="primary"
        )
        header.pack(pady=20)
        
        # Report Cards Container
        cards_container = ttk.Frame(frame)
        cards_container.pack(fill='both', expand=True, padx=20, pady=10)
        
        # Create report cards with visual appeal
        reports = [
            ("💰 Medicines Above Average Price", 
             "View medicines priced higher than average market rate",
             self.meds_above_avg_gui, "info"),
            ("📦 Inventory Analysis", 
             "Medicines with quantity above threshold levels",
             self.meds_inventory_any_gui, "success"),
            ("🔄 Union & Intersect Report", 
             "Combined supplier and customer analysis",
             self.union_intersect_gui, "warning")
        ]
        
        for idx, (title, desc, command, style) in enumerate(reports):
            card = ttk.LabelFrame(
                cards_container,
                text=f"  {title}  ",
                bootstyle=style,
                padding=20
            )
            card.pack(fill='x', pady=10)
            
            ttk.Label(
                card,
                text=desc,
                font=('Helvetica', 10),
                wraplength=800
            ).pack(pady=10)
            
            ttk.Button(
                card,
                text=f"🔍 Generate Report",
                command=command,
                bootstyle=f"{style}-outline",
                width=20
            ).pack()

    def meds_above_avg_gui(self):
        cur.execute("SELECT name, unit_price FROM Medicines WHERE unit_price > (SELECT AVG(unit_price) FROM Medicines)")
        rows = cur.fetchall()
        
        dialog = tk.Toplevel(self.root)
        dialog.title("💰 Premium Medicines Report")
        dialog.geometry("500x400")
        
        ttk.Label(
            dialog,
            text="💰 Medicines Above Average Price",
            font=('Helvetica', 14, 'bold'),
            bootstyle="info"
        ).pack(pady=15)
        
        tree = ttk.Treeview(
            dialog,
            columns=("Medicine", "Price"),
            show='headings',
            height=15,
            bootstyle="info"
        )
        
        tree.heading("Medicine", text="Medicine Name")
        tree.heading("Price", text="Unit Price")
        tree.column("Medicine", width=300, anchor='center')
        tree.column("Price", width=150, anchor='center')
        tree.pack(fill='both', expand=True, padx=15, pady=15)
        
        for r in rows:
            tree.insert("", "end", values=(r[0], f"₹{r[1]:.2f}"))

    def meds_inventory_any_gui(self):
        cur.execute("""
            SELECT m.name, i.qty
            FROM Medicines m JOIN Inventory i ON m.medicine_id = i.medicine_id
            WHERE i.qty > ANY (SELECT min_threshold FROM Inventory)
        """)
        rows = cur.fetchall()
        
        dialog = tk.Toplevel(self.root)
        dialog.title("📦 Inventory Analysis")
        dialog.geometry("500x400")
        
        ttk.Label(
            dialog,
            text="📦 Well-Stocked Inventory Items",
            font=('Helvetica', 14, 'bold'),
            bootstyle="success"
        ).pack(pady=15)
        
        tree = ttk.Treeview(
            dialog,
            columns=("Medicine", "Quantity"),
            show='headings',
            height=15,
            bootstyle="success"
        )
        
        tree.heading("Medicine", text="Medicine Name")
        tree.heading("Quantity", text="Current Quantity")
        tree.column("Medicine", width=300, anchor='center')
        tree.column("Quantity", width=150, anchor='center')
        tree.pack(fill='both', expand=True, padx=15, pady=15)
        
        for r in rows:
            tree.insert("", "end", values=(r[0], r[1]))

    def union_intersect_gui(self):
        cur.execute("SELECT name FROM Suppliers UNION SELECT name FROM Customers")
        union_res = [r[0] for r in cur.fetchall()]
        
        cur.execute("SELECT name FROM Suppliers INTERSECT SELECT name FROM Customers")
        intersect_res = [r[0] for r in cur.fetchall()]
        
        msg = f"📊 UNION Results ({len(union_res)} total):\n"
        msg += ", ".join(union_res[:10]) + ("..." if len(union_res) > 10 else "")
        msg += f"\n\n🔗 INTERSECT Results ({len(intersect_res)} common):\n"
        msg += ", ".join(intersect_res) if intersect_res else "No common names found"
        
        messagebox.showinfo("Union & Intersect Analysis", msg)

    def update_status(self, message):
        """Update status bar message"""
        self.status_label.config(text=message)
        self.root.update_idletasks()


# ---------- Run Enhanced GUI ----------
if __name__ == "__main__":
    root = ttk.Window(themename="cosmo")  # Using ttkbootstrap Window
    app = PharmacyGUI(root)
    root.mainloop()
