import asyncio, os, sys
sys.path.append(os.path.join(os.getcwd(), 'server'))
from server.database import SessionLocal
from server.models import Document
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from server.schemas import DocumentResponse

async def main():
    async with SessionLocal() as db:
        res = await db.execute(select(Document).options(selectinload(Document.case)))
        docs = res.scalars().all()
        for doc in docs:
            if doc.case:
                setattr(doc, 'case_code', doc.case.case_code)
            print("DB DOC:", doc)
            try:
                # Try serializing via Pydantic
                pydantic_doc = DocumentResponse.model_validate(doc)
                print("PYDANTIC OK:", pydantic_doc.model_dump_json())
            except Exception as e:
                print("VALIDATION ERROR:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
