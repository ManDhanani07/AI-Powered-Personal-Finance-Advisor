import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.services.report_service import ReportService

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani@gmail.com not found")
            return

        report_svc = ReportService(db)
        print("Calling generate_ai_financial_summary for compact layout...")
        summary_obj = await report_svc.generate_ai_financial_summary(user.id, filter_type='this_month')

        print("\n==========================================")
        print("COMPACT AI FINANCIAL SUMMARY GENERATED:")
        print("Keys returned:", list(summary_obj.keys()))
        print("\n1. METRICS ROW:", summary_obj.get("metrics"))
        print("\n2. AI SUMMARY SENTENCE:", summary_obj.get("ai_summary_sentence"))
        print("\n3. KEY INSIGHTS:", summary_obj.get("key_insights"))
        print("\n4. RECOMMENDED ACTION:", summary_obj.get("recommended_action"))

if __name__ == '__main__':
    asyncio.run(main())
