from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models import Notice, User, UserRole, NoticeStatus, NoticeDelivery, DeliveryChannel, DeliveryStatus, Meeting, MeetingStatus, AuditLog, ActorType, CaseRuleState, CaseParty, PartyType, Case
from schemas import NoticeCreate, NoticeResponse, NoticeUpdate
from core.dependencies import get_current_user, require_roles
import uuid
from datetime import datetime, timedelta

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
    from models import NoticeAttachment
    query = select(Notice).options(
        selectinload(Notice.case),
        selectinload(Notice.attachments).selectinload(NoticeAttachment.document),
        selectinload(Notice.deliveries)
    ).offset(skip).limit(limit)
    result = await db.execute(query)
    notices = result.scalars().all()
    
    # Attach case_code to response
    for notice in notices:
        if notice.case:
            setattr(notice, 'case_code', notice.case.case_code)
            
    return notices

@router.post("/", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
async def create_notice(
    notice_in: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    from services.notice_service import notice_service
    try:
        notice = await notice_service.create_notice(db, notice_in, current_user.id)
        
        # Rule State Check (Notice Count >= 3 enables closure)
        from models import CaseRuleState
        rule_res = await db.execute(select(CaseRuleState).where(CaseRuleState.case_id == notice.case_id))
        rule_state = rule_res.scalar_one_or_none()
        
        if not rule_state:
            rule_state = CaseRuleState(case_id=notice.case_id, notice_count=1, closure_enabled=False)
            db.add(rule_state)
        else:
            rule_state.notice_count += 1
            
        if rule_state.notice_count >= 3:
            rule_state.closure_enabled = True
            rule_state.closure_enabled_at = datetime.utcnow()
            
        await db.commit()
        return notice
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{notice_id}", response_model=NoticeResponse)
async def get_notice(
    notice_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models import NoticeAttachment
    result = await db.execute(
        select(Notice).options(
            selectinload(Notice.case),
            selectinload(Notice.attachments).selectinload(NoticeAttachment.document),
            selectinload(Notice.deliveries)
        ).filter(Notice.id == notice_id)
    )
    notice = result.scalars().first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    if notice.case:
        setattr(notice, 'case_code', notice.case.case_code)
        
    return notice

@router.put("/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: int, 
    notice_in: NoticeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    from models import NoticeAttachment
    result = await db.execute(
        select(Notice).options(
            selectinload(Notice.case),
            selectinload(Notice.attachments).selectinload(NoticeAttachment.document),
            selectinload(Notice.deliveries)
        ).filter(Notice.id == notice_id)
    )
    notice = result.scalars().first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    update_data = notice_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(notice, key, value)
        
    await db.commit()
    await db.refresh(notice)
    return notice
@router.post("/{notice_id}/resend", response_model=NoticeResponse)
async def resend_notice(
    notice_id: uuid.UUID,
    channel: Optional[DeliveryChannel] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    from services.notice_service import notice_service
    try:
        notice = await notice_service.resend_notice(db, notice_id, channel)
        return notice
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
