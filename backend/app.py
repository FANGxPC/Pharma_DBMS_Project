from flask import Flask, jsonify, request
from flask_cors import CORS
import oracledb as cx_Oracle
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DB_USER = os.getenv('DB_USER', 'system')
DB_PASS = os.getenv('DB_PASS', 'root')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '1521')
DB_SERVICE = os.getenv('DB_SERVICE', 'xepdb1')

# Validation patterns
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[\d\+\-\s\(\)]{7,25}$")

def get_db_connection():
    """Create and return a database connection"""
    try:
        dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, service_name=DB_SERVICE)
        connection = cx_Oracle.connect(user=DB_USER, password=DB_PASS, dsn=dsn)
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def try_execute(cursor, sql, binds=None, silent_on_exists=False):
    """Helper function to execute SQL safely"""
    try:
        if binds:
            cursor.execute(sql, binds)
        else:
            cursor.execute(sql)
        return True
    except Exception as e:
        msg = str(e).lower()
        if silent_on_exists and ("already exists" in msg or "ora-00955" in msg):
            return True
        else:
            print(f"SQL Error: {e}")
            return False

# ==================== INVENTORY ROUTES ====================

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Get all inventory items"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        cursor = conn.cursor()
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        
        # Check if is_active column exists
        has_is_active = False
        try:
            cursor.execute("""
                SELECT column_name 
                FROM user_tab_columns 
                WHERE table_name = 'MEDICINES' 
                AND column_name = 'IS_ACTIVE'
            """)
            has_is_active = cursor.fetchone() is not None
        except:
            pass
        
        # Build query based on whether is_active exists
        if has_is_active and include_inactive:
            query = """
                SELECT m.medicine_id, 
                       NVL(m.name,'') AS name,
                       NVL(m.pharma_form,'') AS pharma_form,
                       NVL(m.strength,'') AS strength,
                       NVL(m.unit_price,0) AS unit_price,
                       NVL(i.qty,0) AS qty,
                       m.expiry_date,
                       NVL(m.is_active,'Y') AS is_active,
                       m.supplier_id
                FROM Medicines m 
                LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
            """
        elif has_is_active:
            query = """
                SELECT m.medicine_id, 
                       NVL(m.name,'') AS name,
                       NVL(m.pharma_form,'') AS pharma_form,
                       NVL(m.strength,'') AS strength,
                       NVL(m.unit_price,0) AS unit_price,
                       NVL(i.qty,0) AS qty,
                       m.expiry_date,
                       NVL(m.is_active,'Y') AS is_active,
                       m.supplier_id
                FROM Medicines m 
                LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
                WHERE NVL(m.is_active,'Y') = 'Y'
            """
        else:
            query = """
                SELECT m.medicine_id, 
                       NVL(m.name,'') AS name,
                       NVL(m.pharma_form,'') AS pharma_form,
                       NVL(m.strength,'') AS strength,
                       NVL(m.unit_price,0) AS unit_price,
                       NVL(i.qty,0) AS qty,
                       m.expiry_date,
                       'Y' AS is_active,
                       m.supplier_id
                FROM Medicines m 
                LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
            """
        cursor.execute(query)
        
        columns = [col[0].lower() for col in cursor.description]
        rows = cursor.fetchall()
        
        inventory = []
        for row in rows:
            item = dict(zip(columns, row))
            if item.get('expiry_date') and item['expiry_date'] is not None:
                try:
                    item['expiry_date'] = item['expiry_date'].strftime('%Y-%m-%d')
                except:
                    item['expiry_date'] = str(item['expiry_date'])
            else:
                item['expiry_date'] = None
            
            if item.get('unit_price') is not None:
                item['unit_price'] = float(item['unit_price'])
            if item.get('qty') is not None:
                item['qty'] = int(item['qty'])
                
            inventory.append(item)
        
        return jsonify(inventory)
    except Exception as e:
        print(f"Error in get_inventory: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/inventory/low-stock', methods=['GET'])
def get_low_stock():
    """Get low stock items"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT m.medicine_id, m.name, i.qty, i.min_threshold
            FROM Inventory i 
            JOIN Medicines m ON i.medicine_id = m.medicine_id
            WHERE NVL(i.qty,0) <= NVL(i.min_threshold,10)
            ORDER BY i.qty ASC
        """
        cursor.execute(query)
        columns = [col[0].lower() for col in cursor.description]
        rows = cursor.fetchall()
        
        low_stock = [dict(zip(columns, row)) for row in rows]
        
        cursor.close()
        conn.close()
        return jsonify(low_stock)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/expiring', methods=['GET'])
def get_expiring_medicines():
    """Get expired and near-expiry medicines"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Get expired medicines
        cursor.execute("""
            SELECT medicine_id, name, expiry_date 
            FROM Medicines 
            WHERE expiry_date < TRUNC(SYSDATE)
        """)
        expired = []
        for row in cursor.fetchall():
            expired.append({
                'medicine_id': row[0],
                'name': row[1],
                'expiry_date': row[2].strftime('%Y-%m-%d') if row[2] else None
            })
        
        # Get near-expiry medicines (within 90 days)
        cursor.execute("""
            SELECT medicine_id, name, expiry_date 
            FROM Medicines 
            WHERE expiry_date BETWEEN TRUNC(SYSDATE) AND TRUNC(SYSDATE)+90
        """)
        near_expiry = []
        for row in cursor.fetchall():
            near_expiry.append({
                'medicine_id': row[0],
                'name': row[1],
                'expiry_date': row[2].strftime('%Y-%m-%d') if row[2] else None
            })
        
        cursor.close()
        conn.close()
        return jsonify({
            'expired': expired,
            'near_expiry': near_expiry
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/medicine', methods=['POST'])
def add_medicine():
    """Add a new medicine"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check for duplicates
        cursor.execute("""
            SELECT medicine_id FROM Medicines
            WHERE LOWER(name)=LOWER(:1)
              AND LOWER(pharma_form)=LOWER(:2)
              AND LOWER(strength)=LOWER(:3)
              AND TO_CHAR(expiry_date,'YYYY-MM-DD')=:4
        """, (data['name'], data['form'], data['strength'], data['expiry_date']))
        
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Medicine already exists'}), 400
        
        # Insert medicine
        cursor.execute("""
            INSERT INTO Medicines (name, pharma_form, strength, unit_price, supplier_id, expiry_date)
            VALUES (:1, :2, :3, :4, :5, TO_DATE(:6,'YYYY-MM-DD'))
        """, (data['name'], data['form'], data['strength'], 
              data.get('price', 0), data.get('supplier_id'), data['expiry_date']))
        
        conn.commit()
        
        # Get the new medicine ID
        cursor.execute("""
            SELECT medicine_id FROM Medicines
            WHERE LOWER(name)=LOWER(:1)
              AND LOWER(pharma_form)=LOWER(:2)
              AND LOWER(strength)=LOWER(:3)
              AND TO_CHAR(expiry_date,'YYYY-MM-DD')=:4
            ORDER BY medicine_id DESC FETCH FIRST 1 ROWS ONLY
        """, (data['name'], data['form'], data['strength'], data['expiry_date']))
        
        medicine_id = cursor.fetchone()[0]
        
        # Insert into inventory
        cursor.execute("""
            INSERT INTO Inventory (medicine_id, qty, min_threshold) 
            VALUES (:1, :2, :3)
        """, (medicine_id, data.get('quantity', 0), 10))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Medicine added successfully', 'medicine_id': medicine_id}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/stock', methods=['PUT'])
def update_stock():
    """Update medicine stock"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Inventory 
            SET qty = NVL(qty,0) + :1 
            WHERE medicine_id = :2
        """, (data['quantity'], data['medicine_id']))
        
        if cursor.rowcount == 0:
            cursor.execute("""
                INSERT INTO Inventory(medicine_id, qty, min_threshold) 
                VALUES(:1, :2, :3)
            """, (data['medicine_id'], data['quantity'], 10))
        
        # Add audit log
        cursor.execute("""
            INSERT INTO Audit_Log(action_by, action, object_name, details) 
            VALUES(USER,'UPDATE','INVENTORY','Medicine '||:1||' qty change '||:2)
        """, (data['medicine_id'], data['quantity']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Stock updated successfully'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/retire/<int:medicine_id>', methods=['PUT'])
def retire_medicine(medicine_id):
    """Retire a medicine (mark as inactive)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if medicine exists
        cursor.execute("SELECT name FROM Medicines WHERE medicine_id = :1", (medicine_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Medicine not found'}), 404
        
        # Zero inventory
        cursor.execute("UPDATE Inventory SET qty = 0 WHERE medicine_id = :1", (medicine_id,))
        
        # Mark inactive
        cursor.execute("""
            UPDATE Medicines 
            SET is_active = 'N', retired_at = SYSTIMESTAMP 
            WHERE medicine_id = :1
        """, (medicine_id,))
        
        # Audit log
        cursor.execute("""
            INSERT INTO Audit_Log(action_by, action, object_name, details) 
            VALUES(USER, 'RETIRE', 'MEDICINES', 'Retired medicine ' || :1)
        """, (medicine_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Medicine retired successfully'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/restore/<int:medicine_id>', methods=['PUT'])
def restore_medicine(medicine_id):
    """Restore a retired medicine"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE Medicines 
            SET is_active = 'Y', retired_at = NULL 
            WHERE medicine_id = :1
        """, (medicine_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Medicine not found'}), 404
        
        cursor.execute("""
            INSERT INTO Audit_Log(action_by, action, object_name, details) 
            VALUES(USER, 'RESTORE', 'MEDICINES', 'Restored medicine ' || :1)
        """, (medicine_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Medicine restored successfully'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ORDERS ROUTES ====================

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders with items"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT o.order_id, o.order_date, c.name as customer_name, 
                   o.total_amount, o.status, o.customer_id
            FROM Orders o 
            LEFT JOIN Customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        """
        cursor.execute(query)
        columns = [col[0].lower() for col in cursor.description]
        rows = cursor.fetchall()
        
        orders = []
        for row in rows:
            order = dict(zip(columns, row))
            if order.get('order_date'):
                order['order_date'] = order['order_date'].strftime('%Y-%m-%d')
            
            # Get order items
            cursor.execute("""
                SELECT oi.medicine_id, m.name as medicine_name, 
                       oi.quantity, oi.unit_price, oi.line_total
                FROM Order_Items oi
                JOIN Medicines m ON oi.medicine_id = m.medicine_id
                WHERE oi.order_id = :1
            """, (order['order_id'],))
            
            items = []
            for item_row in cursor.fetchall():
                items.append({
                    'medicine_id': item_row[0],
                    'medicine_name': item_row[1],
                    'quantity': item_row[2],
                    'unit_price': float(item_row[3]) if item_row[3] else 0,
                    'line_total': float(item_row[4]) if item_row[4] else 0
                })
            
            order['items'] = items
            orders.append(order)
        
        cursor.close()
        conn.close()
        return jsonify(orders)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Get Oracle type for collections
        odci_type = conn.gettype("SYS.ODCINUMBERLIST")
        
        oracle_items = odci_type.newobject()
        oracle_items.extend(data['items'])
        
        oracle_qtys = odci_type.newobject()
        oracle_qtys.extend(data['quantities'])
        
        # Call stored procedure
        cursor.callproc("sp_place_order", [data['customer_id'], oracle_items, oracle_qtys])
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Order placed successfully'}), 201
    except cx_Oracle.DatabaseError as e:
        error_obj, = e.args
        error_message = error_obj.message.strip()
        
        if "ORA-20061" in error_message:
            return jsonify({'error': 'Cannot sell expired medicine'}), 400
        elif "ORA-20062" in error_message:
            return jsonify({'error': 'Insufficient stock'}), 400
        else:
            return jsonify({'error': str(error_message)}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== SUPPLIER ROUTES ====================

@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    """Get all suppliers"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = "SELECT supplier_id, name, contact_email, phone, created_at FROM Suppliers ORDER BY name"
        cursor.execute(query)
        columns = [col[0].lower() for col in cursor.description]
        rows = cursor.fetchall()
        
        suppliers = []
        for row in rows:
            supplier = dict(zip(columns, row))
            if supplier.get('created_at'):
                supplier['created_at'] = supplier['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            suppliers.append(supplier)
        
        cursor.close()
        conn.close()
        return jsonify(suppliers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    """Add a new supplier"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Validate input
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400
        
        if not EMAIL_RE.match(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if not data.get('phone'):
            return jsonify({'error': 'Phone is required'}), 400
        
        if not PHONE_RE.match(data['phone']):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        # Check for duplicates
        cursor.execute("""
            SELECT supplier_id FROM Suppliers
            WHERE LOWER(name) = LOWER(:1)
              OR LOWER(contact_email) = LOWER(:2)
              OR phone = :3
        """, (data['name'], data['email'], data['phone']))
        
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Supplier already exists'}), 400
        
        cursor.execute("""
            INSERT INTO Suppliers(name, contact_email, phone) 
            VALUES(:1, :2, :3)
        """, (data['name'], data['email'], data['phone']))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Supplier added successfully'}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/suppliers/performance', methods=['GET'])
def supplier_performance():
    """Get supplier performance metrics"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT s.supplier_id, s.name, 
                   COUNT(m.medicine_id) as meds_count, 
                   AVG(m.unit_price) as avg_price, 
                   MAX(m.unit_price) as max_price
            FROM Suppliers s 
            LEFT JOIN Medicines m ON s.supplier_id = m.supplier_id
            GROUP BY s.supplier_id, s.name
            ORDER BY meds_count DESC
        """
        cursor.execute(query)
        
        performance = []
        for row in cursor.fetchall():
            performance.append({
                'supplier_id': row[0],
                'name': row[1],
                'medicines_count': row[2],
                'avg_price': float(row[3]) if row[3] else 0,
                'max_price': float(row[4]) if row[4] else 0
            })
        
        cursor.close()
        conn.close()
        return jsonify(performance)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CUSTOMER ROUTES ====================

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = "SELECT customer_id, name, phone, email, address, created_at FROM Customers ORDER BY name"
        cursor.execute(query)
        columns = [col[0].lower() for col in cursor.description]
        rows = cursor.fetchall()
        
        customers = []
        for row in rows:
            customer = dict(zip(columns, row))
            if customer.get('created_at'):
                customer['created_at'] = customer['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            customers.append(customer)
        
        cursor.close()
        conn.close()
        return jsonify(customers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers', methods=['POST'])
def add_customer():
    """Add a new customer"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Validate phone if provided
        if data.get('phone') and not PHONE_RE.match(data['phone']):
            return jsonify({'error': 'Invalid phone format'}), 400
        
        cursor.execute("""
            INSERT INTO Customers(name, phone, email, address) 
            VALUES(:1, :2, :3, :4)
        """, (data['name'], data.get('phone'), data.get('email'), data.get('address')))
        
        conn.commit()
        
        # Get the new customer ID
        cursor.execute("""
            SELECT customer_id FROM Customers 
            WHERE ROWID = (SELECT MAX(ROWID) FROM Customers)
        """)
        customer_id = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Customer added successfully', 'customer_id': customer_id}), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== REPORTS ROUTES ====================

@app.route('/api/reports/sales-summary', methods=['GET'])
def sales_summary():
    """Get daily sales summary"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        days = request.args.get('days', 7, type=int)
        
        query = """
            SELECT TRUNC(order_date) sale_date, COUNT(*) orders, 
                   SUM(total_amount) total_sales, AVG(total_amount) avg_order
            FROM Orders
            WHERE order_date >= TRUNC(SYSDATE) - :1
            GROUP BY TRUNC(order_date)
            ORDER BY TRUNC(order_date) DESC
        """
        cursor.execute(query, (days,))
        
        summary = []
        for row in cursor.fetchall():
            summary.append({
                'sale_date': row[0].strftime('%Y-%m-%d'),
                'orders': row[1],
                'total_sales': float(row[2]) if row[2] else 0,
                'avg_order': float(row[3]) if row[3] else 0
            })
        
        cursor.close()
        conn.close()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/above-average-price', methods=['GET'])
def medicines_above_avg():
    """Get medicines priced above average"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT medicine_id, name, unit_price 
            FROM Medicines 
            WHERE unit_price > (SELECT AVG(unit_price) FROM Medicines)
            ORDER BY unit_price DESC
        """
        cursor.execute(query)
        
        medicines = []
        for row in cursor.fetchall():
            medicines.append({
                'medicine_id': row[0],
                'name': row[1],
                'unit_price': float(row[2]) if row[2] else 0
            })
        
        cursor.close()
        conn.close()
        return jsonify(medicines)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/inventory-any-threshold', methods=['GET'])
def meds_inventory_any():
    """Get medicines with inventory greater than ANY min_threshold"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT m.medicine_id, m.name, i.qty, i.min_threshold
            FROM Medicines m 
            JOIN Inventory i ON m.medicine_id = i.medicine_id
            WHERE i.qty > ANY (SELECT min_threshold FROM Inventory)
            ORDER BY m.name
        """
        cursor.execute(query)
        
        medicines = []
        for row in cursor.fetchall():
            medicines.append({
                'medicine_id': row[0],
                'name': row[1],
                'quantity': row[2],
                'min_threshold': row[3]
            })
        
        cursor.close()
        conn.close()
        return jsonify(medicines)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/union-intersect', methods=['GET'])
def union_intersect_demo():
    """Demonstrate UNION and INTERSECT operations"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # UNION: unique names from Suppliers and Customers
        cursor.execute("SELECT name FROM Suppliers UNION SELECT name FROM Customers")
        union_results = [row[0] for row in cursor.fetchall()]
        
        # INTERSECT: common names in both Suppliers and Customers
        cursor.execute("SELECT name FROM Suppliers INTERSECT SELECT name FROM Customers")
        intersect_results = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'union_unique_names': union_results,
            'intersect_common_names': intersect_results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/audit-log', methods=['GET'])
def get_audit_log():
    """Get audit log entries"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        limit = request.args.get('limit', 50, type=int)
        
        query = """
            SELECT audit_id, action_by, action, object_name, details, action_time 
            FROM Audit_Log 
            ORDER BY action_time DESC
        """
        cursor.execute(query)
        rows = cursor.fetchmany(limit)
        
        logs = []
        for row in rows:
            logs.append({
                'audit_id': row[0],
                'action_by': row[1],
                'action': row[2],
                'object_name': row[3],
                'details': row[4],
                'action_time': row[5].strftime('%Y-%m-%d %H:%M:%S') if row[5] else None
            })
        
        cursor.close()
        conn.close()
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN/MAINTENANCE ROUTES ====================

@app.route('/api/admin/setup-schema', methods=['POST'])
def setup_schema():
    """Initialize database schema"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Create tables
        tables = [
            """
            CREATE TABLE Suppliers (
                supplier_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                name VARCHAR2(120) NOT NULL,
                contact_email VARCHAR2(120) NOT NULL,
                phone VARCHAR2(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_supplier_entry UNIQUE (name,contact_email,phone)
            )
            """,
            """
            CREATE TABLE Customers (
                customer_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                name VARCHAR2(120) NOT NULL,
                phone VARCHAR2(20),
                email VARCHAR2(120),
                address VARCHAR2(300),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE Medicines (
                medicine_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                name VARCHAR2(200) NOT NULL,
                pharma_form VARCHAR2(50),
                strength VARCHAR2(50),
                unit_price NUMBER(10,2) DEFAULT 0,
                supplier_id NUMBER,
                expiry_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y','N')),
                retired_at TIMESTAMP NULL,
                CONSTRAINT fk_med_supplier FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id),
                CONSTRAINT unique_medicine_entry UNIQUE (name, pharma_form, strength, expiry_date)
            )
            """,
            """
            CREATE TABLE Inventory (
                medicine_id NUMBER PRIMARY KEY,
                qty NUMBER DEFAULT 0,
                min_threshold NUMBER DEFAULT 10,
                CONSTRAINT fk_inv_med FOREIGN KEY(medicine_id) REFERENCES Medicines(medicine_id)
            )
            """,
            """
            CREATE TABLE Orders (
                order_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                order_date DATE DEFAULT SYSDATE,
                customer_id NUMBER,
                total_amount NUMBER(12,2),
                status VARCHAR2(20),
                CONSTRAINT fk_ord_cust FOREIGN KEY(customer_id) REFERENCES Customers(customer_id)
            )
            """,
            """
            CREATE TABLE Order_Items (
                order_item_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                order_id NUMBER,
                medicine_id NUMBER,
                quantity NUMBER,
                unit_price NUMBER(10,2),
                line_total NUMBER(12,2),
                CONSTRAINT fk_oi_order FOREIGN KEY(order_id) REFERENCES Orders(order_id)
            )
            """,
            """
            CREATE TABLE Audit_Log (
                audit_id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                action_by VARCHAR2(100),
                action VARCHAR2(100),
                object_name VARCHAR2(100),
                details VARCHAR2(2000),
                action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        ]
        
        for table_sql in tables:
            try_execute(cursor, table_sql, silent_on_exists=True)
        
        # Add price constraint
        try:
            cursor.execute("ALTER TABLE Medicines ADD (CONSTRAINT chk_price_nonneg CHECK (unit_price >= 0))")
        except:
            pass  # ignore if exists
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Schema setup completed successfully'}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/create-triggers', methods=['POST'])
def create_triggers():
    """Create database triggers"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        triggers = [
            """
            CREATE OR REPLACE TRIGGER trg_med_before_ins
            BEFORE INSERT OR UPDATE ON Medicines
            FOR EACH ROW
            DECLARE
            BEGIN
                IF :NEW.expiry_date IS NOT NULL AND :NEW.expiry_date < TRUNC(SYSDATE) THEN
                    DBMS_OUTPUT.PUT_LINE('Warning: Medicine "' || :NEW.name || 
                                 '" has an expired date (' || TO_CHAR(:NEW.expiry_date, 'YYYY-MM-DD') || ').');
                END IF;
            END;
            """,
            """
            CREATE OR REPLACE TRIGGER trg_audit_orders
            AFTER INSERT OR UPDATE OR DELETE ON Orders
            FOR EACH ROW
            BEGIN
                IF INSERTING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'INSERT','ORDERS','Order placed or inserted');
                ELSIF UPDATING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'UPDATE','ORDERS','Order updated');
                ELSIF DELETING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'DELETE','ORDERS','Order deleted');
                END IF;
            END;
            """,
            """
            CREATE OR REPLACE TRIGGER trg_audit_medicines
            AFTER INSERT OR UPDATE OR DELETE ON Medicines
            FOR EACH ROW
            BEGIN
                IF INSERTING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'INSERT','MEDICINES','Inserted ' || :NEW.name);
                ELSIF UPDATING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'UPDATE','MEDICINES','Updated ' || :NEW.name);
                ELSIF DELETING THEN
                    INSERT INTO Audit_Log(action_by, action, object_name, details) VALUES(USER,'DELETE','MEDICINES','Deleted ' || :OLD.name);
                END IF;
            END;
            """
        ]
        
        for trigger_sql in triggers:
            try_execute(cursor, trigger_sql)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Triggers created successfully'}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/create-procedures', methods=['POST'])
def create_procedures():
    """Create stored procedures"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        procedure_sql = """
        CREATE OR REPLACE PROCEDURE sp_place_order (
            p_customer_id IN NUMBER,
            p_items       IN "SYS"."ODCINUMBERLIST",
            p_qtys        IN "SYS"."ODCINUMBERLIST"
        ) IS
            v_unit_price   NUMBER(10,2);
            v_total        NUMBER(12,2) := 0;
            v_line_total   NUMBER(12,2);
            v_order_id     NUMBER;
            v_stock        NUMBER;
            v_expiry       DATE;
        BEGIN
            IF p_items.COUNT != p_qtys.COUNT THEN
                RAISE_APPLICATION_ERROR(-20060, 'Items and quantities length mismatch');
            END IF;

            FOR i IN 1 .. p_items.COUNT LOOP
                BEGIN
                    SELECT unit_price, expiry_date
                    INTO v_unit_price, v_expiry
                    FROM Medicines
                    WHERE medicine_id = p_items(i);
                EXCEPTION
                    WHEN NO_DATA_FOUND THEN
                        RAISE_APPLICATION_ERROR(-20063, 'Medicine not found: ' || p_items(i));
                END;

                IF v_expiry IS NOT NULL AND v_expiry < TRUNC(SYSDATE) THEN
                    RAISE_APPLICATION_ERROR(-20061, 'Cannot sell expired medicine id ' || p_items(i));
                END IF;

                BEGIN
                    SELECT qty INTO v_stock
                    FROM Inventory
                    WHERE medicine_id = p_items(i)
                    FOR UPDATE;
                EXCEPTION
                    WHEN NO_DATA_FOUND THEN
                        RAISE_APPLICATION_ERROR(-20064, 'Inventory row not found for medicine id ' || p_items(i));
                END;

                IF v_stock < p_qtys(i) THEN
                    RAISE_APPLICATION_ERROR(-20062, 'Insufficient stock for medicine id ' || p_items(i));
                END IF;

                v_line_total := v_unit_price * p_qtys(i);
                v_total := v_total + v_line_total;
            END LOOP;

            INSERT INTO Orders (customer_id, total_amount, status)
            VALUES (p_customer_id, v_total, 'COMPLETED')
            RETURNING order_id INTO v_order_id;

            FOR i IN 1 .. p_items.COUNT LOOP
                SELECT unit_price INTO v_unit_price FROM Medicines WHERE medicine_id = p_items(i);

                INSERT INTO Order_Items (order_id, medicine_id, quantity, unit_price, line_total)
                VALUES (v_order_id, p_items(i), p_qtys(i), v_unit_price, v_unit_price * p_qtys(i));

                UPDATE Inventory
                SET qty = qty - p_qtys(i)
                WHERE medicine_id = p_items(i);
            END LOOP;

            INSERT INTO Audit_Log (action_by, action, object_name, details)
            VALUES (USER, 'PROC', 'sp_place_order', 'Order ' || v_order_id || ' placed for customer ' || NVL(TO_CHAR(p_customer_id),'UNKNOWN'));

            COMMIT;
        EXCEPTION
            WHEN OTHERS THEN
                ROLLBACK;
                RAISE;
        END sp_place_order;
        """
        
        try_execute(cursor, procedure_sql)
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Stored procedures created successfully'}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/create-views', methods=['POST'])
def create_views():
    """Create database views"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        view_sql = """
        CREATE OR REPLACE VIEW vw_inventory_summary AS
            SELECT m.medicine_id,
                   NVL(m.name,'') AS name,
                   NVL(m.pharma_form,'') AS pharma_form,
                   NVL(m.strength,'') AS strength,
                   NVL(m.unit_price,0) AS unit_price,
                   NVL(i.qty,0) AS qty,
                   m.expiry_date,
                   NVL(m.is_active,'Y') AS is_active
            FROM Medicines m LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
        """
        
        try_execute(cursor, view_sql)
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Views created successfully'}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/seed-data', methods=['POST'])
def seed_data():
    """Seed sample data"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Suppliers
        suppliers = [
            ("Cipla Ltd.", "sales@cipla.com", "+91-9876543210"),
            ("Sun Pharma", "support@sunpharma.com", "+91-9123456780")
        ]
        
        for name, email, phone in suppliers:
            cursor.execute("""
                SELECT supplier_id FROM Suppliers
                WHERE LOWER(name) = LOWER(:1)
                   OR LOWER(contact_email) = LOWER(:2)
                   OR phone = :3
            """, (name, email, phone))
            if not cursor.fetchone():
                try_execute(cursor, "INSERT INTO Suppliers(name, contact_email, phone) VALUES(:1,:2,:3)",
                           (name, email, phone))
        
        conn.commit()
        
        # Customers
        cursor.execute("""
            SELECT customer_id FROM Customers
            WHERE LOWER(name) = LOWER(:1)
               OR LOWER(email) = LOWER(:2)
        """, ("John Doe", "john@example.com"))
        if not cursor.fetchone():
            try_execute(cursor, "INSERT INTO Customers(name, phone, email, address) VALUES(:1,:2,:3,:4)",
                       ("John Doe", "9998887776", "john@example.com", "23 Green Street, Vellore"))
        
        # Medicines
        medicines = [
            ("Paracetamol", "Tablet", "500 mg", 2.50, 1, "2026-02-15"),
            ("Amoxicillin", "Capsule", "250 mg", 5.00, 2, "2025-12-01"),
            ("OldSyrup", "Syrup", "100 ml", 40.00, 2, "2020-01-01")
        ]
        
        for name, form, strength, price, sup, expiry in medicines:
            cursor.execute("""
                SELECT medicine_id FROM Medicines
                WHERE LOWER(name) = LOWER(:1)
                  AND LOWER(pharma_form) = LOWER(:2)
                  AND LOWER(strength) = LOWER(:3)
                  AND TO_CHAR(expiry_date, 'YYYY-MM-DD') = :4
            """, (name, form, strength, expiry))
            if not cursor.fetchone():
                try_execute(cursor, """
                    INSERT INTO Medicines(name, pharma_form, strength, unit_price, supplier_id, expiry_date)
                    VALUES(:1,:2,:3,:4,:5,TO_DATE(:6,'YYYY-MM-DD'))
                """, (name, form, strength, price, sup, expiry))
        
        conn.commit()
        
        # Inventory
        cursor.execute("SELECT medicine_id FROM Medicines")
        meds = [r[0] for r in cursor.fetchall()]
        for mid in meds:
            cursor.execute("SELECT 1 FROM Inventory WHERE medicine_id = :1", (mid,))
            if not cursor.fetchone():
                try_execute(cursor, "INSERT INTO Inventory(medicine_id, qty, min_threshold) VALUES(:1, :2, :3)",
                           (mid, 50, 10))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Sample data seeded successfully'}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/cleanup', methods=['POST'])
def cleanup_db():
    """Cleanup database objects (DANGEROUS - for development only)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Get confirmation from request body
        data = request.json or {}
        if not data.get('confirm'):
            return jsonify({'error': 'Confirmation required. Send {"confirm": true} in request body.'}), 400
        
        stmts = [
            "DROP TRIGGER trg_audit_medicines",
            "DROP TRIGGER trg_audit_orders",
            "DROP TRIGGER trg_med_before_ins",
            "DROP PROCEDURE sp_place_order",
            "DROP VIEW vw_inventory_summary",
            "DROP TABLE Order_Items CASCADE CONSTRAINTS",
            "DROP TABLE Orders CASCADE CONSTRAINTS",
            "DROP TABLE Inventory CASCADE CONSTRAINTS",
            "DROP TABLE Medicines CASCADE CONSTRAINTS",
            "DROP TABLE Customers CASCADE CONSTRAINTS",
            "DROP TABLE Suppliers CASCADE CONSTRAINTS",
            "DROP TABLE Audit_Log CASCADE CONSTRAINTS"
        ]
        
        results = []
        for s in stmts:
            try:
                cursor.execute(s)
                results.append(f"Dropped: {s}")
            except Exception as e:
                results.append(f"Could not drop: {s} -> {str(e)}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Cleanup attempted', 'results': results}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Medicines")
            med_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM Suppliers")
            sup_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM Customers")
            cust_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM Orders")
            order_count = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            return jsonify({
                'status': 'healthy', 
                'database': 'connected',
                'medicines_count': med_count,
                'suppliers_count': sup_count,
                'customers_count': cust_count,
                'orders_count': order_count
            })
        except Exception as e:
            if conn:
                conn.close()
            return jsonify({
                'status': 'unhealthy', 
                'database': 'connected but error',
                'error': str(e)
            }), 500
    return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

@app.route('/api/debug/tables', methods=['GET'])
def debug_tables():
    """Debug endpoint to check what tables exist"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM user_tables 
            ORDER BY table_name
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT view_name 
            FROM user_views 
            ORDER BY view_name
        """)
        views = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'tables': tables,
            'views': views
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)