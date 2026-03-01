import asyncio
from sqlalchemy import text
from database import SessionLocal

async def wipe_cases():
    async with SessionLocal() as session:
        # Truncate cases and all dependent tables (case_parties, milestones, notices, etc.)
        await session.execute(text("TRUNCATE TABLE app.cases CASCADE;"))
        await session.commit()
        print("Successfully wiped all old cases from the database.")

asyncio.run(wipe_cases())
