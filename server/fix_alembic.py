import asyncio
from database import engine
from sqlalchemy import text

async def drop():
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
    print("Dropped alembic_version table.")

asyncio.run(drop())
