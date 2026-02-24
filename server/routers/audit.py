from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import AuditLog, User, UserRole
from schemas import AuditLogCreate, AuditLogResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
    dependencies=[Depends(require_roles([UserRole.super_admin]))]
)

@router.get("/", response_model=List[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin]))
):
    query = select(AuditLog).order_by(AuditLog.id.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs

@router.post("/", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    log_in: AuditLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = AuditLog(**log_in.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
