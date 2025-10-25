#!/usr/bin/env python3
"""
Quick script to add missing is_active column to Medicines table
and recreate the view
"""

import oracledb as cx_Oracle

# Database configuration
DB_USER = "system"
DB_PASS = "root"
DB_HOST = "localhost"
DB_PORT = "1521"
DB_SERVICE = "xepdb1"

def main():
    print("Connecting to database...")
    dsn = cx_Oracle.makedsn(DB_HOST, DB_PORT, service_name=DB_SERVICE)
    conn = cx_Oracle.connect(user=DB_USER, password=DB_PASS, dsn=dsn)
    cursor = conn.cursor()
    
    print("\n1. Checking if is_active column exists...")
    cursor.execute("""
        SELECT column_name 
        FROM user_tab_columns 
        WHERE table_name = 'MEDICINES' 
        AND column_name = 'IS_ACTIVE'
    """)
    
    if cursor.fetchone():
        print("   ✓ is_active column already exists")
    else:
        print("   Adding is_active column...")
        try:
            cursor.execute("""
                ALTER TABLE Medicines ADD (
                    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y','N')),
                    retired_at TIMESTAMP NULL
                )
            """)
            conn.commit()
            print("   ✓ is_active column added successfully")
        except Exception as e:
            print(f"   ✗ Error adding column: {e}")
    
    print("\n2. Recreating view vw_inventory_summary...")
    try:
        cursor.execute("DROP VIEW vw_inventory_summary")
        print("   Dropped old view")
    except:
        print("   No existing view to drop")
    
    try:
        cursor.execute("""
            CREATE VIEW vw_inventory_summary AS
            SELECT m.medicine_id,
                   NVL(m.name,'') AS name,
                   NVL(m.pharma_form,'') AS pharma_form,
                   NVL(m.strength,'') AS strength,
                   NVL(m.unit_price,0) AS unit_price,
                   NVL(i.qty,0) AS qty,
                   m.expiry_date,
                   NVL(m.is_active,'Y') AS is_active
            FROM Medicines m 
            LEFT JOIN Inventory i ON m.medicine_id = i.medicine_id
        """)
        conn.commit()
        print("   ✓ View created successfully")
    except Exception as e:
        print(f"   ✗ Error creating view: {e}")
    
    print("\n3. Testing the view...")
    try:
        cursor.execute("SELECT COUNT(*) FROM vw_inventory_summary")
        count = cursor.fetchone()[0]
        print(f"   ✓ View works! Found {count} medicines")
    except Exception as e:
        print(f"   ✗ View test failed: {e}")
    
    print("\n4. Listing all medicines...")
    try:
        cursor.execute("""
            SELECT medicine_id, name, qty, expiry_date, is_active 
            FROM vw_inventory_summary 
            WHERE ROWNUM <= 5
        """)
        print("   " + "-" * 70)
        print(f"   {'ID':<6} {'Name':<30} {'Qty':<6} {'Expiry':<12} {'Active':<6}")
        print("   " + "-" * 70)
        for row in cursor.fetchall():
            print(f"   {row[0]:<6} {row[1]:<30} {row[2]:<6} {str(row[3]):<12} {row[4]:<6}")
    except Exception as e:
        print(f"   ✗ Error listing medicines: {e}")
    
    cursor.close()
    conn.close()
    print("\n✓ Done! Your database is ready.")
    print("\nNow restart your Flask server (Ctrl+C and run again)")

if __name__ == "__main__":
    main()
