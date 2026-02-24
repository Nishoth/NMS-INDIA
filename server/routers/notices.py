from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
from models import Notice, User, UserRole
from schemas import NoticeCreate, NoticeResponse, NoticeUpdate
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/notices",
    tags=["Notices"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[NoticeResponse])
async def list_notices(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Notice).offset(skip).limit(limit)
    result = await db.execute(query)
    notices = result.scalars().all()
    return notices

@router.post("/", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
async def create_notice(
    notice_in: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    notice = Notice(**notice_in.model_dump())
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return notice

@router.get("/{notice_id}", response_model=NoticeResponse)
async def get_notice(
    notice_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Notice).filter(Notice.id == notice_id))
    notice = result.scalars().first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return notice

@router.put("/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: int, 
    notice_in: NoticeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    result = await db.execute(select(Notice).filter(Notice.id == notice_id))
    notice = result.scalars().first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    update_data = notice_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(notice, key, value)
        
    await db.commit()
    await db.refresh(notice)
    return notice
