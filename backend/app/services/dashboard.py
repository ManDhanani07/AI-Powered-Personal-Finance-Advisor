from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timezone
from typing import Any
from app.repositories.account import AccountRepository
from app.repositories.transaction import TransactionRepository
from app.repositories.budget import BudgetRepository
from app.repositories.goal import GoalRepository
from app.schemas.dashboard import DashboardSummaryResponse, BudgetUsage, CategorySpend, GoalProgress
from app.models.transaction import Transaction
from app.models.category import Category
from app.core.logging import logger

class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.account_repo = AccountRepository(db)
        self.tx_repo = TransactionRepository(db)
        self.budget_repo = BudgetRepository(db)
        self.goal_repo = GoalRepository(db)

    def get_summary(self, user_id: Any) -> DashboardSummaryResponse:
        """Aggregate all user financial metadata into dashboard statistics with trace logging."""
        logger.info(f"Generating dashboard summary calculations for user ID: {user_id}")
        
        # 1. Net Worth Calculation
        accounts = self.account_repo.get_by_user(user_id)
        net_worth = 0.0
        for acc in accounts:
            if acc.type in ["checking", "savings", "cash", "investment"]:
                net_worth += float(acc.balance)
            elif acc.type in ["credit_card", "loan"]:
                net_worth -= float(acc.balance)

        # 2. Monthly cashflows
        today = date.today()
        start_of_month = datetime(today.year, today.month, 1, tzinfo=timezone.utc)
        
        income_sum = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.status == "completed",
            Transaction.transaction_date >= start_of_month
        ).scalar() or 0.0

        expense_sum = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.status == "completed",
            Transaction.transaction_date >= start_of_month
        ).scalar() or 0.0

        # 3. Active Budgets performance
        active_budgets = self.budget_repo.get_active(user_id, today)
        budget_usages = []
        for b in active_budgets:
            b_start = datetime.combine(b.start_date, datetime.min.time(), tzinfo=timezone.utc)
            b_end = datetime.combine(b.end_date, datetime.max.time(), tzinfo=timezone.utc)
            
            spent = self.db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.category_id == b.category_id,
                Transaction.type == "expense",
                Transaction.status == "completed",
                Transaction.transaction_date >= b_start,
                Transaction.transaction_date <= b_end
            ).scalar() or 0.0
            
            spent_val = float(spent)
            limit_val = float(b.amount_limit)
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
            Transaction.type == "expense",
            Transaction.status == "completed",
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
            current_savings = sum(float(c.amount) for c in g.contributions)
            target = float(g.target_amount)
            pct = (current_savings / target) * 100 if target > 0 else 0.0
            goals_progress.append(
                GoalProgress(
                    goal_id=g.id,
                    name=g.name,
                    target_amount=target,
                    current_savings=current_savings,
                    percentage_complete=round(pct, 2)
                )
            )

        logger.info(f"Dashboard summary generated successfully for user ID {user_id}")
        return DashboardSummaryResponse(
            net_worth=float(net_worth),
            monthly_income=float(income_sum),
            monthly_expense=float(expense_sum),
            active_budgets=budget_usages,
            spending_breakdown=spending_breakdown,
            goals_progress=goals_progress
        )
