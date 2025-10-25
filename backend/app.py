from flask import Flask, jsonify, request
from flask_cors import CORS
import oracledb as cx_Oracle
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DB_USER = os.getenv('DB_USER', 'system')
DB_PASS = os.getenv('DB_PASS', 'root')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '1521')
DB_SERVICE = os.getenv('DB_SERVICE', 'xepdb1')

def get_db_connection():
    """Create and return a database connection"""
    try:
        dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, service_name=DB_SERVICE)
        connection = cx_Oracle.connect(user=DB_USER, password=DB_PASS, dsn=dsn)
        return connection
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

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
        
        # This would run your schema setup
        # For safety, you might want to add authentication here
        
        cursor.close()
        conn.close()
        return jsonify({'message': 'Schema setup completed'}), 200
    except Exception as e:
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