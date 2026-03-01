import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal
from models import User, UserRole
from core.security import get_password_hash
import uuid

async def seed():
    async with SessionLocal() as db:
        users = [
            User(
                username="Advocate Alice",
                email="alice@jls.com",
                phone="1111111111",
                password_hash=get_password_hash("password123"),
                role=UserRole.advocate,
                employee_id="ADV001"
            ),
            User(
                username="Advocate Bob",
                email="bob@jls.com",
                phone="2222222222",
                password_hash=get_password_hash("password123"),
                role=UserRole.advocate,
                employee_id="ADV002"
            )
        ]
        db.add_all(users)
        try:
            await db.commit()
            print("Advocates added successfully!")
        except Exception as e:
            await db.rollback()
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
