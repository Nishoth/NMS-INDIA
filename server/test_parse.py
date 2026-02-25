import pandas as pd
from datetime import datetime
import math
import traceback

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
                # Try inferring datetime to handle various formats safely
                # explicitly pass dayfirst if that is common
                return pd.to_datetime(val, dayfirst=True).date()
            if isinstance(val, (int, float)) and val > 10000:
                return pd.to_datetime(val, origin='1899-12-30', unit='D').date()
            return val.date() if hasattr(val, 'date') else val
    except Exception as e:
        print(f"Error parsing value {val} as {target_type}: {e}")
        return None
    return None

df = pd.read_excel('/Users/balendrankathiriniyan/Desktop/BANK/JLS/client/SAMPLE FOR ADR.xlsx')

for index, row in df.iterrows():
    try:
        agreement_no = extract_val(row.get('AGREEMENT NO'))
        if not agreement_no:
            print(f"Row {index} skipped: missing agreement_no")
            continue
            
        case_code = extract_val(row.get('REF. No.')) or f"CASE-{int(datetime.now().timestamp() * 1000) + index}"

        case_data = {
            "case_code": case_code,
            "ref_no": extract_val(row.get('REF. No.')),
            "mode": extract_val(row.get('MODE')),
            "agreement_no": agreement_no,
            "agreement_date": extract_val(row.get('AGREEMENT DATE'), 'date'),
            "claim_amount": extract_val(row.get('CLAIM AMOUNT'), float),
            "claim_date": extract_val(row.get('CLAIM DATE'), 'date'),
            "amount_financed": extract_val(row.get('AMT FINANCE'), float),
            "finance_charge": extract_val(row.get('FINANCE CHARGE'), float),
            "agreement_value": extract_val(row.get('AGR VALUE'), float),
            "award_amount": extract_val(row.get('AWARD AMOUNT'), float),
            "award_amount_words": extract_val(row.get('AWARD AMOUNT IN WORDS')),
            "make": extract_val(row.get('MAKE')),
            "model": extract_val(row.get('MODEL')),
            "engine_no": extract_val(row.get('ENGINE NO.')),
            "chassis_no": extract_val(row.get('CHASIS NO.')),
            "reg_no": extract_val(row.get('REG. NO'))
        }
        
        applicant_name = extract_val(row.get('APPLICANT NAME'))
        co_applicant_name = extract_val(row.get('CO-APPLICANT NAME'))
        guarantor_name = extract_val(row.get('GUARANTOR NAME'))
        
        inst_name = extract_val(row.get('INSTUTION NAME'))
        arb_name = extract_val(row.get('ARBITRATOR NAME'))
        
        # Checking milestone fields which should go into CaseMilestone?
        # In routers/cases.py, the milestones aren't extracted at all!
        # The user's excel file has a LOT of date fields: "NOTICE A /DATE OF CN", "FIRST MEETING", etc.
        # Let's print the case data to verify extraction.
        print(f"Successfully evaluated Row {index}: {case_code}")
    except Exception as e:
        print(f"Failed to import row {index}: {str(e)}")
        traceback.print_exc()
