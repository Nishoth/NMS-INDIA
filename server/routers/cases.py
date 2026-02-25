from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import pandas as pd
from io import BytesIO
import math
from datetime import datetime

from database import get_db
from models import Case, User, UserRole
from schemas import CaseCreate, CaseResponse, CaseImportResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/cases", tags=["cases"])

@router.get("/", response_model=List[CaseResponse])
async def list_cases(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Case).order_by(Case.created_at.desc()).offset(skip).limit(limit)
    if current_user.role == UserRole.advocate:
        query = query.where(Case.assigned_advocate_id == current_user.id)
        
    result = await db.execute(query)
    cases = result.scalars().all()
    return cases

def extract_val(val, target_type=str):
    if pd.isna(val):
        return None
    try:
        if target_type == str:
            return str(val).strip()
        elif target_type == float:
            if isinstance(val, str):
                return float(val.replace(',', '').strip())
            return float(val)
        elif target_type == int:
            if isinstance(val, str):
                return int(val.replace(',', '').strip())
            return int(val)
        elif target_type == 'date':
            if isinstance(val, str):
                return pd.to_datetime(val).date()
            if isinstance(val, (int, float)) and val > 10000:
                # Excel serial date
                return pd.to_datetime(val, origin='1899-12-30', unit='D').date()
            return val.date() if hasattr(val, 'date') else val
    except:
        return None
    return None

@router.post("/import", response_model=CaseImportResponse)
async def import_cases(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only Excel files are supported")
        
    try:
        content = await file.read()
        df = pd.read_excel(BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    success_count = 0
    failed_count = 0
    total_rows = len(df)
    
    # We will process each row. For simplicity and reliability, we do this one by one in the async session.
    for index, row in df.iterrows():
        try:
            agreement_no = extract_val(row.get('AGREEMENT NO'))
            if not agreement_no:
                failed_count += 1
                continue
                
            # Check if case exists with this agreement_no AND whether an existing case has the exact case_code
            query = select(Case).where(Case.agreement_no == agreement_no)
            res = await db.execute(query)
            existing_case = res.scalar_one_or_none()
            if existing_case:
                # If case exists, we can optionally skip or update it. Since skipping was desired initially, we skip for now.
                failed_count += 1
                print(f"Skipping row {index}: case with agreement {agreement_no} already exists.")
                continue
                
            # Create a simple unique case code if not present, and ensure global uniqueness
            case_code = extract_val(row.get('REF. No.'))
            if not case_code:
                case_code = f"CASE-{int(datetime.now().timestamp() * 1000) + index}"
                
            code_query = select(Case).where(Case.case_code == case_code)
            code_res = await db.execute(code_query)
            if code_res.scalar_one_or_none():
                # Append a timestamp if the Excel provided code is a duplicate
                case_code = f"{case_code}-{int(datetime.now().timestamp()) + index}"

            new_case = Case(
                case_code=case_code,
                ref_no=extract_val(row.get('REF. No.')),
                mode=extract_val(row.get('MODE')),
                agreement_no=agreement_no,
                agreement_date=extract_val(row.get('AGREEMENT DATE'), 'date'),
                status="NEW",
                created_by=current_user.id,
                claim_amount=extract_val(row.get('CLAIM AMOUNT'), float),
                claim_date=extract_val(row.get('CLAIM DATE'), 'date'),
                amount_financed=extract_val(row.get('AMT FINANCE'), float),
                finance_charge=extract_val(row.get('FINANCE CHARGE'), float),
                agreement_value=extract_val(row.get('AGR VALUE'), float),
                award_amount=extract_val(row.get('AWARD AMOUNT'), float),
                award_amount_words=extract_val(row.get('AWARD AMOUNT IN WORDS')),
                make=extract_val(row.get('MAKE')),
                model=extract_val(row.get('MODEL')),
                engine_no=extract_val(row.get('ENGINE NO.')),
                chassis_no=extract_val(row.get('CHASIS NO.')),
                reg_no=extract_val(row.get('REG. NO')),
                first_emi_date=extract_val(row.get('FIRST EMI DATE'), 'date'),
                last_emi_date=extract_val(row.get('LAST EMI DATE'), 'date'),
                tenure=extract_val(row.get('TENURE'), int),
                sec_17_applied=extract_val(row.get('SEC 17 ORDER APPLIED(YES/NO)')),
                sec_17_applied_date=extract_val(row.get('SEC 17 ORDER APPLIED DATE'), 'date'),
                sec_17_received_date=extract_val(row.get('SEC 17 ORDER RECEIVED DATE'), 'date'),
                allocated_at=extract_val(row.get('ALLOCATION DATE'), 'date')
            )
            db.add(new_case)
            await db.flush() # Flush to get new_case.id

            # Applicant
            applicant_name = extract_val(row.get('APPLICANT NAME'))
            if applicant_name:
                from models import CaseParty, PartyType
                db.add(CaseParty(
                    case_id=new_case.id,
                    party_type=PartyType.applicant,
                    name=applicant_name,
                    father_name=extract_val(row.get('APPLICANT FATHER NAME ')),
                    address=extract_val(row.get('APPLICANT ADDRESS')),
                    age=extract_val(row.get('APPLICANT AGE'), int)
                ))
                
            # Co-Applicant
            co_applicant_name = extract_val(row.get('CO-APPLICANT NAME'))
            if co_applicant_name:
                from models import CaseParty, PartyType
                db.add(CaseParty(
                    case_id=new_case.id,
                    party_type=PartyType.co_applicant,
                    name=co_applicant_name,
                    father_name=extract_val(row.get('CO-APPLICANT FATHER NAME ')),
                    address=extract_val(row.get('CO-APPLICANT ADDRESS'))
                ))
                
            # Guarantor
            guarantor_name = extract_val(row.get('GUARANTOR NAME'))
            if guarantor_name:
                from models import CaseParty, PartyType
                db.add(CaseParty(
                    case_id=new_case.id,
                    party_type=PartyType.guarantor,
                    name=guarantor_name,
                    father_name=extract_val(row.get('GUARANTOR FATHERNAME')),
                    address=extract_val(row.get('GUARANTOR ADDRESS'))
                ))
                
            # Arbitration Details
            inst_name = extract_val(row.get('INSTUTION NAME'))
            arb_name = extract_val(row.get('ARBITRATOR NAME'))
            if inst_name or arb_name:
                from models import CaseArbitration
                db.add(CaseArbitration(
                    case_id=new_case.id,
                    institution_name=inst_name,
                    arbitrator_name=arb_name,
                    arbitrator_phone=extract_val(row.get('ARBITRATOR CONTACT NO.')),
                    arbitrator_email=extract_val(row.get('ARBITRATOR Email ID')),
                    arbitrator_address=extract_val(row.get('ARBITRATOR ADDRESS')),
                    acceptance_date=extract_val(row.get('ACCEPTANCE BY ARBITRATOR (DATE)'), 'date'),
                    arb_case_no=extract_val(row.get('ARB CASE NO.'))
                ))

            # Milestones
            from models import CaseMilestone, MilestoneType
            milestones_to_add = [
                (MilestoneType.FIRST_MEETING, row.get('FIRST MEETING / CLAIM STATEMENT (DATE) (30 days from Acceptance)')),
                (MilestoneType.SECOND_MEETING, row.get('SECOND MEETING (DATE)\n(20 days from First Meeting)')),
                (MilestoneType.THIRD_MEETING_EXPARTE, row.get('THIRD MEETING/EX-PARTE NOTICE (DATE)\n(20 days from Second Meeting)')),
                (MilestoneType.EVIDENCE_ARGUMENT, row.get('EVIDENCE / ARGUMENT (DATE)\n(20 days from Third Meeting)')),
                (MilestoneType.AWARD_DATE, row.get('AWARD DATE\n(20 days from Evidence)')),
                (MilestoneType.STAMP_PURCHASE_DATE, row.get('STAMP PURCHASE DATE\n(15 days Before Award Date)'))
            ]

            for m_type, m_date in milestones_to_add:
                parsed_date = extract_val(m_date, 'date')
                if parsed_date:
                    db.add(CaseMilestone(
                        case_id=new_case.id,
                        milestone_type=m_type,
                        planned_date=parsed_date,
                        actual_date=parsed_date
                    ))
            
            # Notices
            from models import Notice, NoticeStatus
            from datetime import datetime as dt_module, time, timezone
            notices_to_add = [
                (1, "A", row.get('NOTICE A /DATE OF CN')),
                (2, "B", row.get('NOTICE B /DATE OF RN')),
                (3, "C", row.get('NOTICE - C'))
            ]
            
            for n_no, n_type, n_date in notices_to_add:
                parsed_date = extract_val(n_date, 'date')
                if parsed_date:
                    dt = dt_module.combine(parsed_date, time.min).replace(tzinfo=timezone.utc)
                    db.add(Notice(
                        case_id=new_case.id,
                        notice_no=n_no,
                        notice_type=n_type,
                        status=NoticeStatus.sent,
                        created_at=dt
                    ))

            from sqlalchemy.exc import IntegrityError
            await db.commit()
            success_count += 1
        except IntegrityError as e:
            await db.rollback()
            failed_count += 1
            print(f"Database IntegrityError on row {index}: {str(e)}")
        except Exception as e:
            await db.rollback()
            failed_count += 1
            print(f"Failed to import row {index}: {str(e)}")

    return CaseImportResponse(
        message="Import completed",
        total_rows=total_rows,
        success_rows=success_count,
        failed_rows=failed_count
    )

@router.post("/", response_model=CaseResponse)
async def create_case(
    case_in: CaseCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    # Check duplicate case_code
    query = select(Case).where(Case.case_code == case_in.case_code)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Case code already exists")
        
    new_case = Case(**case_in.model_dump(), created_by=current_user.id)
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)
    return new_case

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Case).where(Case.id == case_id)
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.role == UserRole.advocate and case.assigned_advocate_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this case")
        
    return case

@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: UUID, 
    case_in: CaseCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.super_admin, UserRole.case_manager]))
):
    query = select(Case).where(Case.id == case_id)
    result = await db.execute(query)
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    for key, value in case_in.model_dump(exclude_unset=True).items():
        setattr(case, key, value)
        
    await db.commit()
    await db.refresh(case)
    return case
