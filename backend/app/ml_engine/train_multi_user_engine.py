import os
import sys
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import HuberRegressor, Ridge
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import lightgbm as lgb
import warnings
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.dirname(MODEL_DIR)

def parse_and_clean_dataset(csv_path, is_realistic=False):
    print(f"--> Ingesting & Extracting Multi-Scale Features: {os.path.basename(csv_path)} ...")
    df = pd.read_csv(csv_path)
    
    # Vectorized Robust Date Parsing
    raw_dates = df['transaction_date'].astype(str)
    parsed = pd.to_datetime(raw_dates, errors='coerce', dayfirst=True)
    if parsed.isna().mean() > 0.5:
        parsed = pd.to_datetime(raw_dates, errors='coerce')
    df['transaction_date'] = parsed
    df = df.dropna(subset=['transaction_date']).sort_values('transaction_date').copy()
    df['year_month'] = df['transaction_date'].dt.to_period('M')
    df['amount'] = df['amount'].fillna(0.0)
    df['type_lower'] = df['transaction_type'].str.lower()
    df['cat_lower'] = df['category'].str.lower()

    # Category Classifications
    fixed_cats = [
        'housing and rent', 'housing & rent', 'rent', 'emi', 'utilities',
        'subscription', 'fees & subscriptions', 'insurance'
    ]
    routine_cats = [
        'food & dining', 'food and dining', 'groceries', 'grocery',
        'transportation', 'pet care & veterinary', 'fuel'
    ]
    discretionary_cats = [
        'shopping', 'entertainment', 'party & celebration', 'festival & gifts',
        'electronics', 'vacation & trip', 'miscellaneous', 'travel'
    ]
    shock_cats = [
        'healthcare', 'medical', 'medical emergency', 'home renovation & interior',
        'emergency', 'wedding & marriage', 'charity & donation'
    ]

    # Incomes
    inc_df = df[df['type_lower'] == 'income'].groupby(['user_id', 'year_month'], as_index=False)['amount'].sum()
    inc_df.rename(columns={'amount': 'income'}, inplace=True)

    # Expenses
    exp_df = df[df['type_lower'] == 'expense'].copy()
    
    exp_df['is_fixed'] = (exp_df['recurring'] == True) | (exp_df['cat_lower'].isin(fixed_cats))
    shock_amt_thresh = 35000.0 if not is_realistic else 45000.0
    exp_df['is_shock'] = (~exp_df['is_fixed']) & ((exp_df['cat_lower'].isin(shock_cats)) | (exp_df['amount'] > shock_amt_thresh))
    exp_df['is_routine'] = (~exp_df['is_fixed']) & (~exp_df['is_shock']) & (exp_df['cat_lower'].isin(routine_cats))
    exp_df['is_disc'] = (~exp_df['is_fixed']) & (~exp_df['is_shock']) & (~exp_df['is_routine'])

    exp_df['amt_fixed'] = np.where(exp_df['is_fixed'], exp_df['amount'], 0.0)
    exp_df['amt_routine'] = np.where(exp_df['is_routine'], exp_df['amount'], 0.0)
    exp_df['amt_disc'] = np.where(exp_df['is_disc'], exp_df['amount'], 0.0)
    exp_df['amt_shock'] = np.where(exp_df['is_shock'], exp_df['amount'], 0.0)
    exp_df['amt_var'] = exp_df['amt_routine'] + exp_df['amt_disc']

    monthly_exp = exp_df.groupby(['user_id', 'year_month'], as_index=False).agg(
        total_exp=('amount', 'sum'),
        fixed_spend=('amt_fixed', 'sum'),
        routine_spend=('amt_routine', 'sum'),
        disc_spend=('amt_disc', 'sum'),
        shock_spend=('amt_shock', 'sum'),
        var_spend=('amt_var', 'sum'),
        tx_count=('amount', 'count'),
        avg_tx_size=('amount', 'mean')
    )
    monthly_exp['clean_spend'] = monthly_exp['fixed_spend'] + monthly_exp['var_spend']

    monthly = pd.merge(monthly_exp, inc_df, on=['user_id', 'year_month'], how='left')
    monthly['income'] = monthly['income'].fillna(0.0)
    monthly = monthly.sort_values(['user_id', 'year_month']).reset_index(drop=True)

    g = monthly.groupby('user_id')
    
    # 1. Multi-Scale Adaptive Moving Averages
    monthly['ema_fast'] = g['clean_spend'].transform(lambda s: s.ewm(alpha=0.50, adjust=False).mean())
    monthly['ema_med'] = g['clean_spend'].transform(lambda s: s.ewm(alpha=0.30, adjust=False).mean())
    monthly['ema_slow'] = g['clean_spend'].transform(lambda s: s.ewm(alpha=0.15, adjust=False).mean())
    monthly['user_median'] = g['clean_spend'].transform(lambda s: s.expanding().median())
    
    # 2. Multi-Scale Composite Base Anchor
    monthly['base_anchor'] = (
        0.35 * monthly['ema_fast'] +
        0.35 * monthly['ema_med'] +
        0.15 * monthly['ema_slow'] +
        0.15 * monthly['user_median']
    )
    
    # 3. User Robust Profiles & Active Commitments
    monthly['user_income_med'] = g['income'].transform(lambda s: s.expanding().median()).fillna(0.0)
    monthly['user_fixed_max'] = g['fixed_spend'].transform(lambda s: s.rolling(3, min_periods=1).max())
    
    # 4. Lag Features
    monthly['anchor_lag_1'] = monthly['base_anchor']
    monthly['anchor_lag_2'] = g['base_anchor'].shift(1).fillna(monthly['base_anchor'])
    
    monthly['clean_lag_1'] = monthly['clean_spend']
    monthly['clean_lag_2'] = g['clean_spend'].shift(1).fillna(monthly['clean_spend'])
    monthly['clean_lag_3'] = g['clean_spend'].shift(2).fillna(monthly['clean_lag_2'])
    
    # 5. Dynamics & Financial Velocity
    monthly['spend_momentum'] = monthly['anchor_lag_1'] / (monthly['anchor_lag_2'] + 1.0)
    monthly['spend_diff_1m'] = monthly['anchor_lag_1'] - monthly['anchor_lag_2']
    monthly['rec_ratio'] = monthly['user_fixed_max'] / (monthly['anchor_lag_1'] + 1.0)
    monthly['exp_inc_ratio'] = monthly['anchor_lag_1'] / (monthly['user_income_med'] + 1.0)
    monthly['disc_ratio'] = monthly['disc_spend'] / (monthly['anchor_lag_1'] + 1.0)
    monthly['routine_ratio'] = monthly['routine_spend'] / (monthly['anchor_lag_1'] + 1.0)
    
    # 6. Rolling Statistics
    monthly['roll_mean_3'] = g['clean_spend'].transform(lambda s: s.rolling(3, min_periods=1).mean())
    monthly['roll_median_3'] = g['clean_spend'].transform(lambda s: s.rolling(3, min_periods=1).median())
    monthly['roll_std_3'] = g['clean_spend'].transform(lambda s: s.rolling(3, min_periods=1).std()).fillna(0.0)
    monthly['roll_mean_6'] = g['clean_spend'].transform(lambda s: s.rolling(6, min_periods=1).mean())
    monthly['roll_median_6'] = g['clean_spend'].transform(lambda s: s.rolling(6, min_periods=1).median())
    
    # 7. Calendar & History
    monthly['month_num'] = monthly['year_month'].dt.month
    monthly['quarter'] = monthly['year_month'].dt.quarter
    monthly['is_q4'] = monthly['month_num'].isin([10, 11, 12]).astype(int)
    monthly['user_history_months'] = g.cumcount() + 1

    # TARGETS FOR MONTH t+1
    monthly['target_smooth_spend'] = g['ema_med'].shift(-1)
    monthly['target_clean_spend'] = g['clean_spend'].shift(-1)
    monthly['target_total_spend'] = g['total_exp'].shift(-1)
    monthly['target_delta'] = monthly['target_smooth_spend'] - monthly['base_anchor']

    valid_df = monthly.dropna(subset=['target_smooth_spend']).copy().reset_index(drop=True)
    return valid_df

def train_production_models():
    print("=" * 85)
    print("   STARTING STATE-OF-THE-ART MULTI-SCALE FINANCIAL ENGINE TRAINING")
    print("=" * 85)
    t0 = time.time()
    
    path_a = os.path.join(DATA_DIR, "transactions_dataset_A_train.csv")
    path_real = os.path.join(DATA_DIR, "realistic_train_finance.csv")
    
    df_a = parse_and_clean_dataset(path_a, is_realistic=False)
    df_real = parse_and_clean_dataset(path_real, is_realistic=True)
    
    df_a['source'] = 'A'
    df_real['source'] = 'realistic'
    
    full_df = pd.concat([df_a, df_real], ignore_index=True)
    print(f"\nTotal Multi-User Transition Records: {len(full_df):,}")
    print(f"Unique Users Across Datasets: {full_df['user_id'].nunique()}")

    feature_cols = [
        'anchor_lag_1', 'anchor_lag_2', 'clean_lag_1', 'clean_lag_2', 'clean_lag_3',
        'ema_fast', 'ema_med', 'ema_slow', 'user_median', 'user_fixed_max', 'user_income_med',
        'fixed_spend', 'routine_spend', 'disc_spend', 'var_spend',
        'spend_momentum', 'spend_diff_1m', 'rec_ratio', 'exp_inc_ratio', 'disc_ratio', 'routine_ratio',
        'roll_mean_3', 'roll_median_3', 'roll_std_3', 'roll_mean_6', 'roll_median_6',
        'tx_count', 'avg_tx_size', 'month_num', 'quarter', 'is_q4', 'user_history_months'
    ]

    train_data = full_df[full_df['year_month'].dt.year < 2025].copy()
    test_data = full_df[full_df['year_month'].dt.year >= 2025].copy()
    
    print(f"Training Partition (<= 2024): {len(train_data):,} records")
    print(f"Test Partition (>= 2025)   : {len(test_data):,} records")

    X_train = train_data[feature_cols]
    y_train_delta = train_data['target_delta']
    y_train_smooth = train_data['target_smooth_spend']
    y_train_clean = train_data['target_clean_spend']
    
    X_test = test_data[feature_cols]
    y_test_smooth = test_data['target_smooth_spend']
    y_test_clean = test_data['target_clean_spend']
    
    # 1. Train Residual Gradient Booster (LightGBM on delta = target - base_anchor)
    print("\n1. Training Residual Gradient Booster (LightGBM on trend delta)...")
    lgb_delta = lgb.LGBMRegressor(
        objective='regression',
        n_estimators=600,
        learning_rate=0.015,
        num_leaves=35,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.05,
        reg_lambda=0.5,
        min_child_samples=15,
        random_state=42,
        verbose=-1
    )
    lgb_delta.fit(X_train, y_train_delta)
    
    # 2. Train Direct Expected Routine Regressor
    print("2. Training Direct Multi-Scale Routine Regressor (LightGBM)...")
    lgb_direct = lgb.LGBMRegressor(
        objective='regression',
        n_estimators=600,
        learning_rate=0.015,
        num_leaves=35,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.05,
        reg_lambda=0.5,
        min_child_samples=15,
        random_state=42,
        verbose=-1
    )
    lgb_direct.fit(X_train, y_train_smooth)

    # 3. Train Quantile Regressors (P10 Minimum Survival & P90 Upper Ceiling)
    print("3. Training P10 Lower Bound Quantile Regressor (alpha=0.10)...")
    lgb_p10 = lgb.LGBMRegressor(
        objective='quantile',
        alpha=0.10,
        n_estimators=300,
        learning_rate=0.03,
        num_leaves=31,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbose=-1
    )
    lgb_p10.fit(X_train, y_train_clean)

    print("4. Training P90 Upper Bound Quantile Regressor (alpha=0.90)...")
    lgb_p90 = lgb.LGBMRegressor(
        objective='quantile',
        alpha=0.90,
        n_estimators=300,
        learning_rate=0.03,
        num_leaves=31,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbose=-1
    )
    lgb_p90.fit(X_train, y_train_clean)

    # 4. Multi-User Linear Huber Regressor
    print("5. Training Multi-User Robust Huber Regressor...")
    huber = HuberRegressor(epsilon=1.35, alpha=0.05, max_iter=2000)
    huber.fit(X_train, y_train_smooth)

    # Out-of-Sample Performance Evaluation
    base_anchor_test = test_data['base_anchor'].values
    pred_res = np.maximum(0.0, base_anchor_test + lgb_delta.predict(X_test))
    pred_dir = np.maximum(0.0, lgb_direct.predict(X_test))
    pred_hub = np.maximum(0.0, huber.predict(X_test))
    
    # SOTA Master Ensemble: 50% Residual Delta + 40% Direct + 10% Huber
    preds_master = 0.50 * pred_res + 0.40 * pred_dir + 0.10 * pred_hub

    r2_s = r2_score(y_test_smooth, preds_master)
    mae_s = mean_absolute_error(y_test_smooth, preds_master)
    rmse_s = np.sqrt(mean_squared_error(y_test_smooth, preds_master))
    wpa_s = (1.0 - np.sum(np.abs(y_test_smooth - preds_master)) / np.sum(y_test_smooth)) * 100.0

    print("\n" + "=" * 80)
    print("       OUT-OF-SAMPLE 2025 MASTER ENSEMBLE TEST PERFORMANCE")
    print("=" * 80)
    print(f"Master Ensemble R2 Score     : {r2_s:.4f}")
    print(f"Master Ensemble WPA Accuracy : {wpa_s:.2f}%")
    print(f"Master Ensemble MAE (Rs.)    : Rs. {mae_s:,.2f}")
    print(f"Master Ensemble RMSE (Rs.)   : Rs. {rmse_s:,.2f}")
    print("=" * 80)

    # Export Production Artifacts
    print("\nExporting Production Artifacts into ml_financial_engine/ ...")
    lgb_delta.booster_.save_model(os.path.join(MODEL_DIR, "residual_lgbm.txt"))
    lgb_direct.booster_.save_model(os.path.join(MODEL_DIR, "routine_lgbm.txt"))
    lgb_p10.booster_.save_model(os.path.join(MODEL_DIR, "quantile_p10_lgbm.txt"))
    lgb_p90.booster_.save_model(os.path.join(MODEL_DIR, "quantile_p90_lgbm.txt"))
    
    joblib.dump(huber, os.path.join(MODEL_DIR, "huber_model.pkl"))
    joblib.dump(feature_cols, os.path.join(MODEL_DIR, "model_feature_cols.pkl"))
    
    metadata = {
        "version": "4.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "feature_cols": feature_cols,
        "n_train_records": len(train_data),
        "validation_r2": float(r2_s),
        "validation_wpa": float(wpa_s),
        "validation_mae": float(mae_s)
    }
    joblib.dump(metadata, os.path.join(MODEL_DIR, "engine_metadata.pkl"))
    print(f"All artifacts exported successfully in {time.time() - t0:.2f} seconds!")

if __name__ == "__main__":
    train_production_models()
