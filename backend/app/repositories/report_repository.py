"""
Enterprise PostgreSQL Repository for Financial Reports & Analytics.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, date
from uuid import UUID
from sqlalchemy import select, func, and_, extract, desc, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.financial_health_history import FinancialHealthHistory


class ReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_filtered_transactions(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Transaction]:
        """Fetch transactions within a date range for a specific user."""
        stmt = (
            select(Transaction)
            .options(selectinload(Transaction.category))
            .where(
                Transaction.user_id == user_id,
                Transaction.is_deleted.is_(False),
            )
        )
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        stmt = stmt.order_by(desc(Transaction.transaction_date))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_income_expense_summary(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Compute income, expenses, surplus, and count using SQL aggregates."""
        stmt = (
            select(
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.transaction_type == 'INCOME', Transaction.amount),
                            else_=0,
                        )
                    ),
                    0,
                ).label('total_income'),
                func.coalesce(
                    func.sum(
                        case(
                            (Transaction.transaction_type == 'EXPENSE', Transaction.amount),
                            else_=0,
                        )
                    ),
                    0,
                ).label('total_expenses'),
                func.count(Transaction.id).label('total_count'),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.is_deleted.is_(False),
            )
        )
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        result = await self.db.execute(stmt)
        row = result.first()
        inc = float(row.total_income) if row else 0.0
        exp = float(row.total_expenses) if row else 0.0
        cnt = int(row.total_count) if row else 0

        surplus = inc - exp
        savings_rate = (surplus / inc * 100) if inc > 0 else 0.0

        return {
            'total_income': inc,
            'total_expenses': exp,
            'net_savings': surplus,
            'savings_rate': round(max(0.0, savings_rate), 2),
            'transaction_count': cnt,
        }

    async def get_category_spending_analysis(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Compute category-wise spending distribution from PostgreSQL (excluding Savings categories)."""
        stmt = (
            select(
                func.coalesce(Category.category_name, 'General Expense').label('category_name'),
                func.coalesce(Category.color, '#6366F1').label('color'),
                func.coalesce(Category.icon, 'Tag').label('icon'),
                func.sum(Transaction.amount).label('total_amount'),
                func.count(Transaction.id).label('tx_count'),
            )
            .outerjoin(Category, Transaction.category_id == Category.id)
            .where(
                Transaction.user_id == user_id,
                func.upper(Transaction.transaction_type) == 'EXPENSE',
                Transaction.is_deleted.is_(False),
                ~func.lower(func.coalesce(Category.category_name, '')).like('%savings%'),
                ~func.lower(func.coalesce(Category.category_name, '')).like('%goal%'),
            )
        )
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        stmt = stmt.group_by(Category.id, Category.category_name, Category.color, Category.icon)
        stmt = stmt.order_by(desc('total_amount'))

        result = await self.db.execute(stmt)
        rows = result.all()

        total_expense = sum(float(r.total_amount) for r in rows) if rows else 0.0

        return [
            {
                'category_name': r.category_name,
                'color': r.color or '#6366F1',
                'icon': r.icon or 'Tag',
                'total_amount': float(r.total_amount),
                'tx_count': int(r.tx_count),
                'percentage': round((float(r.total_amount) / total_expense * 100), 2) if total_expense > 0 else 0.0,
            }
            for r in rows
        ]

    async def get_merchant_spending_analysis(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Compute top merchant spending analysis from PostgreSQL."""
        stmt = (
            select(
                func.coalesce(Transaction.merchant, 'Unspecified Merchant').label('merchant_name'),
                func.sum(Transaction.amount).label('total_amount'),
                func.count(Transaction.id).label('frequency'),
            )
            .where(
                Transaction.user_id == user_id,
                func.upper(Transaction.transaction_type) == 'EXPENSE',
                Transaction.is_deleted.is_(False),
            )
        )
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        stmt = stmt.group_by('merchant_name').order_by(desc('total_amount')).limit(limit)

        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                'merchant': r.merchant_name,
                'total_amount': float(r.total_amount),
                'frequency': int(r.frequency),
            }
            for r in rows
        ]

    async def get_payment_method_breakdown(
        self,
        user_id: UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Compute payment method breakdown from PostgreSQL."""
        stmt = (
            select(
                Transaction.payment_method,
                func.sum(Transaction.amount).label('total_amount'),
                func.count(Transaction.id).label('tx_count'),
            )
            .where(
                Transaction.user_id == user_id,
                func.upper(Transaction.transaction_type) == 'EXPENSE',
                Transaction.is_deleted.is_(False),
            )
        )
        if start_date:
            stmt = stmt.where(Transaction.transaction_date >= start_date)
        if end_date:
            stmt = stmt.where(Transaction.transaction_date <= end_date)

        stmt = stmt.group_by(Transaction.payment_method).order_by(desc('total_amount'))

        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                'payment_method': r.payment_method or 'Other',
                'total_amount': float(r.total_amount),
                'tx_count': int(r.tx_count),
            }
            for r in rows
        ]

    async def get_monthly_breakdown(
        self,
        user_id: UUID,
        target_year: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Compute monthly income, expense, and savings trends."""
        if not target_year:
            target_year = datetime.now().year

        stmt = (
            select(
                extract('month', Transaction.transaction_date).label('month_num'),
                func.sum(
                    case(
                        (Transaction.transaction_type == 'INCOME', Transaction.amount),
                        else_=0,
                    )
                ).label('income'),
                func.sum(
                    case(
                        (Transaction.transaction_type == 'EXPENSE', Transaction.amount),
                        else_=0,
                    )
                ).label('expense'),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.is_deleted.is_(False),
                extract('year', Transaction.transaction_date) == target_year,
            )
            .group_by('month_num')
            .order_by('month_num')
        )

        result = await self.db.execute(stmt)
        rows = result.all()

        months_map = {int(r.month_num): r for r in rows}
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        monthly_data = []
        for m_idx in range(1, 13):
            r = months_map.get(m_idx)
            inc = float(r.income) if r else 0.0
            exp = float(r.expense) if r else 0.0
            net = inc - exp
            monthly_data.append({
                'month': month_names[m_idx - 1],
                'month_num': m_idx,
                'income': inc,
                'expense': exp,
                'savings': net,
                'savings_rate': round((net / inc * 100), 2) if inc > 0 else 0.0,
            })

        return monthly_data

    async def get_yearly_breakdown(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Compute yearly income vs expense breakdown across all years."""
        stmt = (
            select(
                extract('year', Transaction.transaction_date).label('year_num'),
                func.sum(
                    case(
                        (Transaction.transaction_type == 'INCOME', Transaction.amount),
                        else_=0,
                    )
                ).label('income'),
                func.sum(
                    case(
                        (Transaction.transaction_type == 'EXPENSE', Transaction.amount),
                        else_=0,
                    )
                ).label('expense'),
            )
            .where(
                Transaction.user_id == user_id,
                Transaction.is_deleted.is_(False),
            )
            .group_by('year_num')
            .order_by('year_num')
        )

        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                'year': int(r.year_num),
                'income': float(r.income),
                'expense': float(r.expense),
                'savings': float(r.income) - float(r.expense),
                'savings_rate': round(((float(r.income) - float(r.expense)) / float(r.income) * 100), 2) if float(r.income) > 0 else 0.0,
            }
            for r in rows
        ]

    async def get_budget_performance_analysis(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Compute live budget utilization per category matching actual transactions."""
        stmt = (
            select(Budget)
            .options(selectinload(Budget.category))
            .where(Budget.user_id == user_id, func.upper(Budget.status) == 'ACTIVE')
        )
        result = await self.db.execute(stmt)
        budgets = result.scalars().all()

        performance = []
        for b in budgets:
            cat_name = b.category.category_name if b.category else (b.budget_name or 'General')
            limit_val = float(b.budget_amount or 0)

            # Sum actual expense transactions for this exact category
            if b.category_id:
                tx_stmt = select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                    Transaction.user_id == user_id,
                    Transaction.category_id == b.category_id,
                    func.upper(Transaction.transaction_type) == 'EXPENSE',
                    Transaction.is_deleted.is_(False)
                )
                tx_res = await self.db.execute(tx_stmt)
                spent_val = float(tx_res.scalar() or 0)
            else:
                spent_val = float(b.spent_amount or 0)

            utilization = round((spent_val / limit_val * 100), 2) if limit_val > 0 else 0.0

            performance.append({
                'budget_id': str(b.id),
                'category_name': cat_name,
                'limit': limit_val,
                'spent': spent_val,
                'remaining': max(0.0, limit_val - spent_val),
                'utilization_pct': utilization,
                'status': 'EXCEEDED' if spent_val > limit_val else ('WARNING' if utilization >= 80 else 'HEALTHY'),
            })

        return performance

    async def get_goal_progress_analysis(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Compute active goals progress and completion status."""
        stmt = select(Goal).where(Goal.user_id == user_id)
        result = await self.db.execute(stmt)
        goals = result.scalars().all()

        analysis = []
        for g in goals:
            target = float(g.target_amount or 0)
            current = float(g.current_amount or 0)
            pct = round((current / target * 100), 2) if target > 0 else 0.0
            is_done = (g.status == 'ACHIEVED') or (current >= target and target > 0)

            analysis.append({
                'goal_id': str(g.id),
                'goal_name': g.goal_name,
                'name': g.goal_name,
                'target_amount': target,
                'current_amount': current,
                'remaining_amount': max(0.0, target - current),
                'completion_pct': pct,
                'priority': g.priority.value if hasattr(g.priority, 'value') else str(g.priority),
                'status': 'ACHIEVED' if is_done else g.status,
                'is_completed': is_done,
            })

        return analysis

    async def get_health_score_history(self, user_id: UUID, limit: int = 12) -> List[Dict[str, Any]]:
        """Fetch historical financial health scores."""
        stmt = (
            select(FinancialHealthHistory)
            .where(FinancialHealthHistory.user_id == user_id)
            .order_by(desc(FinancialHealthHistory.calculated_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        histories = list(result.scalars().all())
        histories.reverse()

        return [
            {
                'date': h.calculated_at.strftime('%Y-%m-%d'),
                'score': float(getattr(h, 'health_score', getattr(h, 'overall_score', 75.0)) or 75.0),
                'grade': h.grade or 'B',
                'savings_score': float(getattr(h, 'saving_score', getattr(h, 'savings_score', 0)) or 0),
                'budget_score': float(h.budget_score or 0),
            }
            for h in histories
        ]

    async def get_forecast_summary_history(self, user_id: UUID, limit: int = 12) -> List[Dict[str, Any]]:
        """Fetch recent forecast history records."""
        stmt = (
            select(ForecastHistory)
            .where(ForecastHistory.user_id == user_id)
            .order_by(desc(ForecastHistory.generated_at))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        forecasts = list(result.scalars().all())
        forecasts.reverse()

        return [
            {
                'date': f.generated_at.strftime('%Y-%m-%d'),
                'forecast_type': f.forecast_type,
                'horizon_days': f.prediction_json.get('days_ahead', 30) if isinstance(f.prediction_json, dict) else 30,
                'projected_amount': float(f.prediction_json.get('total_projected_expense', 0)) if isinstance(f.prediction_json, dict) else 0.0,
                'confidence': 0.85,
            }
            for f in forecasts
        ]
