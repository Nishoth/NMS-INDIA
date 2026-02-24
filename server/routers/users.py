from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import User, UserRole
from schemas import UserResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_roles([UserRole.super_admin]))]
)

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin]))
):
    query = select(User).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin]))
):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
