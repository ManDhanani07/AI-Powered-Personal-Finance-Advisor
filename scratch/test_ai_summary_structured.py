import asyncio
import sys
import os
import json

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
        print("Calling generate_ai_financial_summary...")
        summary_obj = await report_svc.generate_ai_financial_summary(user.id, filter_type='this_month')

        print("\n==========================================")
        print("STRUCTURED AI SUMMARY GENERATED SUCCESSFULLY:")
        print("Keys returned:", list(summary_obj.keys()))
        print("\nOVERALL SUMMARY:")
        print(summary_obj.get("overall_summary"))
        print("\nINCOME INSIGHT:")
        print(summary_obj.get("income_insight"))
        print("\nEXPENSE INSIGHT:")
        print(summary_obj.get("expense_insight"))
        print("\nACTION PLAN:")
        print(json.dumps(summary_obj.get("action_plan"), indent=2))

if __name__ == '__main__':
    asyncio.run(main())
