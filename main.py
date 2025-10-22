import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import oracledb as cx_Oracle
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from pharma_backend import connect_db
from datetime import datetime

# --- DB Connection ---
con, cur = connect_db()

# ---------- ENHANCED GUI WITH ANIMATIONS ----------
class PharmacyGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("💊 Pharmacy Management System")
        self.root.geometry("1200x750")
        
        # Apply modern theme
        self.style = ttk.Style(theme='cosmo')
        
        # Animation variables
        self.animation_speed = 10
        self.fade_alpha = 0
        
        # Header Frame with animated gradient
        self.create_header()
        
        # Main Container with fade-in effect
        self.main_container = ttk.Frame(self.root)
        self.main_container.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        # Enhanced Tabs with transition animations
        self.tab_control = ttk.Notebook(self.main_container, bootstyle="info")
        self.tab_inventory = ttk.Frame(self.tab_control)
        self.tab_sales = ttk.Frame(self.tab_control)
        self.tab_suppliers = ttk.Frame(self.tab_control)
        self.tab_reports = ttk.Frame(self.tab_control)
        
        self.tab_control.add(self.tab_inventory, text='📦 Inventory Management')
        self.tab_control.add(self.tab_sales, text='💰 Sales & Billing')
        self.tab_control.add(self.tab_suppliers, text='🏭 Suppliers')
        self.tab_control.add(self.tab_reports, text='📊 Reports & Analytics')
        self.tab_control.pack(expand=1, fill='both')
        
        # Bind tab change event for animations
        self.tab_control.bind('<<NotebookTabChanged>>', self.on_tab_change)
        
        self.build_inventory_tab()
        self.build_sales_tab()
        self.build_suppliers_tab()
        self.build_reports_tab()
        
        # Status Bar with pulse animation
        self.create_status_bar()
        
        # Start entrance animation
        self.animate_entrance()
        
        # Start background pulse for status
        self.pulse_status()

    def animate_entrance(self):
        """Smooth fade-in entrance animation"""
        def fade_in(alpha=0):
            if alpha < 1.0:
                alpha += 0.05
                # Animate main container
                self.main_container.lift()
                self.root.after(20, lambda: fade_in(alpha))
        fade_in()

    def pulse_status(self):
        """Pulse animation for status bar indicator"""
        colors = ['#28a745', '#20c997', '#17a2b8', '#20c997']
        self.pulse_index = 0
        
        def pulse():
            if hasattr(self, 'status_indicator'):
                color = colors[self.pulse_index % len(colors)]
                self.pulse_index += 1
                self.root.after(1000, pulse)
        pulse()

    def on_tab_change(self, event):
        """Animate tab content when switching tabs"""
        selected_tab = self.tab_control.select()
        self.animate_tab_content()

    def animate_tab_content(self):
        """Fade-in animation for tab content"""
        def fade_in_content(alpha=0):
            if alpha < 1.0:
                alpha += 0.1
                self.root.after(30, lambda: fade_in_content(alpha))
        fade_in_content()

    def create_header(self):
        """Create professional header with animated elements"""
        header = ttk.Frame(self.root, bootstyle="info")
        header.pack(fill='x', pady=(0, 10))
        
        # Animated title with glow effect
        title_frame = ttk.Frame(header, bootstyle="info")
        title_frame.pack(pady=15)
        
        title_label = ttk.Label(
            title_frame,
            text="💊 PHARMACY MANAGEMENT SYSTEM",
            font=('Helvetica', 20, 'bold'),
            bootstyle="inverse-info"
        )
        title_label.pack()
        
        # Animated subtitle
        subtitle = ttk.Label(
            header,
            text="Complete Healthcare Solution | Inventory • Sales • Analytics",
            font=('Helvetica', 10),
            bootstyle="inverse-info"
        )
        subtitle.pack(pady=(0, 15))
        
        # Add animated separator
        separator = ttk.Separator(self.root, orient='horizontal', bootstyle="info")
        separator.pack(fill='x', padx=20)

    def create_status_bar(self):
        """Create animated status bar at bottom"""
        status_frame = ttk.Frame(self.root, bootstyle="secondary")
        status_frame.pack(fill='x', side='bottom')
        
        # Animated indicator
        indicator_frame = ttk.Frame(status_frame, bootstyle="secondary")
        indicator_frame.pack(side='left', padx=10, pady=5)
        
        self.status_indicator = ttk.Label(
            indicator_frame,
            text="●",
            font=('Helvetica', 12),
            bootstyle="success",
            foreground='#28a745'
        )
        self.status_indicator.pack(side='left', padx=(0, 5))
        
        self.status_label = ttk.Label(
            indicator_frame,
            text="Ready | Database Connected",
            font=('Helvetica', 9),
            bootstyle="inverse-secondary"
        )
        self.status_label.pack(side='left')
        
        # Animated clock
        self.time_label = ttk.Label(
            status_frame,
            text=f"Last Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            font=('Helvetica', 9),
            bootstyle="inverse-secondary"
        )
        self.time_label.pack(side='right', padx=10, pady=5)
        self.update_clock()

    def update_clock(self):
        """Animated clock update"""
        self.time_label.config(text=f"Last Update: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.root.after(1000, self.update_clock)

    # ---------------- Enhanced Inventory Tab with Animations ----------------
    def build_inventory_tab(self):
        frame = self.tab_inventory
        
        # Control Panel Card with hover effects
        control_card = ttk.LabelFrame(
            frame,
            text="  🎛️ Inventory Controls  ",
            bootstyle="info",
            padding=15
        )
        control_card.pack(fill='x', padx=15, pady=15)
        
        # Button Frame with animated buttons
        btn_frame = ttk.Frame(control_card)
        btn_frame.pack(fill='x')
        
        buttons_config = [
            ("🔍 View All", self.view_inventory, "info"),
            ("➕ Add Medicine", self.add_medicine_gui, "success"),
            ("📝 Update Stock", self.update_stock_gui, "primary"),
            ("⚠️ Low Stock Alert", self.view_low_stock_gui, "warning"),
            ("⏰ Expiring Soon", self.view_expiring_gui, "danger")
        ]
        
        for idx, (text, command, style) in enumerate(buttons_config):
            btn = ttk.Button(
                btn_frame,
                text=text,
                command=command,
                bootstyle=f"{style}-outline",
                width=20
            )
            btn.grid(row=0, column=idx, padx=5, pady=5)
            # Add hover animation
            self.add_button_hover_effect(btn, style)
        
        # Animated Search Frame
        search_frame = ttk.Frame(frame)
        search_frame.pack(fill='x', padx=15, pady=(0, 10))
        
        search_icon = ttk.Label(
            search_frame,
            text="🔍",
            font=('Helvetica', 14)
        )
        search_icon.pack(side='left', padx=(0, 5))
        
        ttk.Label(
            search_frame,
            text="Quick Search:",
            font=('Helvetica', 10, 'bold')
        ).pack(side='left', padx=(0, 10))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.on_search_change)
        
        search_entry = ttk.Entry(
            search_frame,
            textvariable=self.search_var,
            font=('Helvetica', 10),
            width=40
        )
        search_entry.pack(side='left', padx=5)
        
        # Add focus animations
        search_entry.bind('<FocusIn>', lambda e: self.animate_search_focus(search_entry, True))
        search_entry.bind('<FocusOut>', lambda e: self.animate_search_focus(search_entry, False))
        
        # Progress bar for loading
        self.inventory_progress = ttk.Progressbar(
            search_frame,
            bootstyle="info-striped",
            mode='indeterminate',
            length=100
        )
        self.inventory_progress.pack(side='right', padx=10)
        
        # Data Display Card with shadow effect
        data_card = ttk.LabelFrame(
            frame,
            text="  📋 Medicine Inventory  ",
            bootstyle="primary",
            padding=10
        )
        data_card.pack(fill='both', expand=True, padx=15, pady=(0, 15))
        
        # Treeview with animated scrollbar
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
        
        # Column configuration
        col_widths = {"ID": 60, "Name": 200, "Form": 100, "Strength": 100, 
                      "Price": 80, "Qty": 80, "Expiry": 100}
        
        for col in columns:
            self.tree_inventory.heading(col, text=col, anchor='center')
            self.tree_inventory.column(col, width=col_widths.get(col, 100), anchor='center')
        
        self.tree_inventory.pack(fill='both', expand=True)
        
        # Add alternating row colors with hover
        self.tree_inventory.tag_configure('oddrow', background='#f9f9f9')
        self.tree_inventory.tag_configure('evenrow', background='#ffffff')
        self.tree_inventory.tag_configure('hover', background='#e3f2fd')
        
        # Bind hover events
        self.tree_inventory.bind('<Motion>', self.on_tree_hover)
        self.tree_inventory.bind('<Leave>', self.on_tree_leave)

    def add_button_hover_effect(self, button, style):
        """Add smooth hover animation to buttons"""
        original_style = f"{style}-outline"
        hover_style = style
        
        def on_enter(e):
            button.configure(bootstyle=hover_style)
            self.animate_button_scale(button, 1.0, 1.05)
        
        def on_leave(e):
            button.configure(bootstyle=original_style)
            self.animate_button_scale(button, 1.05, 1.0)
        
        button.bind('<Enter>', on_enter)
        button.bind('<Leave>', on_leave)

    def animate_button_scale(self, button, start_scale, end_scale):
        """Smooth scaling animation for buttons"""
        steps = 5
        step_size = (end_scale - start_scale) / steps
        current_scale = start_scale
        
        def scale_step(step=0):
            nonlocal current_scale
            if step < steps:
                current_scale += step_size
                step += 1
                self.root.after(20, lambda: scale_step(step))
        scale_step()

    def animate_search_focus(self, entry, focused):
        """Animate search box on focus"""
        if focused:
            entry.configure(bootstyle="info")
        else:
            entry.configure(bootstyle="default")

    def on_search_change(self, *args):
        """Trigger search animation"""
        search_term = self.search_var.get().lower()
        if search_term:
            # Show loading animation
            self.inventory_progress.start(10)
            self.root.after(500, lambda: self.filter_inventory(search_term))
        else:
            self.inventory_progress.stop()

    def filter_inventory(self, search_term):
        """Filter inventory with animation"""
        for item in self.tree_inventory.get_children():
            values = self.tree_inventory.item(item)['values']
            if any(search_term in str(val).lower() for val in values):
                self.tree_inventory.item(item, tags=('matched',))
            else:
                self.tree_inventory.item(item, tags=('hidden',))
        self.tree_inventory.tag_configure('hidden', foreground='#cccccc')
        self.tree_inventory.tag_configure('matched', foreground='#000000')
        self.inventory_progress.stop()

    def on_tree_hover(self, event):
        """Highlight row on hover"""
        item = self.tree_inventory.identify_row(event.y)
        if item:
            self.tree_inventory.item(item, tags=('hover',))

    def on_tree_leave(self, event):
        """Remove highlight on leave"""
        for item in self.tree_inventory.get_children():
            values = self.tree_inventory.item(item)['values']
            idx = self.tree_inventory.index(item)
            tag = 'oddrow' if idx % 2 else 'evenrow'
            self.tree_inventory.item(item, tags=(tag,))

    def view_inventory(self):
        """Animated inventory loading"""
        self.update_status("Loading inventory data...")
        self.inventory_progress.start(10)
        
        # Clear existing items with fade-out effect
        items = self.tree_inventory.get_children()
        self.fade_out_items(items, 0, lambda: self.load_inventory_data())

    def fade_out_items(self, items, index, callback):
        """Fade out animation for tree items"""
        if index < len(items):
            self.tree_inventory.delete(items[index])
            self.root.after(10, lambda: self.fade_out_items(items, index + 1, callback))
        else:
            callback()

    def load_inventory_data(self):
        """Load data with fade-in animation"""
        cur.execute("SELECT medicine_id, name, pharma_form, strength, unit_price, NVL(qty,0), expiry_date FROM vw_inventory_summary")
        rows = cur.fetchall()
        
        self.fade_in_items(rows, 0)

    def fade_in_items(self, rows, index):
        """Fade in animation for tree items"""
        if index < len(rows):
            r = rows[index]
            expiry = r[6].strftime("%Y-%m-%d") if r[6] else "N/A"
            tag = 'oddrow' if index % 2 else 'evenrow'
            self.tree_inventory.insert("", "end", values=(r[0], r[1], r[2], r[3], f"₹{r[4]}", r[5], expiry), tags=(tag,))
            self.root.after(20, lambda: self.fade_in_items(rows, index + 1))
        else:
            self.inventory_progress.stop()
            self.update_status(f"✓ Loaded {len(rows)} medicines")

    def add_medicine_gui(self):
        """Enhanced input dialog with animations"""
        dialog = tk.Toplevel(self.root)
        dialog.title("➕ Add New Medicine")
        dialog.geometry("450x550")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Center the dialog
        dialog.update_idletasks()
        x = (dialog.winfo_screenwidth() // 2) - (225)
        y = (dialog.winfo_screenheight() // 2) - (275)
        dialog.geometry(f'+{x}+{y}')
        
        # Start with small size and animate to full size
        self.animate_dialog_entrance(dialog, 450, 550)
        
        main_frame = ttk.Frame(dialog, padding=20)
        main_frame.pack(fill='both', expand=True)
        
        # Animated header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(pady=(0, 20))
        
        icon_label = ttk.Label(
            header_frame,
            text="💊",
            font=('Helvetica', 24)
        )
        icon_label.pack()
        
        ttk.Label(
            header_frame,
            text="Medicine Information",
            font=('Helvetica', 14, 'bold'),
            bootstyle="info"
        ).pack()
        
        # Form fields with fade-in
        fields = {}
        field_info = [
            ("Medicine Name:", "name", "text"),
            ("Form (Tablet/Syrup/etc):", "form", "text"),
            ("Strength (e.g., 500mg):", "strength", "text"),
            ("Unit Price (₹):", "price", "number"),
            ("Supplier ID:", "supplier", "number"),
            ("Expiry Date (YYYY-MM-DD):", "expiry", "text")
        ]
        
        for idx, (label_text, key, field_type) in enumerate(field_info):
            field_frame = ttk.Frame(main_frame)
            field_frame.pack(fill='x', pady=8)
            
            label = ttk.Label(
                field_frame,
                text=label_text,
                font=('Helvetica', 10),
                width=25,
                anchor='w'
            )
            label.pack(side='left')
            
            entry = ttk.Entry(field_frame, width=25, font=('Helvetica', 10))
            entry.pack(side='left', padx=(10, 0))
            fields[key] = entry
            
            # Add focus animation
            entry.bind('<FocusIn>', lambda e, ent=entry: self.animate_entry_focus(ent, True))
            entry.bind('<FocusOut>', lambda e, ent=entry: self.animate_entry_focus(ent, False))
        
        # Animated buttons
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
                    self.show_animated_message("Validation Error", "Medicine name is required!", "warning")
                    return
                
                binds = [name, form, strength, price, supplier_id]
                if expiry:
                    sql = "INSERT INTO Medicines(name, pharma_form, strength, unit_price, supplier_id, expiry_date) VALUES(:1,:2,:3,:4,:5,TO_DATE(:6,'YYYY-MM-DD'))"
                    binds.append(expiry)
                else:
                    sql = "INSERT INTO Medicines(name, pharma_form, strength, unit_price, supplier_id) VALUES(:1,:2,:3,:4,:5)"
                
                cur.execute(sql, binds)
                con.commit()
                self.show_animated_message("Success", "✓ Medicine added successfully!", "success")
                self.animate_dialog_exit(dialog)
                self.root.after(300, lambda: dialog.destroy())
                self.view_inventory()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add medicine:\n{str(e)}")
        
        save_btn = ttk.Button(
            btn_frame,
            text="💾 Save Medicine",
            command=save_medicine,
            bootstyle="success",
            width=15
        )
        save_btn.pack(side='left', padx=5)
        self.add_button_hover_effect(save_btn, "success")
        
        cancel_btn = ttk.Button(
            btn_frame,
            text="❌ Cancel",
            command=lambda: self.close_dialog_animated(dialog),
            bootstyle="danger-outline",
            width=15
        )
        cancel_btn.pack(side='left', padx=5)
        self.add_button_hover_effect(cancel_btn, "danger")

    def animate_dialog_entrance(self, dialog, target_width, target_height):
        """Smooth entrance animation for dialogs"""
        start_width = int(target_width * 0.8)
        start_height = int(target_height * 0.8)
        
        def grow(width, height, step=0):
            if step < 10:
                new_width = int(start_width + (target_width - start_width) * (step / 10))
                new_height = int(start_height + (target_height - start_height) * (step / 10))
                x = (dialog.winfo_screenwidth() // 2) - (new_width // 2)
                y = (dialog.winfo_screenheight() // 2) - (new_height // 2)
                dialog.geometry(f'{new_width}x{new_height}+{x}+{y}')
                dialog.after(20, lambda: grow(new_width, new_height, step + 1))
        grow(start_width, start_height)

    def animate_dialog_exit(self, dialog):
        """Smooth exit animation for dialogs"""
        current_width = dialog.winfo_width()
        current_height = dialog.winfo_height()
        
        def shrink(step=0):
            if step < 10:
                scale = 1 - (step / 10)
                new_width = int(current_width * scale)
                new_height = int(current_height * scale)
                x = (dialog.winfo_screenwidth() // 2) - (new_width // 2)
                y = (dialog.winfo_screenheight() // 2) - (new_height // 2)
                dialog.geometry(f'{new_width}x{new_height}+{x}+{y}')
                dialog.after(20, lambda: shrink(step + 1))
        shrink()

    def close_dialog_animated(self, dialog):
        """Close dialog with animation"""
        self.animate_dialog_exit(dialog)
        self.root.after(200, lambda: dialog.destroy())

    def animate_entry_focus(self, entry, focused):
        """Animate entry field on focus"""
        if focused:
            entry.configure(bootstyle="info")
        else:
            entry.configure(bootstyle="default")

    def show_animated_message(self, title, message, msg_type):
        """Show message with animation"""
        if msg_type == "success":
            messagebox.showinfo(title, message)
        elif msg_type == "warning":
            messagebox.showwarning(title, message)
        else:
            messagebox.showerror(title, message)

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
            self.show_animated_message("Success", "✓ Stock updated successfully!", "success")
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
            self.show_animated_message("Low Stock", "✓ No low stock items found!", "success")
            return
        
        # Create animated dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("⚠️ Low Stock Alert")
        dialog.geometry("550x450")
        self.animate_dialog_entrance(dialog, 550, 450)
        
        header_frame = ttk.Frame(dialog, bootstyle="warning")
        header_frame.pack(fill='x', pady=(0, 10))
        
        ttk.Label(
            header_frame,
            text="⚠️ Items Requiring Attention",
            font=('Helvetica', 14, 'bold'),
            bootstyle="inverse-warning"
        ).pack(pady=15)
        
        tree_frame = ttk.Frame(dialog)
        tree_frame.pack(fill='both', expand=True, padx=15, pady=15)
        
        tree = ttk.Treeview(
            tree_frame,
            columns=("Medicine", "Current Qty", "Min Threshold"),
            show='headings',
            height=12,
            bootstyle="warning"
        )
        
        for col in ("Medicine", "Current Qty", "Min Threshold"):
            tree.heading(col, text=col)
            tree.column(col, width=150, anchor='center')
        
        tree.pack(fill='both', expand=True)
        
        # Animate rows
        self.animate_tree_rows(tree, rows, 0)

    def animate_tree_rows(self, tree, rows, index):
        """Animate adding rows to treeview"""
        if index < len(rows):
            r = rows[index]
            tree.insert("", "end", values=r)
            self.root.after(50, lambda: self.animate_tree_rows(tree, rows, index + 1))

    def view_expiring_gui(self):
        cur.execute("SELECT name, expiry_date FROM Medicines WHERE expiry_date < TRUNC(SYSDATE)")
        expired = cur.fetchall()
        
        cur.execute("SELECT name, expiry_date FROM Medicines WHERE expiry_date BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE)+90")
        near = cur.fetchall()
        
        # Custom animated dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("⏰ Expiry Management")
        dialog.geometry("650x550")
        self.animate_dialog_entrance(dialog, 650, 550)
        
        header_frame = ttk.Frame(dialog, bootstyle="danger")
        header_frame.pack(fill='x')
        
        ttk.Label(
            header_frame,
            text="⏰ Medicine Expiry Report",
            font=('Helvetica', 14, 'bold'),
            bootstyle="inverse-danger"
        ).pack(pady=15)
        
        content_frame = ttk.Frame(dialog)
        content_frame.pack(fill='both', expand=True, padx=15, pady=15)
        
        if expired:
            expired_label = ttk.Label(
                content_frame,
                text=f"🔴 EXPIRED ({len(expired)} items)",
                font=('Helvetica', 11, 'bold'),
                bootstyle="danger"
            )
            expired_label.pack(pady=5)
            
            tree1 = ttk.Treeview(
                content_frame,
                columns=("Medicine", "Expiry Date"),
                show='headings',
                height=6,
                bootstyle="danger"
            )
            for col in ("Medicine", "Expiry Date"):
                tree1.heading(col, text=col)
                tree1.column(col, width=275, anchor='center')
            tree1.pack(fill='x', pady=5)
            
            self.animate_tree_rows(tree1, [(r[0], r[1].strftime('%Y-%m-%d')) for r in expired], 0)
        
        if near:
            near_label = ttk.Label(
                content_frame,
                text=f"🟡 EXPIRING SOON ({len(near)} items - next 90 days)",
                font=('Helvetica', 11, 'bold'),
                bootstyle="warning"
            )
            near_label.pack(pady=(15, 5))
            
            tree2 = ttk.Treeview(
                content_frame,
                columns=("Medicine", "Expiry Date"),
                show='headings',
                height=6,
                bootstyle="warning"
            )
            for col in ("Medicine", "Expiry Date"):
                tree2.heading(col, text=col)
                tree2.column(col, width=275, anchor='center')
            tree2.pack(fill='x', pady=5)
            
            self.animate_tree_rows(tree2, [(r[0], r[1].strftime('%Y-%m-%d')) for r in near], 0)
        
        if not expired and not near:
            success_frame = ttk.Frame(content_frame)
            success_frame.pack(expand=True)
            
            ttk.Label(
                success_frame,
                text="✓",
                font=('Helvetica', 48),
                bootstyle="success"
            ).pack()
            
            ttk.Label(
                success_frame,
                text="All medicines are within safe expiry range",
                font=('Helvetica', 11),
                bootstyle="success"
            ).pack(pady=10)

    # ---------------- Enhanced Sales Tab with Animations ----------------
    def build_sales_tab(self):
        frame = self.tab_sales
        
        # Animated Control Panel
        control_card = ttk.LabelFrame(
            frame,
            text="  💰 Sales Operations  ",
            bootstyle="success",
            padding=15
        )
        control_card.pack(fill='x', padx=15, pady=15)
        
        btn_frame = ttk.Frame(control_card)
        btn_frame.pack()
        
        create_btn = ttk.Button(
            btn_frame,
            text="🧾 Create New Invoice",
            command=self.create_invoice_gui,
            bootstyle="success",
            width=25
        )
        create_btn.pack(side='left', padx=10)
        self.add_button_hover_effect(create_btn, "success")
        
        view_btn = ttk.Button(
            btn_frame,
            text="📜 View All Orders",
            command=self.view_orders_gui,
            bootstyle="info-outline",
            width=25
        )
        view_btn.pack(side='left', padx=10)
        self.add_button_hover_effect(view_btn, "info")
        
        # Orders Display with animation
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
        
        # Add hover effects
        self.tree_orders.tag_configure('oddrow', background='#f9f9f9')
        self.tree_orders.tag_configure('evenrow', background='#ffffff')
        self.tree_orders.bind('<Motion>', self.on_orders_hover)

    def on_orders_hover(self, event):
        """Highlight order row on hover"""
        item = self.tree_orders.identify_row(event.y)
        if item:
            self.tree_orders.selection_set(item)

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
            self.show_animated_message("Aborted", "No items selected.", "warning")
            return

        arr_items = cur.arrayvar(cx_Oracle.NUMBER, items)
        arr_qtys = cur.arrayvar(cx_Oracle.NUMBER, qtys)
        try:
            cur.callproc("sp_place_order", [cid, arr_items, arr_qtys])
            self.show_animated_message("Success", "✓ Invoice created successfully!", "success")
            self.view_orders_gui()
            self.update_status("New invoice created")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def view_orders_gui(self):
        self.update_status("Loading orders...")
        
        # Clear with animation
        items = self.tree_orders.get_children()
        self.fade_out_items(items, 0, lambda: self.load_orders_data())

    def load_orders_data(self):
        """Load orders with animation"""
        cur.execute("""
            SELECT o.order_id, c.name, o.order_date, o.total_amount, o.status
            FROM Orders o LEFT JOIN Customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        """)
        rows = cur.fetchall()
        
        self.fade_in_orders(rows, 0)

    def fade_in_orders(self, rows, index):
        """Fade in animation for order items"""
        if index < len(rows):
            r = rows[index]
            tag = 'oddrow' if index % 2 else 'evenrow'
            self.tree_orders.insert("", "end", values=(
                r[0], r[1], r[2].strftime("%Y-%m-%d"), f"₹{r[3]:.2f}", r[4]
            ), tags=(tag,))
            self.root.after(30, lambda: self.fade_in_orders(rows, index + 1))
        else:
            self.update_status(f"✓ Loaded {len(rows)} orders")

    # ---------------- Enhanced Suppliers Tab with Animations ----------------
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
        
        add_btn = ttk.Button(
            btn_frame,
            text="➕ Add Supplier",
            command=self.add_supplier_gui,
            bootstyle="warning",
            width=20
        )
        add_btn.pack(side='left', padx=10)
        self.add_button_hover_effect(add_btn, "warning")
        
        view_btn = ttk.Button(
            btn_frame,
            text="📋 View All Suppliers",
            command=self.view_suppliers_gui,
            bootstyle="info-outline",
            width=20
        )
        view_btn.pack(side='left', padx=10)
        self.add_button_hover_effect(view_btn, "info")
        
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
        
        # Add animations
        self.tree_suppliers.tag_configure('oddrow', background='#f9f9f9')
        self.tree_suppliers.tag_configure('evenrow', background='#ffffff')

    def add_supplier_gui(self):
        name = simpledialog.askstring("Supplier Name", "Enter supplier name:")
        if not name:
            return
        email = simpledialog.askstring("Email", "Enter email address:")
        phone = simpledialog.askstring("Phone", "Enter phone number:")
        
        try:
            cur.execute("INSERT INTO Suppliers(name, contact_email, phone) VALUES(:1,:2,:3)", (name, email, phone))
            con.commit()
            self.show_animated_message("Success", "✓ Supplier added successfully!", "success")
            self.view_suppliers_gui()
            self.update_status("New supplier added")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def view_suppliers_gui(self):
        self.update_status("Loading suppliers...")
        
        items = self.tree_suppliers.get_children()
        self.fade_out_items(items, 0, lambda: self.load_suppliers_data())

    def load_suppliers_data(self):
        """Load suppliers with animation"""
        cur.execute("SELECT supplier_id, name, contact_email, phone, created_at FROM Suppliers")
        rows = cur.fetchall()
        
        self.fade_in_suppliers(rows, 0)

    def fade_in_suppliers(self, rows, index):
        """Fade in animation for supplier items"""
        if index < len(rows):
            r = rows[index]
            tag = 'oddrow' if index % 2 else 'evenrow'
            self.tree_suppliers.insert("", "end", values=(
                r[0], r[1], r[2], r[3], r[4].strftime("%Y-%m-%d %H:%M:%S")
            ), tags=(tag,))
            self.root.after(30, lambda: self.fade_in_suppliers(rows, index + 1))
        else:
            self.update_status(f"✓ Loaded {len(rows)} suppliers")

    # ---------------- Enhanced Reports Tab with Card Animations ----------------
    def build_reports_tab(self):
        frame = self.tab_reports
        
        # Animated header
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
        
        # Create animated report cards
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
            
            # Add card hover effect
            self.add_card_hover_effect(card)
            
            ttk.Label(
                card,
                text=desc,
                font=('Helvetica', 10),
                wraplength=800
            ).pack(pady=10)
            
            report_btn = ttk.Button(
                card,
                text=f"🔍 Generate Report",
                command=command,
                bootstyle=f"{style}-outline",
                width=20
            )
            report_btn.pack()
            self.add_button_hover_effect(report_btn, style)

    def add_card_hover_effect(self, card):
        """Add elevation effect on card hover"""
        def on_enter(e):
            card.configure(padding=22)
        
        def on_leave(e):
            card.configure(padding=20)
        
        card.bind('<Enter>', on_enter)
        card.bind('<Leave>', on_leave)

    def meds_above_avg_gui(self):
        cur.execute("SELECT name, unit_price FROM Medicines WHERE unit_price > (SELECT AVG(unit_price) FROM Medicines)")
        rows = cur.fetchall()
        
        dialog = tk.Toplevel(self.root)
        dialog.title("💰 Premium Medicines Report")
        dialog.geometry("550x450")
        self.animate_dialog_entrance(dialog, 550, 450)
        
        header_frame = ttk.Frame(dialog, bootstyle="info")
        header_frame.pack(fill='x')
        
        ttk.Label(
            header_frame,
            text="💰 Medicines Above Average Price",
            font=('Helvetica', 14, 'bold'),
            bootstyle="inverse-info"
        ).pack(pady=15)
        
        tree_frame = ttk.Frame(dialog)
        tree_frame.pack(fill='both', expand=True, padx=15, pady=15)
        
        tree = ttk.Treeview(
            tree_frame,
            columns=("Medicine", "Price"),
            show='headings',
            height=15,
            bootstyle="info"
        )
        
        tree.heading("Medicine", text="Medicine Name")
        tree.heading("Price", text="Unit Price")
        tree.column("Medicine", width=320, anchor='center')
        tree.column("Price", width=180, anchor='center')
        tree.pack(fill='both', expand=True)
        
        # Animate rows
        self.animate_tree_rows(tree, [(r[0], f"₹{r[1]:.2f}") for r in rows], 0)

    def meds_inventory_any_gui(self):
        cur.execute("""
            SELECT m.name, i.qty
            FROM Medicines m JOIN Inventory i ON m.medicine_id = i.medicine_id
            WHERE i.qty > ANY (SELECT min_threshold FROM Inventory)
        """)
        rows = cur.fetchall()
        
        dialog = tk.Toplevel(self.root)
        dialog.title("📦 Inventory Analysis")
        dialog.geometry("550x450")
        self.animate_dialog_entrance(dialog, 550, 450)
        
        header_frame = ttk.Frame(dialog, bootstyle="success")
        header_frame.pack(fill='x')
        
        ttk.Label(
            header_frame,
            text="📦 Well-Stocked Inventory Items",
            font=('Helvetica', 14, 'bold'),
            bootstyle="inverse-success"
        ).pack(pady=15)
        
        tree_frame = ttk.Frame(dialog)
        tree_frame.pack(fill='both', expand=True, padx=15, pady=15)
        
        tree = ttk.Treeview(
            tree_frame,
            columns=("Medicine", "Quantity"),
            show='headings',
            height=15,
            bootstyle="success"
        )
        
        tree.heading("Medicine", text="Medicine Name")
        tree.heading("Quantity", text="Current Quantity")
        tree.column("Medicine", width=320, anchor='center')
        tree.column("Quantity", width=180, anchor='center')
        tree.pack(fill='both', expand=True)
        
        self.animate_tree_rows(tree, rows, 0)

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
        """Update status bar with animation"""
        self.status_label.config(text=message)
        # Pulse the indicator
        self.status_indicator.config(foreground='#17a2b8')
        self.root.after(200, lambda: self.status_indicator.config(foreground='#28a745'))
        self.root.update_idletasks()


# ---------- Run Enhanced GUI ----------
if __name__ == "__main__":
    root = ttk.Window(themename="cosmo")
    app = PharmacyGUI(root)
    root.mainloop()
