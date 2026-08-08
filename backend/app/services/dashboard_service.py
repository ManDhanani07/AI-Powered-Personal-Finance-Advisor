"""
Dashboard Service — aggregates data from multiple repositories
to produce all dashboard KPIs, charts, and analytics.
All values are dynamically computed from live database data.
"""

import asyncio
import calendar
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.repositories.dashboard_repository import DashboardRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.user_repository import UserRepository
from app.core.logging import logger


def _pct(part: Decimal, total: Decimal) -> Decimal:
    """Safe percentage calculation avoiding zero division."""
    if not total or total == 0:
        return Decimal("0.00")
    return round((part / total) * 100, 2)


def _budget_color(utilization: Decimal) -> str:
    """Return semantic color for budget utilization level."""
    if utilization >= 100:
        return "#EF4444"   # red
    if utilization >= 75:
        return "#F59E0B"   # amber
    return "#10B981"       # emerald


def _goal_color(progress: Decimal) -> str:
    """Return semantic color for goal progress level."""
    if progress >= 100:
        return "#10B981"   # green — completed
    if progress >= 50:
        return "#6366F1"   # indigo
    return "#F59E0B"       # amber — just started


class DashboardService:
    """
    Orchestrates all dashboard data aggregation.
    Each method corresponds 1:1 with a dashboard API endpoint.
    """

    def __init__(
        self,
        dashboard_repo: DashboardRepository,
        transaction_repo: TransactionRepository,
        budget_repo: BudgetRepository,
        goal_repo: GoalRepository,
        user_repo: UserRepository,
    ):
        self.dash = dashboard_repo
        self.tx = transaction_repo
        self.budget = budget_repo
        self.goal = goal_repo
        self.user = user_repo

    # ─────────────────────────────────────────────
    # Overview — 8 KPI Cards
    # ─────────────────────────────────────────────

    async def get_overview(self, user_id: UUID) -> Dict[str, Any]:
        today = date.today()
        current_month = today.month
        current_year = today.year

        # Prior month for trend calculations
        if current_month == 1:
            prev_month, prev_year = 12, current_year - 1
        else:
            prev_month, prev_year = current_month - 1, current_year

        # Current + previous month totals
        curr = await self.dash.get_monthly_totals(user_id, current_month, current_year)
        prev = await self.dash.get_monthly_totals(user_id, prev_month, prev_year)

        monthly_income = curr.get("INCOME", Decimal("0.00"))
        monthly_expenses = curr.get("EXPENSE", Decimal("0.00"))
        net_savings = monthly_income - monthly_expenses
        savings_rate = _pct(net_savings, monthly_income) if monthly_income > 0 else Decimal("0.00")

        prev_income = prev.get("INCOME", Decimal("0.00"))
        prev_expenses = prev.get("EXPENSE", Decimal("0.00"))
        prev_savings = prev_income - prev_expenses

        total_balance = await self.dash.get_total_balance(user_id)

        # Budget aggregation for current month
        active_budgets = await self.dash.get_active_budgets_summary(user_id)
        budget_total = sum(b.budget_amount for b in active_budgets) or Decimal("0.00")
        budget_spent = sum(b.spent_amount for b in active_budgets) or Decimal("0.00")
        budget_remaining = sum(b.remaining_amount for b in active_budgets) or Decimal("0.00")
        budget_util_pct = _pct(budget_spent, budget_total)

        # Goals summary
        goals_summary = await self.dash.get_goals_summary(user_id)
        active_count = goals_summary.get("IN_PROGRESS", {}).get("count", 0)
        achieved_count = goals_summary.get("ACHIEVED", {}).get("count", 0)
        avg_progress = goals_summary.get("IN_PROGRESS", {}).get("avg_progress", Decimal("0.00"))

        # Trend calculations (% change vs prior month)
        def trend_pct(curr_val, prev_val):
            if not prev_val or prev_val == 0:
                return None
            return round(((curr_val - prev_val) / abs(prev_val)) * 100, 1)

        return {
            "total_balance": total_balance,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "net_savings": net_savings,
            "savings_rate": savings_rate,
            "current_month_budget_total": budget_total,
            "current_month_budget_spent": budget_spent,
            "current_month_budget_remaining": budget_remaining,
            "budget_utilization_pct": budget_util_pct,
            "total_active_goals": active_count,
            "completed_goals": achieved_count,
            "avg_goal_progress_pct": avg_progress,
            "income_change_pct": trend_pct(monthly_income, prev_income),
            "expense_change_pct": trend_pct(monthly_expenses, prev_expenses),
            "savings_change_pct": trend_pct(net_savings, prev_savings),
        }

    # ─────────────────────────────────────────────
    # Summary — Header Banner
    # ─────────────────────────────────────────────

    async def get_summary(self, user_id: UUID, user_name: str) -> Dict[str, Any]:
        today = date.today()
        hour = datetime.now().hour

        if hour < 12:
            greeting = f"Good Morning, {user_name}! 🌅"
        elif hour < 17:
            greeting = f"Good Afternoon, {user_name}! ☀️"
        else:
            greeting = f"Good Evening, {user_name}! 🌙"

        overview = await self.get_overview(user_id)

        goals_summary = await self.dash.get_goals_summary(user_id)
        avg_progress = goals_summary.get("IN_PROGRESS", {}).get("avg_progress", Decimal("0.00"))
        active_goals = goals_summary.get("IN_PROGRESS", {}).get("count", 0)

        return {
            "greeting": greeting,
            "today_date": today,
            "user_name": user_name,
            "total_balance": overview["total_balance"],
            "monthly_income": overview["monthly_income"],
            "monthly_expenses": overview["monthly_expenses"],
            "net_savings": overview["net_savings"],
            "savings_rate": overview["savings_rate"],
            "budget_remaining": overview["current_month_budget_remaining"],
            "goals_progress_pct": avg_progress,
            "active_goals_count": active_goals,
        }

    # ─────────────────────────────────────────────
    # Charts — All visualizations data
    # ─────────────────────────────────────────────

    async def get_charts(self, user_id: UUID) -> Dict[str, Any]:
        today = date.today()
        current_month = today.month
        current_year = today.year

        # ── 12-month Income vs Expense (Jan to Dec of Current Year) ──
        start_12m = datetime(current_year, 1, 1, 0, 0, 0)
        end_12m = datetime(current_year, 12, 31, 23, 59, 59)

        raw_cf = await self.dash.get_cash_flow_by_month(user_id, start_12m, end_12m)

        # Build dict keyed by (year, month) using the integer fields returned by get_cash_flow_by_month
        monthly_map: Dict[tuple, Dict] = {}
        for row in raw_cf:
            key = (row["yr"], row["mo"])
            if key not in monthly_map:
                monthly_map[key] = {"INCOME": Decimal("0.00"), "EXPENSE": Decimal("0.00")}
            monthly_map[key][row["transaction_type"]] = row["total"]


        # Build 12 labels in order from Jan to Dec
        monthly_points = []
        for month_num in range(1, 13):
            key = (current_year, month_num)
            income = monthly_map.get(key, {}).get("INCOME", Decimal("0.00"))
            expense = monthly_map.get(key, {}).get("EXPENSE", Decimal("0.00"))
            net = income - expense
            label = date(current_year, month_num, 1).strftime("%b '%y")
            monthly_points.append({
                "month": label, "income": income, "expense": expense, "net": net
            })

        # ── Category spending this month ──
        cat_rows = await self.dash.get_category_spending(user_id, current_month, current_year)
        total_cat_spent = sum(r["total_amount"] for r in cat_rows) or Decimal("1")
        cat_chart = [
            {
                "category_name": r["category_name"],
                "value": r["total_amount"],
                "color": r["color"] or "#6366F1",
                "percentage": _pct(r["total_amount"], total_cat_spent),
            }
            for r in cat_rows
        ]

        # ── Budget utilization ──
        active_budgets = await self.dash.get_active_budgets_summary(user_id)
        budget_chart = [
            {
                "budget_name": b.budget_name,
                "budget_amount": b.budget_amount,
                "spent_amount": b.spent_amount,
                "utilization_pct": _pct(b.spent_amount, b.budget_amount),
                "color": _budget_color(_pct(b.spent_amount, b.budget_amount)),
            }
            for b in active_budgets
        ]

        # ── Goal progress ──
        goals_paginated = await self.goal.get_all(
            filters={"user_id": user_id, "status": "IN_PROGRESS"},
            page=1, page_size=10
        )
        goal_chart = []
        for g in goals_paginated.items:
            prog = _pct(g.current_amount, g.target_amount)
            goal_chart.append({
                "goal_name": g.goal_name,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "progress_pct": prog,
                "color": _goal_color(prog),
            })

        # ── Payment method distribution ──
        pm_rows = await self.dash.get_payment_method_distribution(user_id, current_month, current_year)
        total_pm_count = sum(r["count"] for r in pm_rows) or 1
        pm_chart = [
            {
                "name": r["payment_method"],
                "count": r["count"],
                "value": r["total_amount"],
                "percentage": round((r["count"] / total_pm_count) * 100, 1),
            }
            for r in pm_rows
        ]

        return {
            "income_expense_monthly": monthly_points,
            "cash_flow_monthly": monthly_points,   # same data, different chart type
            "category_spending": cat_chart,
            "budget_utilization": budget_chart,
            "goal_progress": goal_chart,
            "payment_method_distribution": pm_chart,
        }

    # ─────────────────────────────────────────────
    # Recent Transactions
    # ─────────────────────────────────────────────

    async def get_recent_transactions(self, user_id: UUID, limit: int = 10) -> Dict[str, Any]:
        from app.models.category import Category
        from app.models.transaction import Transaction
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload

        limit = min(max(limit, 5), 50)

        raw_txs = await self.tx.get_recent_by_user(user_id, limit=limit)

        def _direction(tx_type):
            if tx_type == "INCOME":
                return "IN"
            if tx_type == "EXPENSE":
                return "OUT"
            return "NEUTRAL"

        def _net_amount(tx):
            if tx.transaction_type == "INCOME":
                return tx.amount
            if tx.transaction_type == "EXPENSE":
                return -tx.amount
            return Decimal("0.00")

        transactions = []
        for tx in raw_txs:
            cat = None
            if tx.category:
                cat = {
                    "category_name": tx.category.category_name,
                    "color": tx.category.color,
                    "icon": tx.category.icon,
                }
            transactions.append({
                "id": tx.id,
                "title": tx.title,
                "merchant": tx.merchant,
                "amount": tx.amount,
                "transaction_type": tx.transaction_type,
                "direction": _direction(tx.transaction_type),
                "net_amount": _net_amount(tx),
                "transaction_date": tx.transaction_date,
                "payment_method": tx.payment_method,
                "category": cat,
            })

        return {
            "transactions": transactions,
            "total_count": len(transactions),
            "limit": limit,
        }

    # ─────────────────────────────────────────────
    # Budget Overview
    # ─────────────────────────────────────────────

    async def get_budget_overview(self, user_id: UUID) -> Dict[str, Any]:
        active_budgets = await self.dash.get_active_budgets_summary(user_id)

        total_budget = Decimal("0.00")
        total_spent = Decimal("0.00")
        total_remaining = Decimal("0.00")
        exceeded = 0
        on_track = 0

        budget_items = []
        for b in active_budgets:
            util = _pct(b.spent_amount, b.budget_amount)
            color = _budget_color(util)
            if util >= 100:
                exceeded += 1
            else:
                on_track += 1

            total_budget += b.budget_amount
            total_spent += b.spent_amount
            total_remaining += b.remaining_amount

            # Load category name if linked
            cat_name = None
            if b.category_id:
                try:
                    from app.models.category import Category
                    from sqlalchemy import select
                    result = await self.budget.db.execute(
                        select(Category.category_name).where(Category.id == b.category_id)
                    )
                    cat_name = result.scalar_one_or_none()
                except Exception:
                    pass

            budget_items.append({
                "id": b.id,
                "budget_name": b.budget_name,
                "budget_amount": b.budget_amount,
                "spent_amount": b.spent_amount,
                "remaining_amount": b.remaining_amount,
                "utilization_pct": util,
                "status": b.status,
                "category_name": cat_name,
                "color": color,
            })

        overall_util = _pct(total_spent, total_budget)

        return {
            "total_active_budgets": len(active_budgets),
            "exceeded_budgets": exceeded,
            "on_track_budgets": on_track,
            "total_budget_amount": total_budget,
            "total_spent_amount": total_spent,
            "total_remaining_amount": total_remaining,
            "overall_utilization_pct": overall_util,
            "budgets": budget_items,
        }

    # ─────────────────────────────────────────────
    # Goals Overview
    # ─────────────────────────────────────────────

    async def get_goals_overview(self, user_id: UUID) -> Dict[str, Any]:
        all_goals_paginated = await self.goal.get_all(
            filters={"user_id": user_id},
            page=1, page_size=100
        )
        all_goals = all_goals_paginated.items

        today = date.today()
        active, completed, cancelled = [], [], []
        total_target = Decimal("0.00")
        total_saved = Decimal("0.00")

        goal_items = []
        nearest_deadline_goal = None
        nearest_days = None

        for g in all_goals:
            total_target += g.target_amount
            total_saved += g.current_amount
            progress = _pct(g.current_amount, g.target_amount)
            days_rem = (g.target_date - today).days if g.target_date >= today else 0

            months_remaining = max(days_rem / 30.44, 1)
            amount_needed = max(g.target_amount - g.current_amount, Decimal("0.00"))
            req_monthly = round(amount_needed / Decimal(str(months_remaining)), 2)

            item = {
                "id": g.id,
                "goal_name": g.goal_name,
                "goal_type": g.goal_type,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "progress_pct": progress,
                "target_date": g.target_date,
                "days_remaining": days_rem,
                "required_monthly_saving": req_monthly,
                "status": g.status,
                "priority": g.priority,
            }
            goal_items.append(item)

            if g.status == "IN_PROGRESS":
                active.append(g)
                if nearest_days is None or days_rem < nearest_days:
                    nearest_days = days_rem
                    nearest_deadline_goal = item
            elif g.status == "ACHIEVED":
                completed.append(g)
            elif g.status == "CANCELLED":
                cancelled.append(g)

        overall_progress = _pct(total_saved, total_target)

        return {
            "total_goals": len(all_goals),
            "active_goals": len(active),
            "completed_goals": len(completed),
            "cancelled_goals": len(cancelled),
            "total_target_amount": total_target,
            "total_saved_amount": total_saved,
            "overall_progress_pct": overall_progress,
            "nearest_deadline_goal": nearest_deadline_goal,
            "goals": goal_items,
        }

    # ─────────────────────────────────────────────
    # Spending Analysis
    # ─────────────────────────────────────────────

    async def get_spending_analysis(self, user_id: UUID) -> Dict[str, Any]:
        today = date.today()
        current_month = today.month
        current_year = today.year
        month_name = today.strftime("%B")

        # Category spending this month
        cat_rows = await self.dash.get_category_spending(user_id, current_month, current_year)

        highest = None
        lowest = None
        if cat_rows:
            highest_row = cat_rows[0]  # already ordered DESC
            lowest_row = cat_rows[-1]
            highest = {
                "category_name": highest_row["category_name"],
                "amount": highest_row["total_amount"],
                "color": highest_row.get("color"),
            }
            lowest = {
                "category_name": lowest_row["category_name"],
                "amount": lowest_row["total_amount"],
                "color": lowest_row.get("color"),
            }

        # Days elapsed this month
        days_elapsed = today.day

        # Total expense this month
        monthly_totals = await self.dash.get_monthly_totals(user_id, current_month, current_year)
        total_expense_month = monthly_totals.get("EXPENSE", Decimal("0.00"))
        avg_daily = round(total_expense_month / days_elapsed, 2) if days_elapsed > 0 else Decimal("0.00")

        # Average monthly spending over last 6 months
        monthly_expenses = []
        for i in range(1, 7):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            t = await self.dash.get_monthly_totals(user_id, m, y)
            monthly_expenses.append(t.get("EXPENSE", Decimal("0.00")))
        avg_monthly = round(sum(monthly_expenses) / len(monthly_expenses), 2) if monthly_expenses else Decimal("0.00")

        # Largest & Smallest transaction this month
        from datetime import datetime as dt
        import calendar as cal
        last_day = cal.monthrange(current_year, current_month)[1]
        m_start = dt(current_year, current_month, 1)
        m_end = dt(current_year, current_month, last_day, 23, 59, 59)

        paginated_month = await self.tx.get_by_user(
            user_id=user_id,
            page=1, page_size=1000,
            start_date=m_start,
            end_date=m_end,
            transaction_type="EXPENSE",
        )
        month_txs = paginated_month.items

        largest_tx = None
        smallest_tx = None
        largest_amount = Decimal("0.00")
        smallest_amount = None

        for tx in month_txs:
            if tx.amount > largest_amount:
                largest_amount = tx.amount
                largest_tx = tx.title
            if smallest_amount is None or tx.amount < smallest_amount:
                smallest_amount = tx.amount
                smallest_tx = tx.title

        return {
            "month": month_name,
            "year": current_year,
            "highest_spending_category": highest,
            "lowest_spending_category": lowest,
            "avg_daily_spending": avg_daily,
            "avg_monthly_spending": avg_monthly,
            "largest_transaction_amount": largest_amount,
            "largest_transaction_title": largest_tx,
            "smallest_transaction_amount": smallest_amount or Decimal("0.00"),
            "smallest_transaction_title": smallest_tx,
            "total_transactions_this_month": len(month_txs),
            "total_spent_this_month": total_expense_month,
        }

    async def get_complete_dashboard(self, user_id: UUID, user_name: str, tx_limit: int = 10) -> Dict[str, Any]:
        """Fetch all dashboard sections in parallel for sub-second instant response."""
        overview_task = self.get_overview(user_id)
        charts_task = self.get_charts(user_id)
        recent_tx_task = self.get_recent_transactions(user_id, limit=tx_limit)
        budget_task = self.get_budget_overview(user_id)
        goals_task = self.get_goals_overview(user_id)
        spending_task = self.get_spending_analysis(user_id)

        (
            overview,
            charts,
            recent_transactions,
            budget_overview,
            goals_overview,
            spending_analysis,
        ) = await asyncio.gather(
            overview_task,
            charts_task,
            recent_tx_task,
            budget_task,
            goals_task,
            spending_task,
        )

        today = date.today()
        hour = datetime.now().hour

        if hour < 12:
            greeting = f"Good Morning, {user_name}! 🌅"
        elif hour < 17:
            greeting = f"Good Afternoon, {user_name}! ☀️"
        else:
            greeting = f"Good Evening, {user_name}! 🌙"

        goals_summary = await self.dash.get_goals_summary(user_id)
        avg_progress = goals_summary.get("IN_PROGRESS", {}).get("avg_progress", Decimal("0.00"))
        active_goals = goals_summary.get("IN_PROGRESS", {}).get("count", 0)

        summary = {
            "greeting": greeting,
            "today_date": today,
            "user_name": user_name,
            "total_balance": overview["total_balance"],
            "monthly_income": overview["monthly_income"],
            "monthly_expenses": overview["monthly_expenses"],
            "net_savings": overview["net_savings"],
            "savings_rate": overview["savings_rate"],
            "budget_remaining": overview["current_month_budget_remaining"],
            "goals_progress_pct": avg_progress,
            "active_goals_count": active_goals,
        }

        return {
            "overview": overview,
            "summary": summary,
            "charts": charts,
            "recent_transactions": recent_transactions,
            "budget_overview": budget_overview,
            "goals_overview": goals_overview,
            "spending_analysis": spending_analysis,
        }

