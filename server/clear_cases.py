import asyncio
from database import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM app.cases;"))
        print("Deleted existing cases.")

if __name__ == "__main__":
    asyncio.run(main())
