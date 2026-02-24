import asyncio
import asyncpg
import os
from core.security import get_password_hash

async def init_db():
    print("Connecting to postgres to create db...")
    try:
        # connect to default postgres db to create jls_db
        conn = await asyncpg.connect(user='postgres', password='kathir123', host='127.0.0.1', port=5432, database='postgres')
        try:
            await conn.execute('CREATE DATABASE jls_db')
            print("Database jls_db created successfully.")
        except asyncpg.exceptions.DuplicateDatabaseError:
            print("Database jls_db already exists.")
        finally:
            await conn.close()

        print("Connecting to jls_db to run schema...")
        conn = await asyncpg.connect(user='postgres', password='kathir123', host='127.0.0.1', port=5432, database='jls_db')
        
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
            
        await conn.execute(schema_sql)
        print("Schema executed successfully.")

        # Seed default admin user
        admin_email = "admin@jls.in"
        admin_password = get_password_hash("password")
        
        # Check if admin already exists
        admin_exists = await conn.fetchval(
            "SELECT id FROM app.users WHERE email = $1", 
            admin_email
        )
        
        if not admin_exists:
            async with conn.transaction():
                await conn.execute(
                    """
                    INSERT INTO app.users (username, email, password_hash, role, status)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    "admin", admin_email, admin_password, "super_admin", "active"
                )
            print("Default admin seeded successfully.")
        else:
            print("Default admin already exists.")
    except Exception as e:
        print(f"Error initializing DB: {e}")
    finally:
        if 'conn' in locals() and not conn.is_closed():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(init_db())
