import asyncio
from sqlalchemy import text
from database import SessionLocal

async def alter_schema():
    async with SessionLocal() as db:
        try:
            # Case new columns
            alter_case = """
            ALTER TABLE app.cases 
            ADD COLUMN IF NOT EXISTS zone VARCHAR,
            ADD COLUMN IF NOT EXISTS region VARCHAR,
            ADD COLUMN IF NOT EXISTS branch_code VARCHAR,
            ADD COLUMN IF NOT EXISTS branch_name VARCHAR,
            ADD COLUMN IF NOT EXISTS product VARCHAR,
            ADD COLUMN IF NOT EXISTS repossession_status VARCHAR,
            ADD COLUMN IF NOT EXISTS dpd VARCHAR,
            ADD COLUMN IF NOT EXISTS allocation_pos VARCHAR;
            """
            await db.execute(text(alter_case))

            # CaseParty new columns
            alter_party = """
            ALTER TABLE app.case_parties
            ADD COLUMN IF NOT EXISTS residence_address_2 VARCHAR,
            ADD COLUMN IF NOT EXISTS residence_address_3 VARCHAR,
            ADD COLUMN IF NOT EXISTS office_address_1 VARCHAR,
            ADD COLUMN IF NOT EXISTS office_address_2 VARCHAR,
            ADD COLUMN IF NOT EXISTS office_address_3 VARCHAR,
            ADD COLUMN IF NOT EXISTS city VARCHAR,
            ADD COLUMN IF NOT EXISTS state VARCHAR,
            ADD COLUMN IF NOT EXISTS postal_code VARCHAR,
            ADD COLUMN IF NOT EXISTS phone_2 VARCHAR;
            """
            await db.execute(text(alter_party))

            await db.commit()
            print("Successfully altered database schemas to add new Excel columns!")
        except Exception as e:
            await db.rollback()
            print(f"Failed to alter schemas: {str(e)}")

if __name__ == "__main__":
    asyncio.run(alter_schema())
