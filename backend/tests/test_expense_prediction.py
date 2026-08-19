"""
Automated Verification Tests for Expense Prediction Service & ML Engine.
"""

import sys
import asyncio
from uuid import uuid4
from datetime import datetime

from app.database.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.transaction_repository import TransactionRepository
from app.services.expense_prediction_service import ExpensePredictionService
from app.schemas.expense_prediction import PredictionScenarioRequest
from app.models.user import User
from app.models.transaction import Transaction


async def run_tests():
    print("=== Testing ExpensePredictionService with PostgreSQL Session ===")
    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        cat_repo = CategoryRepository(db)
        tx_repo = TransactionRepository(db)

        # 1. Create temporary test user
        test_email = f"pred_test_{int(datetime.utcnow().timestamp())}@fintech.com"
        user = User(
            email=test_email,
            password_hash="test_hash",
            first_name="Prediction",
            last_name="Tester",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"Created test user: {user.id} ({user.email})")

        # 2. Get category IDs
        food_cat = await cat_repo.get_by_name("Food & Dining")
        salary_cat = await cat_repo.get_by_name("Salary")
        food_id = food_cat.id if food_cat else None
        salary_id = salary_cat.id if salary_cat else None

        # 3. Add transactions
        t1 = Transaction(
            transaction_number=f"TXN-{int(datetime.utcnow().timestamp())}-1",
            user_id=user.id,
            category_id=salary_id,
            title="Monthly Salary",
            amount=100000.0,
            transaction_type="INCOME",
            transaction_date=datetime.utcnow(),
            description="Monthly Salary",
            is_recurring=True,
        )
        t2 = Transaction(
            transaction_number=f"TXN-{int(datetime.utcnow().timestamp())}-2",
            user_id=user.id,
            category_id=food_id,
            title="Dining & Grocery",
            amount=25000.0,
            transaction_type="EXPENSE",
            transaction_date=datetime.utcnow(),
            description="Dining & Grocery",
            is_recurring=False,
        )
        db.add_all([t1, t2])
        await db.commit()
        print("Logged sample income and expense transactions in PostgreSQL.")

        # 4. Run service forecast
        service = ExpensePredictionService(transaction_repository=tx_repo, category_repository=cat_repo)
        forecast_res = await service.get_user_prediction(user_id=user.id, target_month=10)
        print(f"[Forecast Result]: Predicted Spend = INR {forecast_res.forecast.predicted_routine_spend}")
        print(f"[Confidence Bounds]: P10 = {forecast_res.forecast.confidence_range_p10_p90.p10_minimum_survival}, P90 = {forecast_res.forecast.confidence_range_p10_p90.p90_upper_discretionary}")
        print(f"[Safe Ceiling]: INR {forecast_res.forecast.safe_total_budget_ceiling}")
        print(f"[Health Audit]: Risk Status = {forecast_res.financial_health_audit.risk_status}")

        assert forecast_res.forecast.predicted_routine_spend > 0, "Forecast routine spend should be > 0"
        assert forecast_res.forecast.safe_total_budget_ceiling >= forecast_res.forecast.predicted_routine_spend, "Safe ceiling must cover predicted spend"

        # 5. Run scenario simulation
        sim_payload = PredictionScenarioRequest(
            target_month=10,
            income_growth_pct=20.0,
            discretionary_spend_adj_pct=-15.0,
        )
        sim_res = await service.simulate_scenario(user_id=user.id, payload=sim_payload)
        print(f"[Simulation Result]: New Projected Income = INR {sim_res.sanitized_summary.robust_income}, Projected Savings = INR {sim_res.forecast.estimated_monthly_savings}")
        assert sim_res.sanitized_summary.robust_income > forecast_res.sanitized_summary.robust_income

        # 6. Verify Metadata
        meta = service.get_engine_metadata()
        print(f"[Model Metadata]: Engine = {meta.engine_name}, R2 = {meta.verified_r2_score}, Accuracy = {meta.verified_wpa_accuracy}%")
        assert meta.verified_r2_score >= 0.99

        # Cleanup
        await user_repo.delete(user.id)
        await db.commit()
        print("Cleanup: Deleted test user successfully.")
        print("=== ALL EXPENSE PREDICTION TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    asyncio.run(run_tests())
