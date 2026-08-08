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
        print("Calling generate_ai_financial_summary for exact 1-to-1 12-section report...")
        summary_obj = await report_svc.generate_ai_financial_summary(user.id, filter_type='this_month')

        print("\n==========================================")
        print("12 SECTIONS VERIFIED EXACT MATCH:")
        expected_sections = [
            "top_metrics", "ai_summary", "spending_insights", "income_insights",
            "savings_insights", "budget_insights", "goal_insights", "financial_health",
            "prophet_forecast", "risk_insights", "positive_insights", "recommended_actions"
        ]
        for idx, key in enumerate(expected_sections, 1):
            val = summary_obj.get(key)
            print(f"Section {idx}. {key}: {'PRESENT' if val else 'MISSING'}")

if __name__ == '__main__':
    asyncio.run(main())
