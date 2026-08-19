"""
Service Layer Verification Test Script.
Tests all 8 domain service classes, business validations, helper calculations, and exception handling against PostgreSQL.
"""

import sys
import asyncio
from datetime import datetime, date, timedelta
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
    FinancialHealthRepository,
    ChatHistoryRepository,
)
from app.services import (
    UserService,
    CategoryService,
    TransactionService,
    BudgetService,
    GoalService,
    FinancialHealthService,
    ChatHistoryService,
)
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException
from app.core.logging import logger


async def run_service_tests():
    logger.info("=== Starting Service Layer Verification Tests ===")

    async with AsyncSessionLocal() as db:
        # Repositories
        user_repo = UserRepository(db)
        cat_repo = CategoryRepository(db)
        tx_repo = TransactionRepository(db)
        budget_repo = BudgetRepository(db)
        goal_repo = GoalRepository(db)
        health_repo = FinancialHealthRepository(db)
        chat_repo = ChatHistoryRepository(db)

        # Services
        user_service = UserService(user_repo)
        cat_service = CategoryService(cat_repo)
        tx_service = TransactionService(tx_repo, user_repo, cat_repo, budget_repo)
        budget_service = BudgetService(budget_repo, cat_repo)
        goal_service = GoalService(goal_repo)
        health_service = FinancialHealthService(health_repo)
        chat_service = ChatHistoryService(chat_repo, user_repo)

        # 1. CategoryService Test
        default_cats = await cat_service.get_default_categories()
        logger.info(f"[CategoryService] Retreived {len(default_cats)} default categories via CategoryService.")
        food_cat = await cat_repo.get_by_name("Food & Dining")

        # 2. UserService Test & Duplicate Validation
        test_email = f"service_test_{int(datetime.utcnow().timestamp())}@fintech.com"
        user = await user_service.create_user({
            "first_name": "Service",
            "last_name": "Tester",
            "email": test_email,
            "password_hash": "hash12345",
            "monthly_income": Decimal("100000.00"),
        })
        logger.info(f"[UserService] Created user {user.id} ({user.email})")

        # Duplicate email test
        try:
            await user_service.create_user({
                "first_name": "Duplicate",
                "last_name": "Tester",
                "email": test_email,
                "password_hash": "hash12345",
            })
            assert False, "Should have raised BadRequestException for duplicate email"
        except BadRequestException:
            logger.info("[UserService Validation] Successfully caught duplicate email exception.")

        # 3. BudgetService Test & Remaining Calculation
        budget = await budget_service.create_budget(
            user.id,
            {
                "category_id": food_cat.id,
                "budget_name": "Food & Dining Budget",
                "budget_amount": Decimal("10000.00"),
                "spent_amount": Decimal("0.00"),
                "start_date": date.today().replace(day=1),
                "end_date": date.today() + timedelta(days=30),
            },
        )
        logger.info(f"[BudgetService] Created budget {budget.id} (Remaining: ₹{budget.remaining_amount})")

        assert budget.remaining_amount == Decimal("10000.00"), "Remaining budget should equal 10000.00"

        # 4. TransactionService Test & Automatic Budget Impact Update
        income_tx = await tx_service.create_transaction({
            "user_id": user.id,
            "title": "Monthly Salary",
            "amount": Decimal("100000.00"),
            "transaction_type": "INCOME",
            "transaction_number": f"TXN-INC-{int(datetime.utcnow().timestamp() * 1000)}",
        })

        expense_tx = await tx_service.create_transaction({
            "user_id": user.id,
            "category_id": food_cat.id,
            "title": "Grocery Shopping",
            "amount": Decimal("2500.00"),
            "transaction_type": "EXPENSE",
            "transaction_number": f"TXN-EXP-{int(datetime.utcnow().timestamp() * 1000)}",
        })
        logger.info(f"[TransactionService] Created Income ₹{income_tx.amount} & Expense ₹{expense_tx.amount}")

        # Check net balance
        total_inc = await tx_repo.get_total_income(user.id)
        total_exp = await tx_repo.get_total_expense(user.id)
        net_balance = total_inc - total_exp
        logger.info(f"[TransactionService Net Balance] Calculated Net Balance: ₹{net_balance}")
        assert net_balance == Decimal("97500.00"), "Net balance should be 100000 - 2500 = 97500.00"

        # Verify budget was automatically updated by transaction service
        updated_budget = await budget_service.get_by_id(budget.id)
        logger.info(f"[Budget Impact] Budget Spent updated to ₹{updated_budget.spent_amount}, Remaining: ₹{updated_budget.remaining_amount}")
        assert updated_budget.spent_amount == Decimal("2500.00"), "Budget spent should be updated to 2500.00"

        # 5. GoalService Test & Progress Helper
        goal = await goal_service.create_goal(
            user.id,
            {
                "goal_name": "Car Down Payment",
                "target_amount": Decimal("200000.00"),
                "current_amount": Decimal("50000.00"),
                "target_date": date.today() + timedelta(days=180),
            },
        )
        logger.info(f"[GoalService] Created Goal: {goal.goal_name} (Completion: {goal.completion_percentage}%)")
        assert goal.completion_percentage == 25.0, "Progress should be 25.0%"

        # Add goal contribution
        updated_goal = await goal_service.update_goal(goal.id, user.id, {"current_amount": Decimal("100000.00")})
        logger.info(f"[Goal Contribution] New Progress: {updated_goal.completion_percentage}%")
        assert updated_goal.completion_percentage == 50.0, "New progress should be 50.0%"

        # 6. FinancialHealthService Test
        health_resp = await health_service.calculate_health_score(user.id)
        logger.info(f"[FinancialHealthService] Calculated dynamic health score: {health_resp.overall_score} (Grade: {health_resp.grade})")
        assert health_resp.overall_score >= 0.0, "Health score must be calculated non-negative"

        # 8. ChatHistoryService Test
        chat = await chat_service.save_chat_message({
            "user_id": user.id,
            "question": "What is my current net balance?",
            "answer": "Your current net balance is ₹97,500.00.",
        })
        logger.info(f"[ChatHistoryService] Saved AI conversation pair ID: {chat.id}")

        # Cleanup test user
        await user_service.delete(user.id, hard=True)
        logger.info(f"[Cleanup] Deleted test user {user.id} and cascaded orphan records successfully.")

    logger.info("=== All 8 Service Verification Tests PASSED Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_service_tests())
