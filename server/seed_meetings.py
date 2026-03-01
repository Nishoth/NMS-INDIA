import asyncio
from datetime import datetime, timedelta
from database import SessionLocal
from models import Case, Meeting, User, MeetProvider
from sqlalchemy import select

async def seed_meetings():
    async with SessionLocal() as db:
        # Check if meetings already exist
        res = await db.execute(select(Meeting))
        if len(res.scalars().all()) > 0:
            print("Meetings already exist.")
            return

        # Fetch some cases
        cases_res = await db.execute(select(Case).limit(3))
        cases = cases_res.scalars().all()

        if not cases:
            print("No cases found to attach meetings to.")
            return
        
        # Fetch an admin user (if any)
        user_res = await db.execute(select(User).filter(User.email == "admin@jls.in"))
        admin = user_res.scalars().first()

        meetings = [
            Meeting(
                case_id=cases[0].id,
                scheduled_at=datetime.utcnow() + timedelta(days=2),
                meet_provider=MeetProvider.google_meet,
                meet_url="https://meet.google.com/abc-defg-hij",
                portal_url="http://localhost:5173/portal/tkn123",
                status="scheduled",
                notes="First hearing for case " + cases[0].case_code,
                created_by=admin.id if admin else None
            ),
            Meeting(
                case_id=cases[1].id if len(cases) > 1 else cases[0].id,
                scheduled_at=datetime.utcnow() - timedelta(days=1),
                meet_provider=MeetProvider.google_meet,
                meet_url="https://meet.google.com/xyz-uvw-rst",
                portal_url="http://localhost:5173/portal/tkn456",
                status="completed",
                notes="Settlement discussion completed for " + (cases[1].case_code if len(cases) > 1 else ""),
                created_by=admin.id if admin else None
            ),
            Meeting(
                case_id=cases[2].id if len(cases) > 2 else cases[0].id,
                scheduled_at=datetime.utcnow() + timedelta(days=5),
                meet_provider=MeetProvider.google_meet,
                meet_url=None,
                portal_url=None,
                status="cancelled",
                notes="Meeting cancelled by parties.",
                created_by=admin.id if admin else None
            )
        ]

        db.add_all(meetings)
        await db.commit()
        print("Successfully seeded 3 meetings.")

if __name__ == "__main__":
    asyncio.run(seed_meetings())
