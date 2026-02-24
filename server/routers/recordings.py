from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import Recording, User, UserRole
from schemas import RecordingCreate, RecordingResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/recordings",
    tags=["Recordings"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[RecordingResponse])
async def list_recordings(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Recording).offset(skip).limit(limit)
    result = await db.execute(query)
    recordings = result.scalars().all()
    return recordings

@router.post("/", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
async def create_recording(
    recording_in: RecordingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recording = Recording(**recording_in.model_dump())
    db.add(recording)
    await db.commit()
    await db.refresh(recording)
    return recording

@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(
    recording_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Recording).filter(Recording.id == recording_id))
    recording = result.scalars().first()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    return recording
