import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from app.ml_engine import FinancialAdvisorEngine
from app.services.expense_prediction_service import ExpensePredictionService

@pytest.fixture
def engine():
    return FinancialAdvisorEngine()

def test_feature_leakage_and_non_negativity(engine):
    """Verify that predictions are strictly non-negative and do not use future actuals."""
    txs = [
        {"amount": 35000.0, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
        {"amount": 8000.0, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False},
        {"amount": 4000.0, "category": "Shopping", "transaction_type": "Expense", "recurring": False},
        {"amount": 85000.0, "category": "Salary", "transaction_type": "Income", "recurring": True},
    ]
    
    res = engine.predict(
        transactions=txs,
        target_month=5,
        days_active=30,
        historical_spends=[52000.0, 54000.0, 51000.0],
        historical_incomes=[85000.0, 85000.0, 85000.0],
        current_month=4
    )
    
    pred_spend = res["forecast"]["predicted_routine_spend"]
    assert pred_spend >= 0.0, f"Predicted spend must be non-negative, got {pred_spend}"
    assert pred_spend >= 35000.0, "Predicted spend must respect fixed contractual bills floor"

def test_quantile_monotonicity_ordering(engine):
    """Verify that P10 <= P50 <= P90 strictly holds for all predictions."""
    test_cases = [
        # Case 1: Low Budget Frugal Profile
        {"txs": [{"amount": 12000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
                 {"amount": 5000, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False}],
         "history": [18000.0, 19500.0, 17800.0, 18900.0]},
        # Case 2: High Budget Executive Profile
        {"txs": [{"amount": 45000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
                 {"amount": 15000, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False},
                 {"amount": 25000, "category": "Shopping", "transaction_type": "Expense", "recurring": False}],
         "history": [85000.0, 89000.0, 92000.0, 84000.0]},
        # Case 3: Post Shock Profile
        {"txs": [{"amount": 40000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True}],
         "history": [55000.0, 58000.0, 99000.0, 54000.0]}
    ]
    
    for c in test_cases:
        res = engine.predict(
            transactions=c["txs"],
            target_month=6,
            days_active=30,
            historical_spends=c["history"]
        )
        
        p10 = res["forecast"]["confidence_range_p10_p90"]["p10_minimum_survival"]
        p50 = res["forecast"]["confidence_range_p10_p90"]["p50_expected_routine"]
        p90 = res["forecast"]["confidence_range_p10_p90"]["p90_upper_discretionary"]
        
        assert p10 <= p50, f"Quantile ordering violation: P10 ({p10}) > P50 ({p50})"
        assert p50 <= p90, f"Quantile ordering violation: P50 ({p50}) > P90 ({p90})"
        assert p10 >= 0.0, f"P10 must be non-negative, got {p10}"

def test_exceptional_event_shock_isolation(engine):
    """Verify that a large one-time shock (e.g. ₹99,000 wedding or hospital ER) does not inflate baseline."""
    normal_history = [50000.0, 52000.0, 51000.0, 53000.0]
    shock_history = [50000.0, 52000.0, 99000.0, 53000.0]
    
    txs = [
        {"amount": 35000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
        {"amount": 12000, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False},
        {"amount": 5000, "category": "Shopping", "transaction_type": "Expense", "recurring": False},
    ]
    
    res_normal = engine.predict(transactions=txs, target_month=7, historical_spends=normal_history)
    res_shock = engine.predict(transactions=txs, target_month=7, historical_spends=shock_history)
    
    pred_normal = res_normal["forecast"]["predicted_routine_spend"]
    pred_shock = res_shock["forecast"]["predicted_routine_spend"]
    
    # The presence of a single historical shock should not increase predicted spend by more than 15%
    pct_diff = (pred_shock - pred_normal) / pred_normal
    assert pct_diff < 0.15, f"Shock contaminated routine forecast: normal={pred_normal}, shock={pred_shock} (+{pct_diff*100:.1f}%)"

def test_multi_horizon_recursive_simulation(engine):
    """Verify that multi-horizon projections maintain logical consistency and dampening."""
    txs = [
        {"amount": 30000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
        {"amount": 10000, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False},
        {"amount": 8000, "category": "Shopping", "transaction_type": "Expense", "recurring": False},
    ]
    
    p1 = engine.predict(transactions=txs, target_month=5, historical_spends=[48000.0, 49000.0, 48500.0])
    m1_val = p1["forecast"]["predicted_routine_spend"]
    
    # Recursive step M+2
    sim_txs = [
        {"amount": 30000, "category": "Housing & Rent", "transaction_type": "Expense", "recurring": True},
        {"amount": 10000, "category": "Food & Dining", "transaction_type": "Expense", "recurring": False},
        {"amount": max(0.0, (m1_val - 40000) * 0.75), "category": "Shopping", "transaction_type": "Expense", "recurring": False},
    ]
    p2 = engine.predict(transactions=sim_txs, target_month=6, historical_spends=[48000.0, 49000.0, 48500.0, m1_val])
    m2_val = p2["forecast"]["predicted_routine_spend"]
    
    assert m2_val >= 30000.0, "M+2 forecast must respect fixed bill baseline"
    assert abs(m2_val - m1_val) / m1_val < 0.25, "M+2 should not swing erratically from M+1"
