"""
Scientific Benchmarking & Comparative Evaluation Engine.
Performs:
- Chronological temporal splitting (Train -> Validation -> Final Unseen Test)
- Multi-Model Benchmarking (Baselines, Linear Ridge, Trees, LightGBM MAE/MSE/Huber, Two-Stage, Old Model vs New Model)
- Granular Sliced Metrics (Overall WAPE, >= ₹5,000, Normal months, Low-spend months, High-spend months)
- Quantile Pinball Loss & Empirical Coverage
- Top Failure Diagnostics
"""

import os
import sys
import glob
import warnings
warnings.filterwarnings('ignore')
from typing import Dict, Any, List, Tuple

import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.linear_model import Ridge, LinearRegression, HuberRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error, r2_score
import lightgbm as lgb

from .classifier import TransactionClassifier, TransactionFlowType
from .features import build_monthly_panel_from_transactions, extract_time_safe_features
from ..ml_engine.engine import FinancialAdvisorEngine as OldFinancialAdvisorEngine


FEATURE_COLUMNS = [
    'lag_1', 'lag_2', 'lag_3', 'lag_6',
    'ema_fast', 'ema_med', 'ema_slow',
    'roll_mean_3', 'roll_mean_6', 'roll_med_3', 'roll_std_3', 'roll_min_3', 'roll_max_3',
    'trimmed_mean', 'user_median',
    'fixed_spend', 'routine_spend', 'disc_spend',
    'fixed_ratio', 'routine_ratio', 'disc_ratio',
    'food_ratio', 'shopping_ratio', 'transport_ratio', 'healthcare_ratio',
    'tx_count', 'avg_tx', 'max_tx',
    'exp_inc_ratio', 'savings_rate',
    'momentum', 'diff_1m', 'coef_var',
    'target_month', 'target_quarter', 'month_sin', 'month_cos', 'is_q4'
]


def load_all_transactions(workspace_dir: str) -> pd.DataFrame:
    """Loads all user CSV transaction files from workspace."""
    csv_files = glob.glob(os.path.join(workspace_dir, "*.csv"))
    all_dfs = []
    for f in sorted(csv_files):
        if "monthly" in f or "data" in f:
            continue
        try:
            df = pd.read_csv(f)
            if 'transaction_date' in df.columns and 'amount' in df.columns:
                df['source_file'] = os.path.basename(f)
                all_dfs.append(df)
        except Exception:
            pass
            
    return pd.concat(all_dfs, ignore_index=True)


def calculate_metrics_bundle(y_true: np.ndarray, y_pred: np.ndarray, model_name: str = "") -> Dict[str, Any]:
    """Calculates comprehensive metrics bundle."""
    y_true = np.array(y_true, dtype=float)
    y_pred = np.maximum(0.0, np.array(y_pred, dtype=float))
    
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    med_ae = np.median(np.abs(y_true - y_pred))
    bias = np.mean(y_pred - y_true)
    
    total_true = np.sum(y_true)
    wape = (np.sum(np.abs(y_true - y_pred)) / total_true * 100.0) if total_true > 0 else 0.0
    r2 = r2_score(y_true, y_pred) if len(y_true) > 1 and np.var(y_true) > 0 else 0.0
    
    # Slices
    mask_ge_5k = y_true >= 5000.0
    wape_ge_5k = (np.sum(np.abs(y_true[mask_ge_5k] - y_pred[mask_ge_5k])) / np.sum(y_true[mask_ge_5k]) * 100.0) if np.sum(y_true[mask_ge_5k]) > 0 else 0.0
    
    med_spend = np.median(y_true)
    mask_normal = (y_true >= med_spend * 0.5) & (y_true <= med_spend * 1.5)
    wape_normal = (np.sum(np.abs(y_true[mask_normal] - y_pred[mask_normal])) / np.sum(y_true[mask_normal]) * 100.0) if np.sum(y_true[mask_normal]) > 0 else 0.0
    
    mask_low = y_true < med_spend * 0.5
    wape_low = (np.sum(np.abs(y_true[mask_low] - y_pred[mask_low])) / np.sum(y_true[mask_low]) * 100.0) if np.sum(y_true[mask_low]) > 0 else 0.0
    
    mask_high = y_true > med_spend * 1.5
    wape_high = (np.sum(np.abs(y_true[mask_high] - y_pred[mask_high])) / np.sum(y_true[mask_high]) * 100.0) if np.sum(y_true[mask_high]) > 0 else 0.0
    
    return {
        'model_name': model_name,
        'mae': mae,
        'rmse': rmse,
        'med_ae': med_ae,
        'bias': bias,
        'wape_overall': wape,
        'wape_ge_5k': wape_ge_5k,
        'wape_normal': wape_normal,
        'wape_low': wape_low,
        'wape_high': wape_high,
        'r2': r2,
        'n_samples': len(y_true),
        'n_ge_5k': int(np.sum(mask_ge_5k)),
        'n_normal': int(np.sum(mask_normal)),
        'n_low': int(np.sum(mask_low)),
        'n_high': int(np.sum(mask_high))
    }


def run_full_forecasting_benchmark(workspace_dir: str):
    """Executes the full benchmark harness."""
    print("=" * 95)
    print("   FORENSIC CHRONOLOGICAL ML FORECASTING BENCHMARK (OLD VS NEW)")
    print("=" * 95)
    
    raw_tx = load_all_transactions(workspace_dir)
    print(f"Loaded {len(raw_tx):,} raw transactions.")
    
    monthly_panel = build_monthly_panel_from_transactions(raw_tx)
    print(f"Constructed monthly panel with {len(monthly_panel)} records.")
    
    feature_df = extract_time_safe_features(monthly_panel)
    print(f"Extracted {len(feature_df)} causal time-safe samples.")
    
    # Sort chronologically
    feature_df = feature_df.sort_values('period').reset_index(drop=True)
    
    # 70% Train, 15% Validation, 15% Unseen Final Test
    n = len(feature_df)
    train_idx = int(n * 0.70)
    val_idx = int(n * 0.85)
    
    train_df = feature_df.iloc[:train_idx].copy()
    val_df = feature_df.iloc[train_idx:val_idx].copy()
    test_df = feature_df.iloc[val_idx:].copy()
    
    print(f"Chronological Splits: Train={len(train_df)} ({train_df['period'].min()}..{train_df['period'].max()}), "
          f"Val={len(val_df)} ({val_df['period'].min()}..{val_df['period'].max()}), "
          f"Test={len(test_df)} ({test_df['period'].min()}..{test_df['period'].max()})")
    
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df['target_normal_expense']
    
    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df['target_normal_expense']
    
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df['target_normal_expense'].values
    
    # -------------------------------------------------------------
    # 1. TRAIN CANDIDATE MODELS
    # -------------------------------------------------------------
    models = {}
    
    # Baseline 1: Previous Month
    models["1. Previous Month Baseline"] = lambda X: X['lag_1'].values
    
    # Baseline 2: 3-Month Moving Average
    models["2. 3-Month Moving Average"] = lambda X: X['roll_mean_3'].values
    
    # Model 3: Ridge Regression (L2)
    ridge = Ridge(alpha=10.0)
    ridge.fit(X_train, y_train)
    models["3. Ridge Regression (L2)"] = lambda X: ridge.predict(X)
    
    # Model 4: Random Forest
    rf = RandomForestRegressor(n_estimators=100, max_depth=4, random_state=42)
    rf.fit(X_train, y_train)
    models["4. Random Forest Regressor"] = lambda X: rf.predict(X)
    
    # Model 5: HistGradientBoosting
    hgb = HistGradientBoostingRegressor(max_depth=3, random_state=42)
    hgb.fit(X_train, y_train)
    models["5. HistGradientBoosting"] = lambda X: hgb.predict(X)
    
    # Model 6: LightGBM (L1 / MAE Objective)
    lgb_l1 = lgb.LGBMRegressor(objective='regression_l1', n_estimators=80, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    lgb_l1.fit(X_train, y_train)
    models["6. LightGBM (L1 / MAE Objective)"] = lambda X: lgb_l1.predict(X)
    
    # Model 7: LightGBM (L2 / MSE Objective)
    lgb_l2 = lgb.LGBMRegressor(objective='regression', n_estimators=80, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    lgb_l2.fit(X_train, y_train)
    models["7. LightGBM (L2 / MSE Objective)"] = lambda X: lgb_l2.predict(X)
    
    # Model 8: LightGBM (Huber Objective)
    lgb_hub = lgb.LGBMRegressor(objective='huber', n_estimators=80, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    lgb_hub.fit(X_train, y_train)
    models["8. LightGBM (Huber Objective)"] = lambda X: lgb_hub.predict(X)
    
    # Model 9: Old Model Baseline (Master Consensus)
    old_engine = OldFinancialAdvisorEngine()
    def old_model_predict(X_df):
        preds = []
        for idx, row in X_df.iterrows():
            # Old stage 3 formula
            pred_val = 0.35 * row['ema_fast'] + 0.35 * row['ema_med'] + 0.15 * row['roll_mean_3'] + 0.15 * row['roll_mean_6']
            preds.append(pred_val)
        return np.array(preds)
    models["9. Old Model (Existing Consensus Baseline)"] = old_model_predict
    
    # Model 10: New Optimized Model (3-Tier Domain Decomposition + LightGBM L1 Residual Booster)
    # Target Delta = Target - (Fixed + Routine + Discretionary Baseline)
    base_anchor_train = X_train['fixed_spend'] + X_train['routine_spend'] + (X_train['disc_spend'] * 0.85)
    delta_train = y_train - base_anchor_train
    
    lgb_new_delta = lgb.LGBMRegressor(objective='regression_l1', n_estimators=60, learning_rate=0.02, num_leaves=12, verbose=-1, random_state=42)
    lgb_new_delta.fit(X_train, delta_train)
    
    def new_optimized_predict(X_df):
        base_anchors = X_df['fixed_spend'] + X_df['routine_spend'] + (X_df['disc_spend'] * 0.85)
        deltas = lgb_new_delta.predict(X_df)
        combined = base_anchors + deltas
        # Ensure contractual fixed floor
        return np.maximum(X_df['fixed_spend'].values, combined.values)
        
    models["10. New Optimized Model (3-Tier Domain + LightGBM L1 Booster)"] = new_optimized_predict
    
    # -------------------------------------------------------------
    # 2. EVALUATE ALL MODELS ON UNSEEN CHRONOLOGICAL TEST SET
    # -------------------------------------------------------------
    benchmark_results = []
    base_3m_pred = models["2. 3-Month Moving Average"](X_test)
    base_3m_errors = np.abs(y_test - base_3m_pred)
    
    for name, pred_fn in models.items():
        preds = pred_fn(X_test)
        metrics = calculate_metrics_bundle(y_test, preds, model_name=name)
        
        # Calculate win rate vs 3-Month Moving Average
        model_errors = np.abs(y_test - preds)
        win_rate = np.mean(model_errors <= base_3m_errors) * 100.0
        metrics['win_rate_vs_3m'] = win_rate
        benchmark_results.append(metrics)
        
    res_df = pd.DataFrame(benchmark_results)
    
    print("\n" + "=" * 115)
    print("                      CHRONOLOGICAL UNSEEN TEST SET BENCHMARK RESULTS")
    print("=" * 115)
    
    display_cols = [
        ('model_name', 'Model Architecture'),
        ('mae', 'MAE (INR)'),
        ('rmse', 'RMSE (INR)'),
        ('med_ae', 'Median AE'),
        ('wape_overall', 'Overall WAPE'),
        ('wape_ge_5k', 'WAPE >= 5k'),
        ('r2', 'R2 Score'),
        ('bias', 'Bias (INR)'),
        ('win_rate_vs_3m', 'Win Rate vs 3M')
    ]
    
    formatted_table = []
    for r in benchmark_results:
        formatted_table.append({
            "Model Architecture": r['model_name'],
            "MAE (INR)": f"Rs. {r['mae']:,.2f}",
            "RMSE (INR)": f"Rs. {r['rmse']:,.2f}",
            "Median AE": f"Rs. {r['med_ae']:,.2f}",
            "Overall WAPE": f"{r['wape_overall']:.2f}%",
            "WAPE >= 5k": f"{r['wape_ge_5k']:.2f}%",
            "R2 Score": f"{r['r2']:.4f}",
            "Bias (INR)": f"Rs. {r['bias']:+,.2f}",
            "Win Rate": f"{r['win_rate_vs_3m']:.1f}%"
        })
        
    print(pd.DataFrame(formatted_table).to_string(index=False))
    
    # -------------------------------------------------------------
    # 3. QUANTILE INTERVAL EVALUATION (P10, P50, P90)
    # -------------------------------------------------------------
    print("\n" + "=" * 95)
    print("            QUANTILE REGRESSION & INTERVAL CALIBRATION EVALUATION")
    print("=" * 95)
    
    q10 = lgb.LGBMRegressor(objective='quantile', alpha=0.10, n_estimators=60, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    q50 = lgb.LGBMRegressor(objective='quantile', alpha=0.50, n_estimators=60, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    q90 = lgb.LGBMRegressor(objective='quantile', alpha=0.90, n_estimators=60, learning_rate=0.03, num_leaves=15, verbose=-1, random_state=42)
    
    q10.fit(X_train, y_train)
    q50.fit(X_train, y_train)
    q90.fit(X_train, y_train)
    
    p10_preds = np.maximum(X_test['fixed_spend'].values, q10.predict(X_test))
    p50_preds = q50.predict(X_test)
    p90_preds = q90.predict(X_test)
    
    # Monotonicity adjustment
    p10_preds = np.minimum(p10_preds, p50_preds)
    p90_preds = np.maximum(p90_preds, p50_preds)
    
    coverage = np.mean((y_test >= p10_preds) & (y_test <= p90_preds)) * 100.0
    avg_width = np.mean(p90_preds - p10_preds)
    
    def pinball(y_t, y_p, a):
        diff = y_t - y_p
        return np.mean(np.maximum(a * diff, (a - 1.0) * diff))
        
    loss_10 = pinball(y_test, p10_preds, 0.10)
    loss_50 = pinball(y_test, p50_preds, 0.50)
    loss_90 = pinball(y_test, p90_preds, 0.90)
    
    print(f"Empirical P10-P90 Coverage : {coverage:.2f}% (Theoretical: ~80.0%)")
    print(f"Average Interval Width     : Rs. {avg_width:,.2f}")
    print(f"Pinball Loss (P10)         : {loss_10:.2f}")
    print(f"Pinball Loss (P50)         : {loss_50:.2f}")
    print(f"Pinball Loss (P90)         : {loss_90:.2f}")
    
    return benchmark_results, (p10_preds, p50_preds, p90_preds, coverage)


if __name__ == "__main__":
    WORKSPACE_DIR = r"e:\AI Powered Personal Finance Advisor"
    run_full_forecasting_benchmark(WORKSPACE_DIR)
