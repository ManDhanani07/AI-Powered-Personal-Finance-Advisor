"""
Automated Verification for Real-Life Based Spike vs Routine Prediction.
Tests:
1. File 2 (1-Month Dataset, May 2046): clean routine living, no shocks -> verified standard liquidity buffer & accurate 1-month narrative.
2. Health Emergency Shock (e.g. November hospital/surgery): isolated, de-spiked routine forecast, calibrated emergency buffer.
3. Holiday/Travel Surge (e.g. vacation flights/resort): isolated, not repeated next month.
4. Recurring from start: regular ongoing grocery/food/rent expenses occurring each month are fully preserved as routine.
"""

import pytest
from uuid import uuid4
from datetime import datetime
from app.ml_engine import FinancialAdvisorEngine
from app.services.expense_prediction_service import ExpensePredictionService


class MockCategory:
    def __init__(self, name):
        self.category_name = name
        self.name = name


class MockTx:
    def __init__(self, amount, category_name, tx_type, dt, is_recurring=False, desc=""):
        self.amount = amount
        self.category = MockCategory(category_name)
        self.transaction_type = tx_type
        self.transaction_date = dt
        self.is_recurring = is_recurring
        self.description = desc


class MockTxRepo:
    def __init__(self, txs):
        self._txs = txs

    async def get_by_user(self, user_id, page_size=1000):
        class PageResult:
            def __init__(self, items):
                self.items = items
        return PageResult(self._txs)


@pytest.mark.anyio
async def test_file2_one_month_clean_dataset_no_shocks():
    """File 2 May 2046: 1-month dataset with 36 routine transactions (no shocks)."""
    txs = [
        MockTx(95442.0, "Salary", "INCOME", datetime(2046, 5, 1), is_recurring=True, desc="Monthly Salary"),
        MockTx(20000.0, "Housing & Rent", "EXPENSE", datetime(2046, 5, 2), is_recurring=True, desc="House Rent"),
        MockTx(6000.0, "Utilities", "EXPENSE", datetime(2046, 5, 5), is_recurring=True, desc="Electricity & Broadband"),
    ]
    for day in range(6, 31):
        txs.append(MockTx(850.0, "Groceries", "EXPENSE", datetime(2046, 5, day), is_recurring=False, desc="Supermarket items"))

    service = ExpensePredictionService(transaction_repository=MockTxRepo(txs))
    res = await service.get_user_prediction(user_id=uuid4(), target_month=6)

    # Verifications
    assert not res.forecast.has_isolated_spike, "File 2 clean dataset must NOT have isolated spikes"
    assert res.forecast.detected_spike_type is None
    assert "standard liquidity safety reserve" in res.forecast.shock_source_label
    assert res.forecast.ai_regime_label == "AI Regime: Routine Living"
    assert "Nov accident spike" not in res.forecast.shock_source_label
    assert "November's vehicle repair & hospital treatment" not in (res.forecast.ai_assessment_text or "")
    assert "1 month of verified living history" in res.forecast.ai_assessment_text
    assert res.forecast.predicted_routine_spend > 0
    assert res.sanitized_summary.recurring_from_start_amount > 0


@pytest.mark.anyio
async def test_health_emergency_isolated_spike():
    """Multi-month dataset where a health emergency shock occurred in November."""
    txs = []
    for m in [9, 10, 11]:
        txs.append(MockTx(90000.0, "Salary", "INCOME", datetime(2045, m, 1), is_recurring=True, desc="Salary"))
        txs.append(MockTx(20000.0, "Housing & Rent", "EXPENSE", datetime(2045, m, 2), is_recurring=True, desc="House Rent"))
        txs.append(MockTx(15000.0, "Groceries", "EXPENSE", datetime(2045, m, 10), is_recurring=False, desc="Monthly groceries"))
        txs.append(MockTx(5000.0, "Food & Dining", "EXPENSE", datetime(2045, m, 15), is_recurring=False, desc="Dining"))

    # In November, a major hospital surgery shock occurs
    txs.append(MockTx(31038.0, "Healthcare", "EXPENSE", datetime(2045, 11, 20), is_recurring=False, desc="Emergency hospital surgery and ICU treatment"))

    service = ExpensePredictionService(transaction_repository=MockTxRepo(txs))
    res = await service.get_user_prediction(user_id=uuid4(), target_month=12)

    # Verifications
    assert res.forecast.has_isolated_spike, "Should detect isolated health emergency spike"
    assert res.forecast.detected_spike_type == "HEALTH_EMERGENCY"
    assert res.forecast.detected_spike_amount == 31038.0
    assert "medical emergency spike" in res.forecast.shock_source_label.lower()
    assert res.forecast.ai_regime_label == "AI Regime: Routine Living (De-Spiked)"
    # Routine prediction must NOT carry the 31k into next month
    assert res.forecast.predicted_routine_spend < 55000.0, f"Predicted routine spend should be de-spiked, got {res.forecast.predicted_routine_spend}"
    # Emergency scenario spend must reflect the shock
    emergency_scenario = next(s for s in res.forecast.scenarios if s.id == "emergency")
    assert emergency_scenario.predicted_spend >= res.forecast.predicted_routine_spend + 30000.0


@pytest.mark.anyio
async def test_holiday_travel_isolated_spike():
    """Holiday vacation / flight / resort spike should be isolated and de-spiked for next month."""
    txs = []
    for m in [5, 6]:
        txs.append(MockTx(100000.0, "Salary", "INCOME", datetime(2046, m, 1), is_recurring=True, desc="Salary"))
        txs.append(MockTx(25000.0, "Housing & Rent", "EXPENSE", datetime(2046, m, 2), is_recurring=True, desc="House Rent"))
        txs.append(MockTx(12000.0, "Groceries", "EXPENSE", datetime(2046, m, 10), is_recurring=False, desc="Groceries"))

    # In June, an isolated holiday vacation flight & resort booking occurs
    txs.append(MockTx(28500.0, "Travel & Vacation", "EXPENSE", datetime(2046, 6, 18), is_recurring=False, desc="Holiday vacation resort booking and flight tickets"))

    service = ExpensePredictionService(transaction_repository=MockTxRepo(txs))
    res = await service.get_user_prediction(user_id=uuid4(), target_month=7)

    assert res.forecast.has_isolated_spike, "Should detect holiday travel spike"
    assert res.forecast.detected_spike_type == "HOLIDAY_TRAVEL"
    assert res.forecast.detected_spike_amount == 28500.0
    assert "holiday travel surge" in res.forecast.shock_source_label.lower()
    assert "Routine Living (De-Spiked)" in res.forecast.ai_regime_label
    # Verify next month's predicted routine is de-spiked (not inflated by 28.5k vacation)
    assert res.forecast.predicted_routine_spend < 50000.0


@pytest.mark.anyio
async def test_recurring_from_start_preservation():
    """Regular ongoing grocery & food commitments (>15,000) are recognized from start and NOT stripped as shocks."""
    txs = []
    for m in [1, 2, 3]:
        txs.append(MockTx(90000.0, "Salary", "INCOME", datetime(2046, m, 1), is_recurring=True, desc="Salary"))
        txs.append(MockTx(22000.0, "Housing & Rent", "EXPENSE", datetime(2046, m, 2), is_recurring=True, desc="House Rent"))
        # Groceries of 18,000 occurring every single month
        txs.append(MockTx(18000.0, "Groceries", "EXPENSE", datetime(2046, m, 12), is_recurring=False, desc="Monthly family supermarket groceries"))

    service = ExpensePredictionService(transaction_repository=MockTxRepo(txs))
    res = await service.get_user_prediction(user_id=uuid4(), target_month=4)

    # Groceries must NOT be classified as shock
    assert not res.forecast.has_isolated_spike
    assert res.sanitized_summary.recurring_from_start_amount >= 35000.0
    assert res.forecast.predicted_routine_spend >= 38000.0, "Predicted routine must include recurring rent + regular groceries"
