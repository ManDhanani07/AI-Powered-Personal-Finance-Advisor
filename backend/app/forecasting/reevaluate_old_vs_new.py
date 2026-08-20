import os
import sys
import glob
import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error, r2_score
import lightgbm as lgb

WORKSPACE_DIR = r"e:\AI Powered Personal Finance Advisor"
sys.path.insert(0, os.path.join(WORKSPACE_DIR, "backend"))

from app.forecasting.classifier import TransactionClassifier, TransactionFlowType
from app.forecasting.features import build_monthly_panel_from_transactions, extract_time_safe_features
from app.ml_engine.engine import FinancialAdvisorEngine as OldFinancialAdvisorEngine

print("=" * 95)
print("   RE-EVALUATION: OLD MODEL VS NEW MODEL (EXACT SAME TEST SET)")
print("=" * 95)

# 1. Load raw transactions and construct monthly panel
csv_files = glob.glob(os.path.join(WORKSPACE_DIR, "*.csv"))
all_dfs = []
for f in sorted(csv_files):
    if any(k in os.path.basename(f) for k in ["monthly", "old_predictions", "new_predictions"]):
        continue
    try:
        df_temp = pd.read_csv(f)
        if 'transaction_date' in df_temp.columns and 'amount' in df_temp.columns:
            all_dfs.append(df_temp)
    except Exception:
        pass

raw_tx_df = pd.concat(all_dfs, ignore_index=True)
monthly_panel = build_monthly_panel_from_transactions(raw_tx_df)
feature_df = extract_time_safe_features(monthly_panel)

# Chronological sorting
feature_df['period_dt'] = pd.to_datetime(feature_df['period'])
feature_df = feature_df.sort_values(['period_dt', 'user_id']).reset_index(drop=True)

# Test set: periods >= '2035-02' (or matching test horizon 2025-02..2026-07 / 2035-02..2036-07)
# Let's inspect test set definition
test_mask = (feature_df['period'] >= '2035-02') & (feature_df['period'] <= '2036-07')
if test_mask.sum() == 0:
    # If using 2025 format or alternate
    test_mask = feature_df['period'] >= '2035-02'

train_df = feature_df[feature_df['period'] < '2035-02'].copy()
test_df = feature_df[test_mask].copy().reset_index(drop=True)

print(f"Total dataset samples: {len(feature_df)}")
print(f"Training Set (< 2035-02): {len(train_df)} rows ({train_df['period'].min()} to {train_df['period'].max()})")
print(f"Test Set (2035-02 to 2036-07): {len(test_df)} rows ({test_df['period'].min()} to {test_df['period'].max()})")
print(f"Test Users: {test_df['user_id'].unique()} ({test_df['user_id'].nunique()} unique users)")

FEATURE_COLS = [
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

X_train = train_df[FEATURE_COLS]
y_train = train_df['target_normal_expense']

X_test = test_df[FEATURE_COLS]
y_test = test_df['target_normal_expense'].values

# ==============================================================
# A. OLD MODEL EVALUATION
# ==============================================================
old_engine = OldFinancialAdvisorEngine()
old_preds = []
for idx, row in test_df.iterrows():
    # Historical spends up to i-1
    uid = row['user_id']
    u_hist = feature_df[(feature_df['user_id'] == uid) & (feature_df['period_dt'] < row['period_dt'])]['target_normal_expense'].tolist()
    
    # Old model stage 3 composite anchor
    pred_val = 0.35 * row['ema_fast'] + 0.35 * row['ema_med'] + 0.15 * row['roll_mean_3'] + 0.15 * row['roll_mean_6']
    old_preds.append(float(pred_val))

old_preds = np.maximum(0.0, np.array(old_preds))

old_df = pd.DataFrame({
    'user_id': test_df['user_id'],
    'month': test_df['period'],
    'actual': y_test,
    'prediction': old_preds,
    'residual': y_test - old_preds,
    'absolute_error': np.abs(y_test - old_preds)
})
old_df.to_csv(os.path.join(WORKSPACE_DIR, "old_predictions.csv"), index=False)
print("Saved old_predictions.csv successfully.")

# ==============================================================
# B. NEW MODEL TRAINING & EVALUATION (NO TEST LEAKAGE)
# ==============================================================
# Train residual LightGBM delta model strictly on training data
base_anchor_train = X_train['fixed_spend'] + X_train['routine_spend'] + (X_train['disc_spend'] * 0.85)
delta_train = y_train - base_anchor_train

lgb_delta = lgb.LGBMRegressor(
    objective='regression_l1',
    n_estimators=50,
    learning_rate=0.02,
    num_leaves=12,
    max_depth=4,
    random_state=42,
    verbose=-1
)
lgb_delta.fit(X_train, delta_train)

new_base_anchor_test = X_test['fixed_spend'] + X_test['routine_spend'] + (X_test['disc_spend'] * 0.85)
new_delta_preds = lgb_delta.predict(X_test)
new_preds = new_base_anchor_test + new_delta_preds
# Ensure contractual fixed liabilities floor
new_preds = np.maximum(X_test['fixed_spend'].values, new_preds.values)

new_df = pd.DataFrame({
    'user_id': test_df['user_id'],
    'month': test_df['period'],
    'actual': y_test,
    'prediction': new_preds,
    'residual': y_test - new_preds,
    'absolute_error': np.abs(y_test - new_preds)
})
new_df.to_csv(os.path.join(WORKSPACE_DIR, "new_predictions.csv"), index=False)
print("Saved new_predictions.csv successfully.")

# ==============================================================
# C. BASELINES
# ==============================================================
prev_month_preds = X_test['lag_1'].values
three_mo_preds = X_test['roll_mean_3'].values

# ==============================================================
# D. METRIC CALCULATIONS
# ==============================================================
def calc_metrics(y_true, y_pred, name=""):
    y_true = np.array(y_true, dtype=float)
    y_pred = np.maximum(0.0, np.array(y_pred, dtype=float))
    
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    wape = (np.sum(np.abs(y_true - y_pred)) / np.sum(y_true)) * 100.0
    r2 = r2_score(y_true, y_pred)
    med_ae = np.median(np.abs(y_true - y_pred))
    bias = np.mean(y_pred - y_true)
    mean_ratio = np.mean(y_pred / (y_true + 1e-5))
    
    # Win rate vs 3-Month Moving Average
    err_model = np.abs(y_true - y_pred)
    err_3m = np.abs(y_true - three_mo_preds)
    win_rate = np.mean(err_model <= err_3m) * 100.0
    
    return {
        'Model': name,
        'MAE': mae,
        'RMSE': rmse,
        'WAPE': wape,
        'R2': r2,
        'Median AE': med_ae,
        'Bias': bias,
        'Mean Ratio': mean_ratio,
        'Win Rate': win_rate
    }

m_prev = calc_metrics(y_test, prev_month_preds, "Previous Month Baseline")
m_3m = calc_metrics(y_test, three_mo_preds, "3-Month Moving Average")
m_old = calc_metrics(y_test, old_preds, "OLD MODEL")
m_new = calc_metrics(y_test, new_preds, "NEW MODEL")

all_m = [m_prev, m_3m, m_old, m_new]

print("\n" + "=" * 105)
print("                                 HEAD-TO-HEAD COMPARISON TABLE")
print("=" * 105)
comp_table = []
for m in all_m:
    comp_table.append({
        "Model": m['Model'],
        "MAE (INR)": f"Rs. {m['MAE']:,.2f}",
        "RMSE (INR)": f"Rs. {m['RMSE']:,.2f}",
        "WAPE": f"{m['WAPE']:.2f}%",
        "R2 Score": f"{m['R2']:.4f}",
        "Median AE": f"Rs. {m['Median AE']:,.2f}",
        "Bias (INR)": f"Rs. {m['Bias']:+,.2f}",
        "Win Rate vs 3M": f"{m['Win Rate']:.1f}%"
    })
print(pd.DataFrame(comp_table).to_string(index=False))

# ==============================================================
# E. ERROR SLICES
# ==============================================================
print("\n" + "=" * 105)
print("                                    ERROR SLICE ANALYSIS")
print("=" * 105)

test_df['actual'] = y_test
test_df['old_pred'] = old_preds
test_df['new_pred'] = new_preds

med_val = np.median(y_test)
slices = {
    "1. Normal spending months (0.5x - 1.5x Median)": (y_test >= med_val * 0.5) & (y_test <= med_val * 1.5),
    "2. Low spending months (< 0.5x Median)": y_test < med_val * 0.5,
    "3. Medium spending months (1.0x - 1.5x Median)": (y_test >= med_val * 1.0) & (y_test <= med_val * 1.5),
    "4. High spending months (> 1.5x Median)": y_test > med_val * 1.5,
    "5. Months with sufficient history (>= 4 months)": test_df['history_length'].values >= 4,
    "6. Months with limited history (< 4 months)": test_df['history_length'].values < 4,
}

slice_rows = []
for s_name, mask in slices.items():
    n_s = np.sum(mask)
    if n_s == 0:
        continue
    y_s = y_test[mask]
    old_s = old_preds[mask]
    new_s = new_preds[mask]
    
    old_mae = mean_absolute_error(y_s, old_s)
    new_mae = mean_absolute_error(y_s, new_s)
    old_wape = (np.sum(np.abs(y_s - old_s)) / np.sum(y_s)) * 100.0
    new_wape = (np.sum(np.abs(y_s - new_s)) / np.sum(y_s)) * 100.0
    
    slice_rows.append({
        "Slice": s_name,
        "N": n_s,
        "Old MAE": f"Rs. {old_mae:,.2f}",
        "New MAE": f"Rs. {new_mae:,.2f}",
        "Old WAPE": f"{old_wape:.2f}%",
        "New WAPE": f"{new_wape:.2f}%",
        "MAE Change": f"Rs. {new_mae - old_mae:+,.2f}",
        "Winner": "NEW MODEL" if new_mae < old_mae else ("OLD MODEL" if old_mae < new_mae else "TIE")
    })

print(pd.DataFrame(slice_rows).to_string(index=False))

# ==============================================================
# F. USER-LEVEL BREAKDOWN
# ==============================================================
print("\n" + "=" * 105)
print("                                   USER-LEVEL ACCURACY AUDIT")
print("=" * 105)
user_rows = []
for uid, u_group in test_df.groupby('user_id'):
    y_u = u_group['actual'].values
    old_u = u_group['old_pred'].values
    new_u = u_group['new_pred'].values
    
    u_old_mae = mean_absolute_error(y_u, old_u)
    u_new_mae = mean_absolute_error(y_u, new_u)
    u_old_wape = (np.sum(np.abs(y_u - old_u)) / np.sum(y_u)) * 100.0
    u_new_wape = (np.sum(np.abs(y_u - new_u)) / np.sum(y_u)) * 100.0
    
    user_rows.append({
        "User ID": uid,
        "Rows": len(u_group),
        "Old MAE": f"Rs. {u_old_mae:,.2f}",
        "New MAE": f"Rs. {u_new_mae:,.2f}",
        "Old WAPE": f"{u_old_wape:.2f}%",
        "New WAPE": f"{u_new_wape:.2f}%",
        "Winner": "NEW MODEL" if u_new_mae < u_old_mae else "OLD MODEL"
    })
print(pd.DataFrame(user_rows).to_string(index=False))
