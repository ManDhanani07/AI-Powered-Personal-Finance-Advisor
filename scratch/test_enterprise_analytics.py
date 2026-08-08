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
        print("ENTERPRISE FINTECH ANALYTICS PAYLOAD GENERATED:")
        print("Keys returned:", list(summary_obj.keys()))
        print("\nEXECUTIVE STANDING SNAPSHOT:")
        print(summary_obj.get("executive_standing"))
        print("\nHEALTH BREAKDOWN BARS:")
        print(summary_obj.get("financial_health_summary", {}).get("score_breakdown"))
        print("\nFORECAST MINI TREND SERIES:")
        print(summary_obj.get("forecast_outlook", {}).get("trend_series"))
        print("\nACTION PLAN ITEMS COUNT:", len(summary_obj.get("action_plan", [])))
        if summary_obj.get("action_plan"):
            print("Sample Action Plan Item 1:")
            item = summary_obj["action_plan"][0]
            for k in ["priority", "action", "why_it_matters", "evidence", "potential_impact", "recommended_next_step"]:
                print(f"  - {k}: {item.get(k)}")

if __name__ == '__main__':
    asyncio.run(main())
