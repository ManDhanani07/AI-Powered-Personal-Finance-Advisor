"""
Transaction Repository handling Database queries and aggregation for Transaction ledger.
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.models.category import Category
from app.repositories.base import BaseRepository
from app.schemas.base import PaginatedResponse
from app.utils.pagination import build_paginated_response


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: AsyncSession):
        super().__init__(Transaction, db)

    async def get_by_id_with_category(self, transaction_id: UUID) -> Optional[Transaction]:
        """Fetch single transaction by ID with eager loaded category."""
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.id == transaction_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_transaction_number(self, transaction_number: str) -> Optional[Transaction]:
        """Fetch transaction by unique transaction number."""
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.transaction_number == transaction_number.strip())
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def soft_delete(self, transaction_id: UUID) -> bool:
        """Soft delete transaction by setting is_deleted=True."""
        tx = await self.get_by_id(transaction_id)
        if not tx:
            return False
        tx.soft_delete()
        await self.db.commit()
        return True

    async def restore(self, transaction_id: UUID) -> bool:
        """Restore soft-deleted transaction by resetting is_deleted=False."""
        tx = await self.get_by_id(transaction_id)
        if not tx:
            return False
        tx.restore()
        await self.db.commit()
        return True

    async def get_all_by_user(self, user_id: UUID) -> List[Transaction]:
        """Fetch all un-deleted transactions for a user without pagination limits."""
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.is_deleted == False,
                )
            )
            .order_by(Transaction.transaction_date.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_aggregate_stats(self, user_id: UUID) -> Dict[str, Any]:
        """Compute high-speed database aggregations directly on PostgreSQL."""
        # Total counts
        cnt_q = select(func.count(Transaction.id)).where(
            and_(Transaction.user_id == user_id, Transaction.is_deleted == False)
        )
        total_count = (await self.db.execute(cnt_q)).scalar() or 0

        # Income aggregates
        inc_q = select(
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.amount), 0)
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "INCOME",
                Transaction.is_deleted == False
            )
        )
        inc_res = (await self.db.execute(inc_q)).one()
        income_count, total_income = inc_res[0], float(inc_res[1])

        # Expense aggregates
        exp_q = select(
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.amount), 0)
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "EXPENSE",
                Transaction.is_deleted == False
            )
        )
        exp_res = (await self.db.execute(exp_q)).one()
        expense_count, total_expenses = exp_res[0], float(exp_res[1])

        net_surplus = total_income - total_expenses
        savings_rate = round((net_surplus / total_income * 100), 2) if total_income > 0 else 0.0

        return {
            "total_count": total_count,
            "income_count": income_count,
            "total_income": total_income,
            "expense_count": expense_count,
            "total_expenses": total_expenses,
            "net_surplus": net_surplus,
            "savings_rate": savings_rate,
        }

    async def get_by_user(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category_id: Optional[UUID] = None,
        transaction_type: Optional[str] = None,
        payment_method: Optional[str] = None,
        account_type: Optional[str] = None,
        merchant: Optional[str] = None,
        location: Optional[str] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        is_recurring: Optional[bool] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        quarter: Optional[str] = None,
        include_deleted: bool = False,
        only_deleted: bool = False,
        search: Optional[str] = None,
        sort_by: str = "transaction_date",
        sort_order: str = "desc",
    ) -> PaginatedResponse[Transaction]:
        """Fetch user transactions with flexible multi-criteria filtering, search, and pagination."""
        query = (
            select(Transaction)
            .outerjoin(Category, Transaction.category_id == Category.id)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id)
        )

        # Soft delete state filtering
        if only_deleted:
            query = query.where(Transaction.is_deleted == True)
        elif not include_deleted:
            query = query.where(Transaction.is_deleted == False)

        # Filters
        if category_id:
            query = query.where(Transaction.category_id == category_id)
        if transaction_type:
            query = query.where(Transaction.transaction_type == transaction_type.upper())
        if payment_method:
            query = query.where(Transaction.payment_method == payment_method.upper())
        if account_type:
            query = query.where(Transaction.account_type == account_type.upper())
        if merchant:
            query = query.where(Transaction.merchant.ilike(f"%{merchant.strip()}%"))
        if location:
            query = query.where(Transaction.location.ilike(f"%{location.strip()}%"))
        if is_recurring is not None:
            query = query.where(Transaction.is_recurring == is_recurring)
        if min_amount is not None:
            query = query.where(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.where(Transaction.amount <= max_amount)

        # Date Range & Presets (Year, Month, Quarter)
        if year:
            if month and 1 <= month <= 12:
                import calendar
                _, last_day = calendar.monthrange(year, month)
                start_date = datetime(year, month, 1, 0, 0, 0)
                end_date = datetime(year, month, last_day, 23, 59, 59)
            elif quarter:
                q_str = str(quarter).upper().replace("Q", "")
                if q_str in ["1", "2", "3", "4"]:
                    q_num = int(q_str)
                    start_m = (q_num - 1) * 3 + 1
                    end_m = q_num * 3
                    import calendar
                    _, last_day = calendar.monthrange(year, end_m)
                    start_date = datetime(year, start_m, 1, 0, 0, 0)
                    end_date = datetime(year, end_m, last_day, 23, 59, 59)
            elif not start_date and not end_date:
                start_date = datetime(year, 1, 1, 0, 0, 0)
                end_date = datetime(year, 12, 31, 23, 59, 59)

        if start_date:
            query = query.where(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.where(Transaction.transaction_date <= end_date)

        # Search across title, description, merchant, notes, and category name
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Transaction.title.ilike(term),
                    Transaction.description.ilike(term),
                    Transaction.merchant.ilike(term),
                    Transaction.notes.ilike(term),
                    Transaction.location.ilike(term),
                    Category.category_name.ilike(term),
                )
            )

        # Count total matches
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Sorting
        sort_attr = getattr(Transaction, sort_by, Transaction.transaction_date)
        if sort_order.lower() == "desc":
            query = query.order_by(sort_attr.desc())
        else:
            query = query.order_by(sort_attr.asc())

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return build_paginated_response(items=items, total_items=total, page=page, page_size=page_size)

    async def get_recent_by_user(self, user_id: UUID, limit: int = 5) -> List[Transaction]:
        """Fetch top N recent active transactions for user."""
        query = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(Transaction.user_id == user_id, Transaction.is_deleted == False)
            .order_by(Transaction.transaction_date.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_total_amount_by_type(
        self,
        user_id: UUID,
        transaction_type: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Decimal:
        """Calculate total sum of active transactions for a specific type (INCOME or EXPENSE)."""
        conditions = [
            Transaction.user_id == user_id,
            Transaction.transaction_type == transaction_type.upper(),
            Transaction.is_deleted == False,
        ]
        if start_date:
            conditions.append(Transaction.transaction_date >= start_date)
        if end_date:
            conditions.append(Transaction.transaction_date <= end_date)

        query = select(func.coalesce(func.sum(Transaction.amount), 0.00)).where(and_(*conditions))
        result = await self.db.execute(query)
        return Decimal(result.scalar() or 0.00)

    async def get_total_income(
        self, user_id: UUID, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
    ) -> Decimal:
        return await self.get_total_amount_by_type(user_id, "INCOME", start_date, end_date)

    async def get_total_expense(
        self, user_id: UUID, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
    ) -> Decimal:
        return await self.get_total_amount_by_type(user_id, "EXPENSE", start_date, end_date)

    async def get_category_wise_spending(
        self, user_id: UUID, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        conditions = [
            Transaction.user_id == user_id,
            Transaction.transaction_type == "EXPENSE",
            Transaction.is_deleted == False,
        ]
        if start_date:
            conditions.append(Transaction.transaction_date >= start_date)
        if end_date:
            conditions.append(Transaction.transaction_date <= end_date)

        query = (
            select(
                Category.category_name,
                Category.color,
                Category.icon,
                func.sum(Transaction.amount).label("total_spent"),
                func.count(Transaction.id).label("transaction_count"),
            )
            .join(Category, Transaction.category_id == Category.id)
            .where(and_(*conditions))
            .group_by(Category.category_name, Category.color, Category.icon)
            .order_by(func.sum(Transaction.amount).desc())
        )

        result = await self.db.execute(query)
        rows = result.fetchall()
        return [
            {
                "category_name": row.category_name,
                "color": row.color,
                "icon": row.icon,
                "total_spent": float(row.total_spent or 0.0),
                "transaction_count": row.transaction_count,
            }
            for row in rows
        ]

    async def get_summary_by_user(self, user_id: UUID) -> Dict[str, Any]:
        """Get summary of income, expenses, and net balance for user."""
        income = await self.get_total_income(user_id)
        expense = await self.get_total_expense(user_id)
        inc_val = float(income)
        exp_val = float(expense)
        return {
            "total_income": inc_val,
            "total_expense": exp_val,
            "net_balance": inc_val - exp_val,
        }
