from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import Meeting, User, UserRole
from schemas import MeetingCreate, MeetingResponse, MeetingUpdate
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Meeting).offset(skip).limit(limit)
    result = await db.execute(query)
    meetings = result.scalars().all()
    return meetings

@router.post("/", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_in: MeetingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    meeting = Meeting(**meeting_in.model_dump())
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return meeting

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Meeting).filter(Meeting.id == meeting_id))
    meeting = result.scalars().first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: int, 
    meeting_in: MeetingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    result = await db.execute(select(Meeting).filter(Meeting.id == meeting_id))
    meeting = result.scalars().first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = meeting_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(meeting, key, value)
        
    await db.commit()
    await db.refresh(meeting)
    return meeting
