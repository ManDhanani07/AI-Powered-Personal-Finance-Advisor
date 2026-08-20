"""
Causal Time-Safe Feature Engineering Pipeline for Consumer Financial Forecasting.
Guarantees zero data leakage: feature matrix at row t strictly uses information available before month t.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from .classifier import TransactionClassifier, TransactionFlowType


def build_monthly_panel_from_transactions(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Classifies raw transactions and aggregates into clean monthly consumer panels per user.
    """
    df = raw_df.copy()
    
    # Robust date parsing
    raw_dates = df['transaction_date'].astype(str)
    parsed_dates = pd.to_datetime(raw_dates, errors='coerce', dayfirst=True)
    if parsed_dates.isna().mean() > 0.5:
        parsed_dates = pd.to_datetime(raw_dates, errors='coerce')
    df['transaction_date'] = parsed_dates
    df = df.dropna(subset=['transaction_date']).sort_values(['user_id', 'transaction_date']).copy()
    df['year_month'] = df['transaction_date'].dt.to_period('M')
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)

    # Classify all transactions
    df = TransactionClassifier.classify_dataframe(df)

    # Groupings
    df['amt_normal_consumer'] = np.where(df['flow_type'] == TransactionFlowType.NORMAL_CONSUMER_EXPENSE.value, df['amount'], 0.0)
    df['amt_fixed'] = np.where(df['flow_type'] == TransactionFlowType.FIXED_EXPENSE.value, df['amount'], 0.0)
    df['amt_disc'] = np.where(df['flow_type'] == TransactionFlowType.DISCRETIONARY_EXPENSE.value, df['amount'], 0.0)
    df['amt_investment'] = np.where(df['flow_type'] == TransactionFlowType.INVESTMENT.value, df['amount'], 0.0)
    df['amt_savings_transfer'] = np.where(df['flow_type'] == TransactionFlowType.SAVINGS_TRANSFER.value, df['amount'], 0.0)
    df['amt_shock'] = np.where(df['flow_type'] == TransactionFlowType.ONE_OFF_LIFE_EVENT.value, df['amount'], 0.0)
    df['amt_income'] = np.where(df['flow_type'] == TransactionFlowType.INCOME.value, df['amount'], 0.0)

    # Category shares
    cat_lower = df['category'].astype(str).str.lower()
    df['amt_food'] = np.where(cat_lower.str.contains('food|dining|grocer'), df['amount'], 0.0)
    df['amt_shopping'] = np.where(cat_lower.str.contains('shop|cloth|apparel|electro'), df['amount'], 0.0)
    df['amt_transport'] = np.where(cat_lower.str.contains('transport|fuel|petrol|diesel|cab|uber'), df['amount'], 0.0)
    df['amt_healthcare'] = np.where(cat_lower.str.contains('health|medic|pharm|clinic'), df['amount'], 0.0)

    # Total Normal Consumption Outflows (Target Foundation)
    df['amt_total_consumption'] = df['amt_normal_consumer'] + df['amt_fixed'] + df['amt_disc']

    # Monthly aggregation
    monthly = df.groupby(['user_id', 'year_month'], as_index=False).agg(
        # Targets & Core Outflows
        normal_expense=('amt_total_consumption', 'sum'),
        routine_expense=('amt_normal_consumer', 'sum'),
        fixed_expense=('amt_fixed', 'sum'),
        disc_expense=('amt_disc', 'sum'),
        investment_outflows=('amt_investment', 'sum'),
        savings_transfers=('amt_savings_transfer', 'sum'),
        shock_outflows=('amt_shock', 'sum'),
        income=('amt_income', 'sum'),
        
        # Category Outflows
        food_spend=('amt_food', 'sum'),
        shopping_spend=('amt_shopping', 'sum'),
        transport_spend=('amt_transport', 'sum'),
        healthcare_spend=('amt_healthcare', 'sum'),
        
        # Behavioral metadata
        total_tx_count=('amount', 'count'),
        avg_tx_amount=('amount', 'mean'),
        median_tx_amount=('amount', 'median'),
        max_tx_amount=('amount', 'max')
    )

    monthly = monthly.sort_values(['user_id', 'year_month']).reset_index(drop=True)
    return monthly


def extract_time_safe_features(monthly_df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts time-safe causal features strictly using history before month t.
    Target: normal_expense(t).
    Features for row t: strictly computed on data up to t-1.
    """
    feature_rows = []
    
    for uid, u_df in monthly_df.groupby('user_id'):
        u_df = u_df.sort_values('year_month').reset_index(drop=True)
        n = len(u_df)
        
        for i in range(1, n):
            # Information strictly available up to index i-1 (Past History)
            hist_exp = u_df.iloc[:i]['normal_expense']
            hist_inc = u_df.iloc[:i]['income']
            
            # Current Target to predict at month i
            target_val = float(u_df.iloc[i]['normal_expense'])
            target_period = str(u_df.iloc[i]['year_month'])
            target_month = u_df.iloc[i]['year_month'].month
            target_quarter = u_df.iloc[i]['year_month'].quarter
            
            # 1. Historical Lags
            lag_1 = float(hist_exp.iloc[-1])
            lag_2 = float(hist_exp.iloc[-2]) if len(hist_exp) >= 2 else lag_1
            lag_3 = float(hist_exp.iloc[-3]) if len(hist_exp) >= 3 else lag_2
            lag_6 = float(hist_exp.iloc[-6]) if len(hist_exp) >= 6 else lag_3
            
            # 2. Multi-Frequency EMAs
            ema_fast = float(hist_exp.ewm(alpha=0.50, adjust=False).mean().iloc[-1])
            ema_med = float(hist_exp.ewm(alpha=0.30, adjust=False).mean().iloc[-1])
            ema_slow = float(hist_exp.ewm(alpha=0.15, adjust=False).mean().iloc[-1])
            
            # 3. Rolling Statistics
            roll_mean_3 = float(hist_exp.tail(3).mean())
            roll_mean_6 = float(hist_exp.tail(6).mean())
            roll_med_3 = float(hist_exp.tail(3).median())
            roll_std_3 = float(hist_exp.tail(3).std()) if len(hist_exp) >= 3 and not np.isnan(hist_exp.tail(3).std()) else lag_1 * 0.05
            roll_min_3 = float(hist_exp.tail(3).min())
            roll_max_3 = float(hist_exp.tail(3).max())
            
            q25 = float(hist_exp.quantile(0.25))
            q75 = float(hist_exp.quantile(0.75))
            trimmed_slice = hist_exp[(hist_exp >= q25) & (hist_exp <= q75)]
            trimmed_mean = float(trimmed_slice.mean()) if len(trimmed_slice) > 0 else lag_1
            user_median = float(hist_exp.median())
            
            # 4. Behavioral Breakdown (from latest available historical month i-1)
            prev_row = u_df.iloc[i-1]
            fixed_spend = float(prev_row['fixed_expense'])
            routine_spend = float(prev_row['routine_expense'])
            disc_spend = float(prev_row['disc_expense'])
            
            # 5. Ratios & Momentum
            fixed_ratio = fixed_spend / (lag_1 + 1.0)
            routine_ratio = routine_spend / (lag_1 + 1.0)
            disc_ratio = disc_spend / (lag_1 + 1.0)
            
            food_ratio = float(prev_row['food_spend']) / (lag_1 + 1.0)
            shopping_ratio = float(prev_row['shopping_spend']) / (lag_1 + 1.0)
            transport_ratio = float(prev_row['transport_spend']) / (lag_1 + 1.0)
            healthcare_ratio = float(prev_row['healthcare_spend']) / (lag_1 + 1.0)
            
            tx_count = float(prev_row['total_tx_count'])
            avg_tx = float(prev_row['avg_tx_amount'])
            max_tx = float(prev_row['max_tx_amount'])
            
            # Income & Savings
            income_lag_1 = float(prev_row['income'])
            inc_med = float(hist_inc.median()) if len(hist_inc) > 0 and float(hist_inc.median()) > 0 else lag_1 * 1.5
            exp_inc_ratio = lag_1 / (inc_med + 1.0)
            savings_rate = max(0.0, (income_lag_1 - lag_1) / (income_lag_1 + 1.0)) if income_lag_1 > 0 else 0.20
            
            momentum = lag_1 / (lag_2 + 1.0)
            diff_1m = lag_1 - lag_2
            coef_var = roll_std_3 / (roll_mean_3 + 1.0)
            
            # 6. Calendar Features
            month_sin = np.sin(2 * np.pi * target_month / 12.0)
            month_cos = np.cos(2 * np.pi * target_month / 12.0)
            is_q4 = 1.0 if target_month in [10, 11, 12] else 0.0
            
            feature_rows.append({
                'user_id': uid,
                'period': target_period,
                'history_length': i,
                
                # Target
                'target_normal_expense': target_val,
                'target_fixed_expense': float(u_df.iloc[i]['fixed_expense']),
                'target_routine_expense': float(u_df.iloc[i]['routine_expense']),
                'target_disc_expense': float(u_df.iloc[i]['disc_expense']),
                'target_investment': float(u_df.iloc[i]['investment_outflows']),
                'target_savings_transfer': float(u_df.iloc[i]['savings_transfers']),
                'target_income': float(u_df.iloc[i]['income']),
                
                # Features
                'lag_1': lag_1,
                'lag_2': lag_2,
                'lag_3': lag_3,
                'lag_6': lag_6,
                'ema_fast': ema_fast,
                'ema_med': ema_med,
                'ema_slow': ema_slow,
                'roll_mean_3': roll_mean_3,
                'roll_mean_6': roll_mean_6,
                'roll_med_3': roll_med_3,
                'roll_std_3': roll_std_3,
                'roll_min_3': roll_min_3,
                'roll_max_3': roll_max_3,
                'trimmed_mean': trimmed_mean,
                'user_median': user_median,
                'fixed_spend': fixed_spend,
                'routine_spend': routine_spend,
                'disc_spend': disc_spend,
                'fixed_ratio': fixed_ratio,
                'routine_ratio': routine_ratio,
                'disc_ratio': disc_ratio,
                'food_ratio': food_ratio,
                'shopping_ratio': shopping_ratio,
                'transport_ratio': transport_ratio,
                'healthcare_ratio': healthcare_ratio,
                'tx_count': tx_count,
                'avg_tx': avg_tx,
                'max_tx': max_tx,
                'exp_inc_ratio': exp_inc_ratio,
                'savings_rate': savings_rate,
                'momentum': momentum,
                'diff_1m': diff_1m,
                'coef_var': coef_var,
                'target_month': float(target_month),
                'target_quarter': float(target_quarter),
                'month_sin': month_sin,
                'month_cos': month_cos,
                'is_q4': is_q4
            })

    return pd.DataFrame(feature_rows)
