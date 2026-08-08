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
        print("Calling generate_ai_financial_summary for 13-section self-contained report...")
        summary_obj = await report_svc.generate_ai_financial_summary(user.id, filter_type='this_month')

        print("\n==========================================")
        print("13-SECTION SELF-CONTAINED PAYLOAD GENERATED:")
        print("Keys returned:", list(summary_obj.keys()))
        print("\n1. TOP METRICS:", summary_obj.get("top_metrics"))
        print("\n2. AI SUMMARY:", summary_obj.get("ai_summary"))
        print("\n3. SPENDING INSIGHTS:", summary_obj.get("spending_insights"))
        print("\n4. INCOME INSIGHTS:", summary_obj.get("income_insights"))
        print("\n5. SAVINGS INSIGHTS:", summary_obj.get("savings_insights"))
        print("\n6. BUDGET INSIGHTS:", summary_obj.get("budget_insights"))
        print("\n7. GOAL INSIGHTS:", summary_obj.get("goal_insights"))
        print("\n8. FINANCIAL HEALTH:", summary_obj.get("financial_health"))
        print("\n9. PROPHET FORECAST:", summary_obj.get("prophet_forecast"))
        print("\n10. RISK INSIGHTS:", summary_obj.get("risk_insights"))
        print("\n11. POSITIVE INSIGHTS:", summary_obj.get("positive_insights"))
        print("\n12. RECOMMENDED ACTIONS (PLAIN TEXT):", summary_obj.get("recommended_actions"))

if __name__ == '__main__':
    asyncio.run(main())
