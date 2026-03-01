import asyncio, os, sys
sys.path.append(os.path.join(os.getcwd(), 'server'))
from server.database import SessionLocal
from server.models import Document
from sqlalchemy.future import select

async def main():
    async with SessionLocal() as db:
        res = await db.execute(select(Document))
        docs = res.scalars().all()
        print('Docs count:', len(docs))
        for d in docs:
            print(f"ID: {d.id}, File: {d.file_name}, Case ID: {d.case_id}")

if __name__ == "__main__":
    asyncio.run(main())
