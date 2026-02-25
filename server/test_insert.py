import asyncio
import pandas as pd
from database import get_db, SessionLocal
from routers.cases import extract_val
from models import Case, CaseParty, PartyType, CaseArbitration, CaseMilestone, MilestoneType, Notice, NoticeStatus
from datetime import datetime as dt_module, time, timezone, datetime

async def test_import():
    df = pd.read_excel('/Users/balendrankathiriniyan/Desktop/BANK/JLS/client/SAMPLE FOR ADR.xlsx')
    
    async with SessionLocal() as db:
        success_count = 0
        failed_count = 0
        
        for index, row in df.iterrows():
            try:
                agreement_no = extract_val(row.get('AGREEMENT NO'))
                if not agreement_no:
                    failed_count += 1
                    continue
                    
                case_code = extract_val(row.get('REF. No.')) or f"CASE-{int(datetime.now().timestamp() * 1000) + index}"

                new_case = Case(
                    case_code=case_code,
                    ref_no=extract_val(row.get('REF. No.')),
                    mode=extract_val(row.get('MODE')),
                    agreement_no=agreement_no,
                    agreement_date=extract_val(row.get('AGREEMENT DATE'), 'date'),
                    status="NEW",
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
                await db.flush()

                # Applicant
                applicant_name = extract_val(row.get('APPLICANT NAME'))
                if applicant_name:
                    db.add(CaseParty(
                        case_id=new_case.id,
                        party_type=PartyType.applicant,
                        name=applicant_name,
                        father_name=extract_val(row.get('APPLICANT FATHER NAME ')),
                        address=extract_val(row.get('APPLICANT ADDRESS')),
                        age=extract_val(row.get('APPLICANT AGE'), int)
                    ))

                # Arbitration Details
                inst_name = extract_val(row.get('INSTUTION NAME'))
                arb_name = extract_val(row.get('ARBITRATOR NAME'))
                if inst_name or arb_name:
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

                await db.commit()
                print(f"Row {index} succeeded")
                success_count += 1
            except Exception as e:
                await db.rollback()
                failed_count += 1
                import traceback
                print(f"Failed to import row {index}: {str(e)}")
                traceback.print_exc()
                break # stop to see first error

if __name__ == "__main__":
    asyncio.run(test_import())
