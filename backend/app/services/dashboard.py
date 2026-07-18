from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import date, datetime, timezone
import calendar
from typing import Any, List
from app.repositories.account import AccountRepository
from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository
from app.repositories.goal import GoalRepository
from app.repositories.financial_health import FinancialHealthRepository
from app.schemas.dashboard import (
    DashboardSummaryResponse, 
    DashboardAnalyticsResponse,
    BudgetUsage, 
    CategorySpend, 
    GoalProgress
)
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.core.logging import logger

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.account_repo = AccountRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.budget_repo = BudgetRepository(db)
        self.goal_repo = GoalRepository(db)
        self.health_repo = FinancialHealthRepository(db)

    def get_summary(self, user_id: Any) -> DashboardSummaryResponse:
        """Calculate high-level financial summary analytics (AI-ready) for the user."""
        logger.info(f"Generating dashboard summary metrics for user ID: {user_id}")

        today = date.today()
        start_of_month = datetime(today.year, today.month, 1, tzinfo=timezone.utc)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_of_month = datetime(today.year, today.month, last_day, 23, 59, 59, 999999, tzinfo=timezone.utc)

        # Previous month calculations for growth rates
        if today.month == 1:
            prev_month = 12
            prev_year = today.year - 1
        else:
            prev_month = today.month - 1
            prev_year = today.year

        start_of_prev_month = datetime(prev_year, prev_month, 1, tzinfo=timezone.utc)
        _, prev_last_day = calendar.monthrange(prev_year, prev_month)
        end_of_prev_month = datetime(prev_year, prev_month, prev_last_day, 23, 59, 59, 999999, tzinfo=timezone.utc)

        # 1. Monthly cashflows
        total_income = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Income",
            Transaction.transaction_date >= start_of_month,
            Transaction.transaction_date <= end_of_month
        ).scalar() or 0.0

        total_expense = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Expense",
            Transaction.transaction_date >= start_of_month,
            Transaction.transaction_date <= end_of_month
        ).scalar() or 0.0

        total_savings = float(total_income) - float(total_expense)

        # 2. Budgets limit and remaining
        monthly_budget = self.db.query(func.sum(Budget.monthly_limit)).filter(
            Budget.user_id == user_id,
            Budget.month == today.month,
            Budget.year == today.year
        ).scalar() or 0.0

        # Find total spent on categories that have budgets this month
        budgeted_category_ids = [b.category_id for b in self.budget_repo.get_active(user_id, today)]
        if budgeted_category_ids:
            spent_on_budgeted = self.db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.category_id.in_(budgeted_category_ids),
                Transaction.transaction_type == "Expense",
                Transaction.transaction_date >= start_of_month,
                Transaction.transaction_date <= end_of_month
            ).scalar() or 0.0
        else:
            spent_on_budgeted = 0.0

        budget_remaining = float(monthly_budget) - float(spent_on_budgeted)

        # 3. Financial health scorecard
        latest_health = self.health_repo.get_latest_by_user(user_id)
        financial_health_score = latest_health.health_score if latest_health else 70

        # 4. Top category
        top_cat_query = self.db.query(
            Category.name,
            func.sum(Transaction.amount).label("total_spent")
        ).join(Category, Transaction.category_id == Category.id).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Expense",
            Transaction.transaction_date >= start_of_month,
            Transaction.transaction_date <= end_of_month
        ).group_by(Category.name).order_by(text("total_spent DESC")).first()

        top_category = top_cat_query[0] if top_cat_query else None

        # 5. Monthly income growth
        prev_income = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Income",
            Transaction.transaction_date >= start_of_prev_month,
            Transaction.transaction_date <= end_of_prev_month
        ).scalar() or 0.0

        if prev_income > 0:
            monthly_growth = round(((float(total_income) - float(prev_income)) / float(prev_income)) * 100, 2)
        else:
            monthly_growth = 0.0

        # 6. Average goal progress
        goals = self.goal_repo.get_by_user(user_id)
        if goals:
            total_pct = 0.0
            for g in goals:
                target = float(g.target_amount)
                current = float(g.current_amount)
                pct = (current / target) * 100 if target > 0 else 0.0
                total_pct += pct
            goal_progress = round(total_pct / len(goals), 2)
        else:
            goal_progress = 0.0

        # 7. Recent transactions list
        recent_txs = self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.transaction_date.desc()).limit(5).all()

        return DashboardSummaryResponse(
            total_income=float(total_income),
            total_expense=float(total_expense),
            total_savings=float(total_savings),
            monthly_budget=float(monthly_budget),
            budget_remaining=float(budget_remaining),
            financial_health_score=financial_health_score,
            top_category=top_category,
            monthly_growth=monthly_growth,
            goal_progress=goal_progress,
            recent_transactions=recent_txs
        )

    def get_analytics(self, user_id: Any) -> DashboardAnalyticsResponse:
        """Aggregate net worth, category distribution, and active budget usages details."""
        logger.info(f"Generating dashboard analytics calculations for user ID: {user_id}")
        
        # 1. Net Worth Calculation
        accounts = self.account_repo.get_by_user(user_id)
        net_worth = 0.0
        for acc in accounts:
            if acc.account_type in ["Savings", "Current", "Cash", "Wallet", "Investment"]:
                net_worth += float(acc.balance)
            elif acc.account_type in ["Credit Card"]:
                net_worth -= float(acc.balance)

        today = date.today()
        start_of_month = datetime(today.year, today.month, 1, tzinfo=timezone.utc)

        # 2. Monthly cashflows
        income_sum = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Income",
            Transaction.transaction_date >= start_of_month
        ).scalar() or 0.0

        expense_sum = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Expense",
            Transaction.transaction_date >= start_of_month
        ).scalar() or 0.0

        # 3. Active Budgets performance
        active_budgets = self.budget_repo.get_active(user_id, today)
        budget_usages = []
        for b in active_budgets:
            _, last_day = calendar.monthrange(b.year, b.month)
            b_start = datetime(b.year, b.month, 1, tzinfo=timezone.utc)
            b_end = datetime(b.year, b.month, last_day, 23, 59, 59, 999999, tzinfo=timezone.utc)
            
            spent = self.db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.category_id == b.category_id,
                Transaction.transaction_type == "Expense",
                Transaction.transaction_date >= b_start,
                Transaction.transaction_date <= b_end
            ).scalar() or 0.0
            
            spent_val = float(spent)
            limit_val = float(b.monthly_limit)
            pct = (spent_val / limit_val) * 100 if limit_val > 0 else 0.0
            
            budget_usages.append(
                BudgetUsage(
                    category_id=b.category_id,
                    category_name=b.category.name,
                    amount_limit=limit_val,
                    amount_spent=spent_val,
                    percentage_used=round(pct, 2),
                    is_over_budget=spent_val > limit_val
                )
            )

        # 4. Spending distribution by category
        categories_spend = self.db.query(
            Transaction.category_id,
            Category.name,
            Category.color,
            func.sum(Transaction.amount)
        ).join(Category, Transaction.category_id == Category.id).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "Expense",
            Transaction.transaction_date >= start_of_month
        ).group_by(Transaction.category_id, Category.name, Category.color).all()

        spending_breakdown = []
        total_monthly_expense = float(expense_sum)
        for cat_id, cat_name, cat_color, total_amt in categories_spend:
            amt_val = float(total_amt)
            pct = (amt_val / total_monthly_expense) * 100 if total_monthly_expense > 0 else 0.0
            spending_breakdown.append(
                CategorySpend(
                    category_id=cat_id,
                    category_name=cat_name,
                    total_amount=amt_val,
                    percentage_of_total=round(pct, 2),
                    color=cat_color
                )
            )

        # 5. Financial target progress metrics
        goals = self.goal_repo.get_by_user(user_id)
        goals_progress = []
        for g in goals:
            current_savings = float(g.current_amount)
            target = float(g.target_amount)
            pct = (current_savings / target) * 100 if target > 0 else 0.0
            goals_progress.append(
                GoalProgress(
                    goal_id=g.id,
                    name=g.title,
                    target_amount=target,
                    current_savings=current_savings,
                    percentage_complete=round(pct, 2)
                )
            )

        return DashboardAnalyticsResponse(
            net_worth=float(net_worth),
            monthly_income=float(income_sum),
            monthly_expense=float(expense_sum),
            active_budgets=budget_usages,
            spending_breakdown=spending_breakdown,
            goals_progress=goals_progress
        )
