import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath('backend'))

from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'mandhanani@gmail.com'))
        user = res.scalar_one_or_none()
        if not user:
            print("User mandhanani@gmail.com not found")
            return

        print("=== USER BUDGETS IN DB ===")
        b_stmt = select(Budget).where(Budget.user_id == user.id)
        b_res = await db.execute(b_stmt)
        budgets = b_res.scalars().all()
        for b in budgets:
            c_name = None
            if b.category_id:
                c_res = await db.execute(select(Category).where(Category.id == b.category_id))
                cat = c_res.scalar_one_or_none()
                c_name = cat.category_name if cat else None
            print(f"Budget ID: {b.id} | Name: {b.budget_name} | CategoryID: {b.category_id} ({c_name}) | Amount: {b.budget_amount} | SpentCol: {b.spent_amount} | Status: {b.status}")

        print("\n=== EXPENSE TRANSACTIONS PER CATEGORY ===")
        tx_stmt = select(Category.category_name, Transaction.category_id, Transaction.amount).outerjoin(Category, Transaction.category_id == Category.id).where(Transaction.user_id == user.id, Transaction.transaction_type == 'EXPENSE', Transaction.is_deleted.is_(False))
        tx_res = await db.execute(tx_stmt)
        txs = tx_res.all()
        totals = {}
        for cname, cid, amt in txs:
            cname = cname or "Uncategorized"
            totals[cname] = totals.get(cname, 0.0) + float(amt)

        for cname, total_amt in sorted(totals.items(), key=lambda x: x[1], reverse=True):
            print(f" Category: {cname} | Total Spent: {total_amt}")

if __name__ == '__main__':
    asyncio.run(main())
