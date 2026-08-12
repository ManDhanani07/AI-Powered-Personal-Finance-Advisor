"""
Dashboard Repository Integration Test Script.
Tests DashboardRepository aggregation queries against PostgreSQL database.
"""

import sys
import asyncio
from datetime import datetime, date
from decimal import Decimal
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database.session import AsyncSessionLocal
from app.repositories import (
    UserRepository,
    CategoryRepository,
    TransactionRepository,
    BudgetRepository,
    GoalRepository,
    DashboardRepository,
)
from app.core.logging import logger


async def run_dashboard_repository_tests():
    logger.info("=== Starting Dashboard Repository Verification Tests ===")

    async with AsyncSessionLocal() as db:
        # Setup: Create test data
        cat_repo = CategoryRepository(db)
        user_repo = UserRepository(db)
        tx_repo = TransactionRepository(db)
        budget_repo = BudgetRepository(db)
        goal_repo = GoalRepository(db)
        dashboard_repo = DashboardRepository(db)

        # Create test user
        test_email = f"dashboard_test_{int(datetime.utcnow().timestamp())}@fintech.com"
        test_user = await user_repo.create({
            "first_name": "Dashboard",
            "last_name": "Tester",
            "email": test_email,
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjOL.81F8Rkhh/xG4w2m7x.p/k1b5mX6C.",
            "monthly_income": Decimal("100000.00"),
            "is_verified": True,
            "is_active": True,
        })
        logger.info(f"[Setup] Created test user: {test_user.email}")

        # Get a category
        food_cat = await cat_repo.get_by_name("Food & Dining")
        if not food_cat:
            logger.error("Food & Dining category not found. Please seed database first.")
            return

        # Create income transaction
        income_tx = await tx_repo.create({
            "transaction_number": f"INC-{int(datetime.utcnow().timestamp() * 1000)}",
            "user_id": test_user.id,
            "category_id": food_cat.id,
            "title": "Monthly Salary",
            "transaction_type": "INCOME",
            "payment_method": "BANK",
            "amount": Decimal("100000.00"),
            "transaction_date": datetime.utcnow(),
        })
        logger.info(f"[Setup] Created income transaction: ₹{income_tx.amount}")

        # Create expense transaction
        expense_tx = await tx_repo.create({
            "transaction_number": f"EXP-{int(datetime.utcnow().timestamp() * 1000) + 1}",
            "user_id": test_user.id,
            "category_id": food_cat.id,
            "title": "Restaurant Dinner",
            "merchant": "Restaurant XYZ",
            "transaction_type": "EXPENSE",
            "payment_method": "UPI",
            "amount": Decimal("2500.00"),
            "transaction_date": datetime.utcnow(),
        })
        logger.info(f"[Setup] Created expense transaction: ₹{expense_tx.amount}")

        # Create budget
        today = date.today()
        budget = await budget_repo.create({
            "user_id": test_user.id,
            "category_id": food_cat.id,
            "budget_name": "Food Budget",
            "budget_amount": Decimal("15000.00"),
            "spent_amount": Decimal("2500.00"),
            "remaining_amount": Decimal("12500.00"),
            "start_date": today.replace(day=1),
            "end_date": today.replace(day=28),
            "status": "ACTIVE",
        })
        logger.info(f"[Setup] Created budget: {budget.budget_name}")

        # Create goal
        goal = await goal_repo.create({
            "user_id": test_user.id,
            "goal_name": "Emergency Fund",
            "goal_type": "SAVINGS",
            "target_amount": Decimal("500000.00"),
            "current_amount": Decimal("100000.00"),
            "target_date": date(2024, 12, 31),
            "priority": "HIGH",
            "status": "IN_PROGRESS",
        })
        logger.info(f"[Setup] Created goal: {goal.goal_name}")

        # Test 1: get_total_balance
        logger.info("\n--- Test 1: get_total_balance ---")
        total_balance = await dashboard_repo.get_total_balance(test_user.id)
        expected_balance = Decimal("100000.00") - Decimal("2500.00")
        logger.info(f"Total Balance: ₹{total_balance}")
        assert total_balance == expected_balance, f"Expected ₹{expected_balance}, got ₹{total_balance}"
        logger.info("✓ get_total_balance PASSED")

        # Test 2: get_monthly_totals
        logger.info("\n--- Test 2: get_monthly_totals ---")
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        monthly_totals = await dashboard_repo.get_monthly_totals(test_user.id, current_month, current_year)
        logger.info(f"Monthly Totals: {monthly_totals}")
        assert monthly_totals["INCOME"] == Decimal("100000.00"), "Income should be ₹100000"
        assert monthly_totals["EXPENSE"] == Decimal("2500.00"), "Expense should be ₹2500"
        logger.info("✓ get_monthly_totals PASSED")

        # Test 3: get_cash_flow_by_month
        logger.info("\n--- Test 3: get_cash_flow_by_month ---")
        start_date = datetime(current_year, current_month, 1)
        end_date = datetime.utcnow()
        cash_flow = await dashboard_repo.get_cash_flow_by_month(test_user.id, start_date, end_date)
        logger.info(f"Cash Flow Data: {cash_flow}")
        assert len(cash_flow) >= 1, "Should have at least 1 month of data"
        logger.info("✓ get_cash_flow_by_month PASSED")

        # Test 4: get_category_spending
        logger.info("\n--- Test 4: get_category_spending ---")
        category_spending = await dashboard_repo.get_category_spending(test_user.id, current_month, current_year)
        logger.info(f"Category Spending: {category_spending}")
        assert len(category_spending) >= 1, "Should have at least 1 category"
        assert category_spending[0]["total_amount"] == Decimal("2500.00"), "Should have ₹2500 in spending"
        logger.info("✓ get_category_spending PASSED")

        # Test 5: get_active_budgets_summary
        logger.info("\n--- Test 5: get_active_budgets_summary ---")
        active_budgets = await dashboard_repo.get_active_budgets_summary(test_user.id)
        logger.info(f"Active Budgets: {len(active_budgets)} found")
        assert len(active_budgets) >= 1, "Should have at least 1 active budget"
        logger.info("✓ get_active_budgets_summary PASSED")

        # Test 6: get_goals_summary
        logger.info("\n--- Test 6: get_goals_summary ---")
        goals_summary = await dashboard_repo.get_goals_summary(test_user.id)
        logger.info(f"Goals Summary: {goals_summary}")
        assert goals_summary["IN_PROGRESS"]["count"] >= 1, "Should have at least 1 IN_PROGRESS goal"
        logger.info("✓ get_goals_summary PASSED")

        # Test 7: get_payment_method_distribution
        logger.info("\n--- Test 7: get_payment_method_distribution ---")
        payment_dist = await dashboard_repo.get_payment_method_distribution(test_user.id, current_month, current_year)
        logger.info(f"Payment Distribution: {payment_dist}")
        assert len(payment_dist) >= 1, "Should have at least 1 payment method"
        logger.info("✓ get_payment_method_distribution PASSED")

        # Cleanup
        await user_repo.delete(test_user.id, hard=True)
        logger.info(f"\n[Cleanup] Deleted test user {test_user.id} and cascaded records")

    logger.info("\n=== All Dashboard Repository Tests PASSED Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_dashboard_repository_tests())
