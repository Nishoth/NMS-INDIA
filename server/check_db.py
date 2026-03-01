import asyncio
from sqlalchemy import select, text
from database import SessionLocal
from models import Case

async def main():
    async with SessionLocal() as session:
        result = await session.execute(select(Case))
        cases = result.scalars().all()
        print(f"Total cases: {len(cases)}")
        if cases:
            print(f"First case ZONE: {cases[0].zone}")

asyncio.run(main())
