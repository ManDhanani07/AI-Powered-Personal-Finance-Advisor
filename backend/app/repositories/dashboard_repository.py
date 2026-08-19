"""
Dashboard Repository for aggregating financial data across multiple tables.
Provides optimized queries for dashboard metrics, charts, and analytics.
"""

from typing import Dict, List, Any, Optional, Tuple
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import select, func, and_, case, extract, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.models.goal import Goal
from app.core.logging import logger
from app.exceptions.custom_exceptions import DatabaseException


class DashboardRepository:
    """
    Repository for dashboard-specific database queries.
    Focuses on aggregations and multi-table joins for performance.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_total_balance(self, user_id: UUID) -> Decimal:
        """
        Calculate total balance as all-time income minus all-time expenses.
        Excludes soft-deleted transactions (deleted_at IS NULL).
        
        Query: SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0)
        FROM transactions 
        WHERE user_id = :user_id AND is_deleted = False
        """
        try:
            query = select(
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.transaction_type == "INCOME", Transaction.amount),
                            else_=0
                        )
                    ),
                    0
                ) - func.coalesce(
                    func.sum(
                        case(
                            (Transaction.transaction_type == "EXPENSE", Transaction.amount),
                            else_=0
                        )
                    ),
                    0
                )
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.is_deleted == False
                )
            )
            
            result = await self.db.execute(query)
            balance = result.scalar()
            return Decimal(str(balance)) if balance is not None else Decimal("0.00")
            
        except Exception as ex:
            logger.error(f"Error calculating total balance for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate total balance: {ex}")

    async def get_monthly_totals(
        self, user_id: UUID, month: int, year: int
    ) -> Dict[str, Decimal]:
        """
        Calculate income and expense totals for a specific month.
        Returns dict with 'INCOME' and 'EXPENSE' keys.
        
        Query: SELECT 
            transaction_type,
            SUM(amount) as total
        FROM transactions
        WHERE user_id = :user_id 
            AND EXTRACT(MONTH FROM transaction_date) = :month
            AND EXTRACT(YEAR FROM transaction_date) = :year
            AND is_deleted = False
        GROUP BY transaction_type
        """
        try:
            query = select(
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total")
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    extract("month", Transaction.transaction_date) == month,
                    extract("year", Transaction.transaction_date) == year,
                    Transaction.is_deleted == False
                )
            ).group_by(Transaction.transaction_type)
            
            result = await self.db.execute(query)
            rows = result.fetchall()
            
            # Build result dict with defaults
            totals = {"INCOME": Decimal("0.00"), "EXPENSE": Decimal("0.00")}
            for row in rows:
                totals[row.transaction_type] = Decimal(str(row.total)) if row.total else Decimal("0.00")
            
            return totals
            
        except Exception as ex:
            logger.error(f"Error calculating monthly totals for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate monthly totals: {ex}")

    async def get_latest_active_month(self, user_id: UUID) -> Optional[Tuple[int, int]]:
        """
        Returns the latest (month, year) with recorded transactions for the user.
        If no transactions exist, returns None.
        """
        try:
            query = select(func.max(Transaction.transaction_date)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.is_deleted == False
                )
            )
            result = await self.db.execute(query)
            max_date = result.scalar()
            if max_date:
                return max_date.month, max_date.year
            return None
        except Exception as ex:
            logger.error(f"Error fetching latest active month for user {user_id}: {ex}")
            return None

    async def get_cash_flow_by_month(
        self, user_id: UUID, start_date: datetime, end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Calculate monthly cash flow data for a date range.
        Returns list of dicts with year, month (int), transaction_type, and total.

        Uses EXTRACT(year/month) — identical to get_monthly_totals — so the
        month bucketing is always consistent regardless of timezone offsets.
        """
        try:
            year_expr  = extract("year",  Transaction.transaction_date).label("yr")
            month_expr = extract("month", Transaction.transaction_date).label("mo")

            query = select(
                year_expr,
                month_expr,
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total")
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_date >= start_date,
                    Transaction.transaction_date <= end_date,
                    Transaction.is_deleted == False
                )
            ).group_by(
                year_expr,
                month_expr,
                Transaction.transaction_type
            ).order_by(
                year_expr,
                month_expr
            )

            result = await self.db.execute(query)
            rows = result.fetchall()

            return [
                {
                    "yr":   int(row.yr),
                    "mo":   int(row.mo),
                    "transaction_type": row.transaction_type,
                    "total": Decimal(str(row.total)) if row.total else Decimal("0.00")
                }
                for row in rows
            ]

        except Exception as ex:
            logger.error(f"Error calculating cash flow for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate cash flow: {ex}")

    async def get_category_spending(
        self, user_id: UUID, month: int, year: int
    ) -> List[Dict[str, Any]]:
        """
        Calculate spending by category for a specific month (EXPENSE transactions only).
        Returns list of dicts with category details and spending totals.
        
        Query: SELECT 
            c.id,
            c.category_name,
            c.color,
            SUM(t.amount) as total_amount,
            COUNT(t.id) as transaction_count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = :user_id
            AND t.transaction_type = 'EXPENSE'
            AND EXTRACT(MONTH FROM t.transaction_date) = :month
            AND EXTRACT(YEAR FROM t.transaction_date) = :year
            AND t.is_deleted = False
        GROUP BY c.id, c.category_name, c.color
        HAVING SUM(t.amount) > 0
        ORDER BY total_amount DESC
        """
        try:
            query = select(
                Category.id,
                Category.category_name,
                Category.color,
                func.sum(Transaction.amount).label("total_amount"),
                func.count(Transaction.id).label("transaction_count")
            ).join(
                Category, Transaction.category_id == Category.id
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_type == "EXPENSE",
                    extract("month", Transaction.transaction_date) == month,
                    extract("year", Transaction.transaction_date) == year,
                    Transaction.is_deleted == False
                )
            ).group_by(
                Category.id,
                Category.category_name,
                Category.color
            ).having(
                func.sum(Transaction.amount) > 0
            ).order_by(
                func.sum(Transaction.amount).desc()
            )
            
            result = await self.db.execute(query)
            rows = result.fetchall()
            
            return [
                {
                    "category_id": str(row.id),
                    "category_name": row.category_name,
                    "color": row.color,
                    "total_amount": Decimal(str(row.total_amount)) if row.total_amount else Decimal("0.00"),
                    "transaction_count": row.transaction_count or 0
                }
                for row in rows
            ]
            
        except Exception as ex:
            logger.error(f"Error calculating category spending for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate category spending: {ex}")

    async def get_active_budgets_summary(
        self, user_id: UUID
    ) -> List[Budget]:
        """
        Retrieve all active budgets for a user.
        Active = status is 'ACTIVE' and current date is between start_date and end_date.
        Ordered by utilization percentage descending.
        
        Query: SELECT * FROM budgets
        WHERE user_id = :user_id
            AND status = 'ACTIVE'
            AND CURRENT_DATE BETWEEN start_date AND end_date
        ORDER BY (spent_amount / budget_amount * 100) DESC
        """
        try:
            current_date = date.today()
            
            query = select(Budget).where(
                and_(
                    Budget.user_id == user_id,
                    Budget.status == "ACTIVE",
                    Budget.start_date <= current_date,
                    Budget.end_date >= current_date
                )
            ).order_by(
                (Budget.spent_amount / Budget.budget_amount * 100).desc()
            )
            
            result = await self.db.execute(query)
            budgets = list(result.scalars().all())
            
            return budgets
            
        except Exception as ex:
            logger.error(f"Error fetching active budgets for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to fetch active budgets: {ex}")

    async def get_goals_summary(
        self, user_id: UUID
    ) -> Dict[str, Any]:
        """
        Calculate goals summary statistics by status.
        Returns count and average progress for each status.
        
        Query: SELECT 
            status,
            COUNT(*) as count,
            AVG((current_amount / target_amount * 100)) as avg_progress
        FROM goals
        WHERE user_id = :user_id
        GROUP BY status
        """
        try:
            query = select(
                Goal.status,
                func.count(Goal.id).label("count"),
                func.avg(
                    (Goal.current_amount / Goal.target_amount * 100)
                ).label("avg_progress")
            ).where(
                Goal.user_id == user_id
            ).group_by(
                Goal.status
            )
            
            result = await self.db.execute(query)
            rows = result.fetchall()
            
            summary = {}
            for row in rows:
                summary[row.status] = {
                    "count": row.count or 0,
                    "avg_progress": Decimal(str(row.avg_progress)) if row.avg_progress else Decimal("0.00")
                }
            
            # Ensure all statuses are present with defaults
            for status in ["IN_PROGRESS", "ACHIEVED", "CANCELLED"]:
                if status not in summary:
                    summary[status] = {"count": 0, "avg_progress": Decimal("0.00")}
            
            return summary
            
        except Exception as ex:
            logger.error(f"Error calculating goals summary for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate goals summary: {ex}")

    async def get_payment_method_distribution(
        self, user_id: UUID, month: int, year: int
    ) -> List[Dict[str, Any]]:
        """
        Calculate payment method distribution for a specific month.
        Returns transaction count and total amount per payment method.
        
        Query: SELECT 
            payment_method,
            COUNT(*) as count,
            SUM(amount) as total_amount
        FROM transactions
        WHERE user_id = :user_id
            AND payment_method IS NOT NULL
            AND EXTRACT(MONTH FROM transaction_date) = :month
            AND EXTRACT(YEAR FROM transaction_date) = :year
            AND is_deleted = False
        GROUP BY payment_method
        ORDER BY count DESC
        """
        try:
            query = select(
                Transaction.payment_method,
                func.count(Transaction.id).label("count"),
                func.sum(Transaction.amount).label("total_amount")
            ).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.payment_method.isnot(None),
                    extract("month", Transaction.transaction_date) == month,
                    extract("year", Transaction.transaction_date) == year,
                    Transaction.is_deleted == False
                )
            ).group_by(
                Transaction.payment_method
            ).order_by(
                func.count(Transaction.id).desc()
            )
            
            result = await self.db.execute(query)
            rows = result.fetchall()
            
            return [
                {
                    "payment_method": row.payment_method,
                    "count": row.count or 0,
                    "total_amount": Decimal(str(row.total_amount)) if row.total_amount else Decimal("0.00")
                }
                for row in rows
            ]
            
        except Exception as ex:
            logger.error(f"Error calculating payment method distribution for user {user_id}: {ex}")
            raise DatabaseException(f"Failed to calculate payment method distribution: {ex}")

