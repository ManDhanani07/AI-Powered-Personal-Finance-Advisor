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
        users = (await db.execute(select(User))).scalars().all()
        report_svc = ReportService(db)

        for u in users:
            print(f"\n==========================================")
            print(f"USER: {u.email} (ID: {u.id})")
            for flt in ['all', 'this_month']:
                res = await report_svc.get_dashboard_summary_report(u.id, filter_type=flt)
                kpis = res.get('kpis', {})
                cats = res.get('categories', [])
                print(f"  [Filter: {flt}] -> tx_count: {kpis.get('transaction_count')}, total_income: {kpis.get('total_income')}, total_exp: {kpis.get('total_expenses')}, cats_count: {len(cats)}")

if __name__ == '__main__':
    asyncio.run(main())
