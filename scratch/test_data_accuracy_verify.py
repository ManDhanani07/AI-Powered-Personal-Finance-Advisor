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
        summary_obj = await report_svc.generate_ai_financial_summary(user.id, filter_type='this_month')

        top = summary_obj.get("top_metrics", {})
        inc = top.get("income", 0)
        exp = top.get("expenses", 0)
        sav = top.get("savings", 0)
        rate = top.get("savings_rate", 0)

        print("=== VERIFICATION OUTPUT ===")
        print(f"Income: {inc}, Expenses: {exp}, Savings: {sav}, Savings Rate: {rate}%")
        print("Spending Categories:")
        for c in summary_obj.get('spending_insights', {}).get('categories', []):
            print(" -", c)
        print("Category Budgets:")
        for b in summary_obj.get('budget_insights', {}).get('category_budgets', []):
            print(" -", b)
        print("Financial Health Explanation:")
        print(" -", summary_obj.get('financial_health', {}).get('overall_explanation'))

if __name__ == '__main__':
    asyncio.run(main())
