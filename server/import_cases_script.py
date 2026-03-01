import asyncio
import pandas as pd
from datetime import datetime
from sqlalchemy import select
from database import SessionLocal
from models import Case, CaseParty, PartyType, CaseArbitration, CaseMilestone, MilestoneType, Notice, NoticeStatus

def extract_val(val, val_type=None):
    if pd.isna(val) or val == '' or str(val).strip().lower() in ['na', 'n/a', 'none']:
        return None
    try:
        if val_type == 'date':
            return pd.to_datetime(val).date()
        elif val_type == float:
            # removing commas or currency symbols if present
            clean_val = str(val).replace(',', '').replace('₹', '').replace('Rs.', '').strip()
            return float(clean_val)
        elif val_type == int:
            return int(float(str(val).replace(',', '').strip()))
        return str(val).strip()
    except:
        return None

async def import_data():
    df = pd.read_excel('../client/SAMPLE FOR ADR.xlsx')
    success_count = 0
    failed_count = 0
    total_rows = len(df)
    
    async with SessionLocal() as db:
        # SUPER ADMIN USER ID workaround for created_by
        from models import User
        result = await db.execute(select(User).limit(1))
        super_admin = result.scalar_one_or_none()
        admin_id = super_admin.id if super_admin else None

        for index, row in df.iterrows():
            try:
                agreement_no = extract_val(row.get('AGREEMENT NO'))
                if not agreement_no:
                    failed_count += 1
                    continue
                    
                # Check if case exists
                query = select(Case).where(Case.agreement_no == agreement_no)
                res = await db.execute(query)
                if res.scalar_one_or_none():
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
                    created_by=admin_id,
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
                    allocated_at=extract_val(row.get('ALLOCATION DATE'), 'date'),
                    zone=extract_val(row.get('ZONE')),
                    region=extract_val(row.get('REGION')),
                    branch_code=extract_val(row.get('BRANCH CODE')),
                    branch_name=extract_val(row.get('BRANCH NAME')),
                    product=extract_val(row.get('PRODUCT')),
                    repossession_status=extract_val(row.get('REPOSSESSION STATUS (YES/NO)')),
                    dpd=extract_val(row.get('D.P.D')),
                    allocation_pos=extract_val(row.get('ALLOCATION POS'))
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
                        address=extract_val(row.get('RESIDENCE ADDRESS 1')),
                        residence_address_2=extract_val(row.get('RESIDENCE ADDRESS 2')),
                        residence_address_3=extract_val(row.get('RESIDENCE ADDRESS 3')),
                        office_address_1=extract_val(row.get('OFFICE ADDRESS 1')),
                        office_address_2=extract_val(row.get('OFFICE ADDRESS 2 ')),
                        office_address_3=extract_val(row.get('OFFICE ADDRESS 3')),
                        city=extract_val(row.get('CITY')),
                        state=extract_val(row.get('STATE')),
                        postal_code=extract_val(row.get('PIN CODE')),
                        age=extract_val(row.get('APPLICANT AGE'), int),
                        phone=extract_val(row.get('CUSTOMER PHONE 1')),
                        phone_2=extract_val(row.get('CUSTOMER PHONE 2 / EMAIL ID')),
                        email=extract_val(row.get('CUSTOMER PHONE 2 / EMAIL ID')) if '@' in str(row.get('CUSTOMER PHONE 2 / EMAIL ID', '')) else None
                    ))
                    
                # Co-Applicant
                co_applicant_name = extract_val(row.get('CO-APPLICANT NAME'))
                if co_applicant_name:
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

                await db.commit()
                success_count += 1
            except Exception as e:
                await db.rollback()
                failed_count += 1
                print(f"Failed to import row {index}: {str(e)}")

        print(f"Import completed: {success_count} succeeded, {failed_count} failed out of {total_rows}")

asyncio.run(import_data())
