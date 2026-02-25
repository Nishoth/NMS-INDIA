import asyncio
from database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        commands = [
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS first_emi_date DATE;",
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS last_emi_date DATE;",
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS tenure INTEGER;",
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS sec_17_applied VARCHAR;",
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS sec_17_applied_date DATE;",
            "ALTER TABLE app.cases ADD COLUMN IF NOT EXISTS sec_17_received_date DATE;"
        ]
        for cmd in commands:
            await conn.execute(text(cmd))
        print("Database alerted successfully!")

if __name__ == "__main__":
    asyncio.run(main())
