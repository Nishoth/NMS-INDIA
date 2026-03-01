import asyncio
from database import SessionLocal
from models import Document
from sqlalchemy.future import select

async def main():
    test_id = '6310cc4a-4195-43e2-b623-1fb7af9fa35f'
    async with SessionLocal() as db:
        res = await db.execute(select(Document).filter(Document.id == test_id))
        doc = res.scalars().first()
        print("STRING MATCH:", doc)
        
        # Test UUID cast
        import uuid
        res2 = await db.execute(select(Document).filter(Document.id == uuid.UUID(test_id)))
        doc2 = res2.scalars().first()
        print("UUID MATCH:", doc2)

if __name__ == "__main__":
    asyncio.run(main())
