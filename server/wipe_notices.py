import asyncio
from sqlalchemy import text
from database import SessionLocal

async def wipe_notices():
    async with SessionLocal() as session:
        # Truncate notices and all dependent tables (notice_deliveries, etc.)
        await session.execute(text("TRUNCATE TABLE app.notices CASCADE;"))
        
        # Reset notice_count in case_rules_state
        await session.execute(text("UPDATE app.case_rules_state SET notice_count = 0, closure_enabled = false, closure_enabled_at = NULL;"))
        
        await session.commit()
        print("Successfully wiped all old notices from the database and reset rule states.")

asyncio.run(wipe_notices())
