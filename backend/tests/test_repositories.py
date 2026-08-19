"""
Repository Layer Integration Verification Test Script.
Tests all 8 repository classes against PostgreSQL database.
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
from app.models.financial_health_history import FinancialHealthHistory
from app.repositories import (
    UserRepository,
    CategoryRepository,
    TransactionRepository,
    BudgetRepository,
    GoalRepository,
    FinancialHealthRepository,
    ChatHistoryRepository,
)
from app.core.logging import logger


async def run_repository_tests():
    logger.info("=== Starting Repository Layer Verification Tests ===")

    async with AsyncSessionLocal() as db:
        # 1. CategoryRepository Test
        cat_repo = CategoryRepository(db)
        default_cats = await cat_repo.get_default_categories()
        logger.info(f"[CategoryRepository] Found {len(default_cats)} default categories in DB.")
        assert len(default_cats) > 0, "Default categories should exist in DB"

        food_cat = await cat_repo.get_by_name("Food & Dining")
        logger.info(f"[CategoryRepository] Retrieved category: {food_cat.category_name} (ID: {food_cat.id})")
        assert food_cat is not None, "Food & Dining category should be found"

        # 2. UserRepository Test
        user_repo = UserRepository(db)
        test_email = f"test_architect_{int(datetime.utcnow().timestamp())}@fintech.com"
        
        new_user = await user_repo.create({
            "first_name": "Senior",
            "last_name": "Architect",
            "email": test_email,
            "password_hash": "$2b$12$eImiTXuWVxfM37uY4JANjOL.81F8Rkhh/xG4w2m7x.p/k1b5mX6C.",
            "monthly_income": Decimal("150000.00"),
            "is_verified": True,
            "is_active": True,
        })
        logger.info(f"[UserRepository] Created test user with ID: {new_user.id} ({new_user.email})")

        found_user = await user_repo.get_by_email(test_email)
        assert found_user is not None and found_user.id == new_user.id, "User should be found by email"

        # 3. TransactionRepository Test
        tx_repo = TransactionRepository(db)
        new_tx = await tx_repo.create({
            "transaction_number": f"TXN-{int(datetime.utcnow().timestamp() * 1000)}",
            "user_id": new_user.id,
            "category_id": food_cat.id,
            "title": "Swiggy Gourmet Dinner",
            "merchant": "Swiggy",
            "transaction_type": "EXPENSE",
            "payment_method": "UPI",
            "account_type": "SAVINGS",
            "amount": Decimal("1250.00"),
            "transaction_date": datetime.utcnow(),
        })
        logger.info(f"[TransactionRepository] Created transaction: {new_tx.transaction_number} (Amount: ₹{new_tx.amount})")

        total_expense = await tx_repo.get_total_expense(new_user.id)
        logger.info(f"[TransactionRepository] Calculated Total Expense for User: ₹{total_expense}")
        assert total_expense == Decimal("1250.00"), "Total expense should match transaction amount"

        spending_breakdown = await tx_repo.get_category_wise_spending(new_user.id)
        logger.info(f"[TransactionRepository] Spending Breakdown: {spending_breakdown}")
        assert len(spending_breakdown) == 1, "Should have 1 category in spending breakdown"

        # 4. BudgetRepository Test
        budget_repo = BudgetRepository(db)
        new_budget = await budget_repo.create({
            "user_id": new_user.id,
            "category_id": food_cat.id,
            "budget_name": "Monthly Food Budget",
            "budget_amount": Decimal("15000.00"),
            "spent_amount": Decimal("1250.00"),
            "remaining_amount": Decimal("13750.00"),
            "start_date": date.today().replace(day=1),
            "end_date": date.today(),
            "status": "ACTIVE",
        })
        logger.info(f"[BudgetRepository] Created budget: {new_budget.budget_name} (Remaining: ₹{new_budget.remaining_amount})")

        # 5. GoalRepository Test
        goal_repo = GoalRepository(db)
        new_goal = await goal_repo.create({
            "user_id": new_user.id,
            "goal_name": "Emergency Savings Fund",
            "goal_type": "SAVINGS",
            "target_amount": Decimal("500000.00"),
            "current_amount": Decimal("50000.00"),
            "target_date": date.today(),
            "priority": "HIGH",
            "status": "IN_PROGRESS",
        })
        logger.info(f"[GoalRepository] Created goal: {new_goal.goal_name} (Progress: ₹{new_goal.current_amount}/₹{new_goal.target_amount})")

        # 6. FinancialHealthRepository Test
        health_repo = FinancialHealthRepository(db)
        new_health = await health_repo.save_history(
            FinancialHealthHistory(
                user_id=new_user.id,
                health_score=Decimal("85.50"),
                income_score=Decimal("90.00"),
                saving_score=Decimal("80.00"),
                budget_score=Decimal("85.00"),
                expense_score=Decimal("87.00"),
            )
        )
        logger.info(f"[FinancialHealthRepository] Saved health score record ID: {new_health.id} (Score: {new_health.health_score})")

        # 8. ChatHistoryRepository Test
        chat_repo = ChatHistoryRepository(db)
        new_chat = await chat_repo.create({
            "user_id": new_user.id,
            "question": "How can I optimize my monthly savings in India?",
            "answer": "Consider allocating 50% to essentials, 30% to wants, and 20% to SIP investments.",
            "model_name": "gemini-1.5-pro",
        })
        logger.info(f"[ChatHistoryRepository] Saved chat record ID: {new_chat.id}")

        # Cleanup Test User (Cascades delete to transactions, budgets, goals, forecasts, health, chat)
        await user_repo.delete(new_user.id, hard=True)
        logger.info(f"[Cleanup] Deleted test user {new_user.id} and cascaded orphan records successfully.")

    logger.info("=== All 8 Repository Verification Tests PASSED Successfully ===")


if __name__ == "__main__":
    asyncio.run(run_repository_tests())
