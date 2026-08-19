import os
import warnings
import joblib
import pandas as pd
import numpy as np
import lightgbm as lgb

class FinancialAdvisorEngine:
    """
    Production-Grade Multi-Scale Financial Advisory & Expense Prediction Engine.
    Features:
    - Multi-Scale Adaptive Moving Averages (Fast EMA + Medium EMA + Slow EMA + Expanding Median)
    - Residual Trend Gradient Booster + Direct Regressor Ensemble
    - 3-Tier Categorization (Fixed Contractual, Routine Living, Elastic Discretionary, Isolated Shocks)
    - Dynamic Adaptive Fallback Ladder for Cold-Start / Developing / Established Users
    - Multi-Horizon Out-of-Sample Forecasting with Quantile Bounds (P10 - P90)
    - Calibrated Liquidity Cushion & Safe Budget Ceilings
    - Spending Velocity & Financial Health Risk Scoring
    """
    def __init__(self, base_dir=None):
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            
        self.base_dir = base_dir
        self.residual_model_path = os.path.join(base_dir, 'residual_lgbm.txt')
        self.routine_model_path = os.path.join(base_dir, 'routine_lgbm.txt')
        self.p10_model_path = os.path.join(base_dir, 'quantile_p10_lgbm.txt')
        self.p90_model_path = os.path.join(base_dir, 'quantile_p90_lgbm.txt')
        self.huber_path = os.path.join(base_dir, 'huber_model.pkl')
        self.feature_path = os.path.join(base_dir, 'model_feature_cols.pkl')
        self.meta_path = os.path.join(base_dir, 'engine_metadata.pkl')
        
        if not os.path.exists(self.huber_path) or not os.path.exists(self.feature_path):
            raise FileNotFoundError(f"Model artifacts not found in {base_dir}. Run train_multi_user_engine.py first.")
            
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.huber_model = joblib.load(self.huber_path)
            self.feature_cols = joblib.load(self.feature_path)
        
        self.lgb_residual = lgb.Booster(model_file=self.residual_model_path) if os.path.exists(self.residual_model_path) else None
        self.lgb_direct = lgb.Booster(model_file=self.routine_model_path) if os.path.exists(self.routine_model_path) else None
        self.lgb_p10 = lgb.Booster(model_file=self.p10_model_path) if os.path.exists(self.p10_model_path) else None
        self.lgb_p90 = lgb.Booster(model_file=self.p90_model_path) if os.path.exists(self.p90_model_path) else None

        # Domain Categories
        self.fixed_cats = [
            'housing and rent', 'housing & rent', 'rent', 'emi', 'loan/emi', 'loan', 'utilities',
            'subscription', 'subscriptions', 'fees & subscriptions', 'insurance', 'tax', 'taxes',
            'education', 'savings', 'investment', 'investments'
        ]
        self.routine_cats = [
            'food & dining', 'food and dining', 'groceries', 'grocery', 'food', 'dining',
            'transportation', 'transport', 'personal care', 'pet care & veterinary', 'fuel', 'transit',
            'healthcare', 'medical', 'pharmacy', 'clinic'
        ]
        self.discretionary_cats = [
            'shopping', 'entertainment', 'party & celebration', 'festival & gifts',
            'electronics', 'vacation & trip', 'miscellaneous', 'travel'
        ]
        self.shock_cats = [
            'medical emergency', 'home renovation & interior',
            'emergency', 'wedding & marriage', 'charity & donation'
        ]

    def sanitize(self, transactions, days_active=30, historical_incomes=None, historical_spends=None):
        """
        Ingests raw transaction stream and produces robust financial summary metrics.
        """
        if isinstance(transactions, list):
            df = pd.DataFrame(transactions)
        else:
            df = transactions.copy()

        if df.empty:
            return {
                'clean_routine_spend': 0.0,
                'raw_clean_spend': 0.0,
                'recurring_bills': 0.0,
                'fixed_bills': 0.0,
                'routine_spend': 0.0,
                'disc_spend': 0.0,
                'var_spend': 0.0,
                'robust_income': 0.0,
                'shock_amount': 0.0,
                'txn_count': 0,
                'avg_tx_size': 0.0
            }

        # Normalize columns
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
        type_s = df['transaction_type'].astype(str).str.lower() if 'transaction_type' in df.columns else pd.Series(['expense'] * len(df))
        cat_s = df['category'].astype(str).str.lower() if 'category' in df.columns else pd.Series(['miscellaneous'] * len(df))
        
        # Robust boolean parsing for recurring
        if 'recurring' in df.columns:
            rec_s = df['recurring'].apply(
                lambda x: str(x).strip().lower() in ['true', 'yes', 'y', '1', 't'] if not isinstance(x, bool) else bool(x)
            )
        else:
            rec_s = pd.Series([False] * len(df))

        # Income isolation
        inc_mask = type_s == 'income'
        curr_inc = max(0.0, float(df[inc_mask]['amount'].sum()))
        hist_inc_list = list(historical_incomes) if historical_incomes else []
        robust_income = float(np.median(hist_inc_list + [curr_inc])) if (hist_inc_list or curr_inc > 0) else curr_inc

        # Expense breakdown
        exp_mask = type_s == 'expense'
        exp_df = df[exp_mask].copy()
        
        if exp_df.empty:
            return {
                'clean_routine_spend': 0.0,
                'raw_clean_spend': 0.0,
                'recurring_bills': 0.0,
                'fixed_bills': 0.0,
                'routine_spend': 0.0,
                'disc_spend': 0.0,
                'robust_income': robust_income,
                'shock_amount': 0.0,
                'txn_count': 0,
                'avg_tx_size': 0.0
            }

        # Netting by category
        exp_df['cat_clean'] = cat_s[exp_mask]
        exp_df['rec_clean'] = rec_s[exp_mask]
        
        cat_net = exp_df.groupby(['cat_clean', 'rec_clean'])['amount'].sum().reset_index()
        cat_net['amount'] = cat_net['amount'].apply(lambda x: max(0.0, float(x)))

        pos_amounts = cat_net[cat_net['amount'] > 0]['amount']
        p75 = float(pos_amounts.quantile(0.75)) if len(pos_amounts) > 0 else 5000.0
        p50 = float(pos_amounts.median()) if len(pos_amounts) > 0 else 2000.0
        shock_thresh = max(12000.0, p75 + 1.6 * (p75 - p50 + 1.0))

        # Classify categories
        is_fixed = (cat_net['rec_clean'] == True) | (cat_net['cat_clean'].isin(self.fixed_cats))
        fixed_bills = float(cat_net[is_fixed]['amount'].sum())

        var_df = cat_net[~is_fixed]
        is_shock = (var_df['cat_clean'].isin(self.shock_cats)) | (var_df['amount'] > shock_thresh)
        shock_amt = float(var_df[is_shock]['amount'].sum())
        
        clean_var_df = var_df[~is_shock]
        is_routine = clean_var_df['cat_clean'].isin(self.routine_cats)
        routine_spend = float(clean_var_df[is_routine]['amount'].sum())
        disc_spend = float(clean_var_df[~is_routine]['amount'].sum())

        # If a variable category experienced a one-off shock but belongs to routine living (e.g. hospitalization), retain essential baseline
        for _, r in var_df[is_shock].iterrows():
            if r['cat_clean'] in self.routine_cats:
                base_allotted = min(float(r['amount']), 5000.0)
                routine_spend += base_allotted
                shock_amt = max(0.0, shock_amt - base_allotted)

        # Prorate if partial logging days active
        if 0 < days_active < 27:
            scale = 30.4 / float(days_active)
            routine_spend = round(routine_spend * scale, 2)
            disc_spend = round(disc_spend * scale, 2)

        raw_clean_spend = round(fixed_bills + routine_spend + disc_spend, 2)

        # Baseline multi-scale smoothing
        hist_spends_list = list(historical_spends) if historical_spends else []
        if hist_spends_list:
            spends_series = pd.Series(hist_spends_list + [raw_clean_spend])
            clean_routine_spend = round(float(spends_series.ewm(alpha=0.30, adjust=False).mean().iloc[-1]), 2)
        else:
            clean_routine_spend = raw_clean_spend

        return {
            'clean_routine_spend': clean_routine_spend,
            'raw_clean_spend': raw_clean_spend,
            'recurring_bills': round(fixed_bills, 2),
            'fixed_bills': round(fixed_bills, 2),
            'routine_spend': round(routine_spend, 2),
            'disc_spend': round(disc_spend, 2),
            'var_spend': round(routine_spend + disc_spend, 2),
            'robust_income': round(robust_income, 2),
            'shock_amount': round(shock_amt, 2),
            'txn_count': len(exp_df),
            'avg_tx_size': round(float(exp_df['amount'].mean()), 2)
        }

    def predict(self, transactions, target_month=None, days_active=30, historical_incomes=None, historical_spends=None, current_month=None):
        """
        Generates master multi-scale next-month expense forecasts, confidence bounds, and safety buffers.
        """
        prep = self.sanitize(transactions, days_active, historical_incomes, historical_spends)
        base_spend = prep['clean_routine_spend']
        raw_spend = prep['raw_clean_spend']
        income = prep['robust_income']
        fixed = prep['fixed_bills']
        routine = prep['routine_spend']
        disc = prep['disc_spend']
        var_spend = prep['var_spend']
        
        hist = list(historical_spends) if historical_spends else []
        history_length = len(hist) + 1
        hist_series = pd.Series(hist + [raw_spend])
        
        # Calendar configuration
        if target_month is None:
            target_month = ((current_month % 12) + 1) if current_month else 1
            
        target_quarter = (target_month - 1) // 3 + 1
        is_q4 = 1 if target_month in [10, 11, 12] else 0
        
        # -------------------------------------------------------------
        # ADAPTIVE MULTI-STAGE FALLBACK LADDER
        # -------------------------------------------------------------
        if history_length <= 1:
            # Stage 1: Cold-Start User (0-1 Month History)
            # Empirical 3-Tier Category Elasticity Model:
            # Fixed liabilities (Rent, EMI, Utilities, Subscriptions, Insurance) have near-zero variance (~1.0x).
            # Routine essentials (Groceries, Dining, Transit) have high persistence with inflation drift (~1.01x).
            # Discretionary elastic spend (Shopping, Travel, Entertainment) exhibits empirical mean-reversion (~0.94x, or 1.15x in festive Q4).
            fixed_component = fixed
            routine_component = routine * 1.01
            disc_component = disc * (1.15 if is_q4 else 0.94)
            
            predicted_routine = round(fixed_component + routine_component + disc_component, 2)
            
            # Dynamic empirical quantile bounds
            p10_min = round(fixed_component + (routine * 0.85) + (disc * 0.70), 2)
            p90_max = round(fixed_component + (routine * 1.25) + (disc * (1.45 if is_q4 else 1.30)), 2)
            model_confidence = "MEDIUM (1-Month Category-Calibrated Profile)"
            
        elif history_length <= 3:
            # Stage 2: Developing User (2-3 Months History)
            # Multi-scale adaptive regime forecasting:
            # Distinguishes steady lifestyle trends from transient discretionary surges (mean-reverting post-event).
            roll_med = float(hist_series.median())
            ema_fast = float(hist_series.ewm(alpha=0.50, adjust=False).mean().iloc[-1])
            ema_slow = float(hist_series.ewm(alpha=0.25, adjust=False).mean().iloc[-1])
            
            last_val = float(hist_series.iloc[-1])
            prev_val = float(hist_series.iloc[-2]) if len(hist_series) >= 2 else last_val
            delta = last_val - prev_val
            delta_pct = delta / (prev_val + 1.0)
            
            if delta_pct > 0.18:
                # Discretionary surge detected (e.g. festive, vacation, wedding) -> Mean-revert variable spend to historical anchor
                predicted_routine = round(0.55 * base_spend + 0.30 * roll_med + 0.15 * ema_slow, 2)
            elif delta_pct < -0.15:
                # Contraction month -> Anchor to robust lower baseline
                predicted_routine = round(0.50 * last_val + 0.50 * roll_med, 2)
            else:
                # Steady trend -> Momentum-aware forecast
                momentum_proj = last_val + 0.15 * delta
                predicted_routine = round(0.40 * momentum_proj + 0.35 * ema_fast + 0.25 * roll_med, 2)
            
            # Discretionary elasticity-aware standard deviation
            disc_volatility_floor = max(disc * 0.35, predicted_routine * 0.08)
            series_std = float(hist_series.std()) if len(hist_series) > 1 and not np.isnan(hist_series.std()) else disc_volatility_floor
            effective_std = max(series_std, disc_volatility_floor)
            
            p10_min = round(max(fixed, predicted_routine - 1.28 * effective_std), 2)
            p90_max = round(predicted_routine + (1.60 if is_q4 else 1.28) * effective_std, 2)
            model_confidence = "HIGH (Developing History / Multi-Month Profile)"
            
        else:
            # Stage 3: Established User (4+ Months History) -> Full Multi-Scale ML Master Ensemble
            ema_fast = float(hist_series.ewm(alpha=0.50, adjust=False).mean().iloc[-1])
            ema_med = float(hist_series.ewm(alpha=0.30, adjust=False).mean().iloc[-1])
            ema_slow = float(hist_series.ewm(alpha=0.15, adjust=False).mean().iloc[-1])
            user_med = float(hist_series.expanding().median().iloc[-1])
            
            # Base Composite Anchor
            base_anchor = (0.35 * ema_fast + 0.35 * ema_med + 0.15 * ema_slow + 0.15 * user_med)
            
            # Lags
            anchor_lag_1 = base_anchor
            anchor_lag_2 = float(hist_series.ewm(alpha=0.30, adjust=False).mean().iloc[-2]) if len(hist_series) >= 2 else base_anchor
            
            clean_lag_1 = float(hist_series.iloc[-1])
            clean_lag_2 = float(hist_series.iloc[-2]) if len(hist_series) >= 2 else clean_lag_1
            clean_lag_3 = float(hist_series.iloc[-3]) if len(hist_series) >= 3 else clean_lag_2
            
            user_fixed_max = max(fixed, float(hist_series.tail(3).min()))
            user_income_med = income
            
            spend_momentum = anchor_lag_1 / (anchor_lag_2 + 1.0)
            spend_diff_1m = anchor_lag_1 - anchor_lag_2
            rec_ratio = user_fixed_max / (anchor_lag_1 + 1.0)
            exp_inc_ratio = anchor_lag_1 / (user_income_med + 1.0)
            disc_ratio = disc / (anchor_lag_1 + 1.0)
            routine_ratio = routine / (anchor_lag_1 + 1.0)
            
            roll_mean_3 = float(hist_series.tail(3).mean())
            roll_median_3 = float(hist_series.tail(3).median())
            roll_std_3 = float(hist_series.tail(3).std()) if len(hist_series) >= 3 else 0.0
            roll_mean_6 = float(hist_series.tail(6).mean())
            roll_median_6 = float(hist_series.tail(6).median())
            
            input_dict = {
                'anchor_lag_1': anchor_lag_1,
                'anchor_lag_2': anchor_lag_2,
                'clean_lag_1': clean_lag_1,
                'clean_lag_2': clean_lag_2,
                'clean_lag_3': clean_lag_3,
                'ema_fast': ema_fast,
                'ema_med': ema_med,
                'ema_slow': ema_slow,
                'user_median': user_med,
                'user_fixed_max': user_fixed_max,
                'user_income_med': user_income_med,
                'fixed_spend': fixed,
                'routine_spend': routine,
                'disc_spend': disc,
                'var_spend': var_spend,
                'spend_momentum': spend_momentum,
                'spend_diff_1m': spend_diff_1m,
                'rec_ratio': rec_ratio,
                'exp_inc_ratio': exp_inc_ratio,
                'disc_ratio': disc_ratio,
                'routine_ratio': routine_ratio,
                'roll_mean_3': roll_mean_3,
                'roll_median_3': roll_median_3,
                'roll_std_3': roll_std_3,
                'roll_mean_6': roll_mean_6,
                'roll_median_6': roll_median_6,
                'tx_count': prep['txn_count'],
                'avg_tx_size': prep['avg_tx_size'],
                'month_num': target_month,
                'quarter': target_quarter,
                'is_q4': is_q4,
                'user_history_months': history_length
            }
            
            input_df = pd.DataFrame([input_dict])[self.feature_cols]
            
            # Predict using Master Ensemble
            pred_delta = float(self.lgb_residual.predict(input_df)[0]) if self.lgb_residual else 0.0
            pred_res = max(0.0, base_anchor + pred_delta)
            pred_dir = float(self.lgb_direct.predict(input_df)[0]) if self.lgb_direct else base_anchor
            pred_hub = float(self.huber_model.predict(input_df)[0])
            
            predicted_routine = round(max(0.0, 0.50 * pred_res + 0.40 * pred_dir + 0.10 * pred_hub), 2)
                
            # Quantile bounds
            if self.lgb_p10 is not None and self.lgb_p90 is not None:
                p10_min = round(max(fixed, float(self.lgb_p10.predict(input_df)[0])), 2)
                p90_max = round(max(predicted_routine, float(self.lgb_p90.predict(input_df)[0])), 2)
            else:
                p10_min = round(max(fixed, predicted_routine - (1.28 * max(roll_std_3, 1000.0))), 2)
                p90_max = round(predicted_routine + (1.64 * max(roll_std_3, 2000.0)), 2)
                
            model_confidence = "HIGH (Multi-Scale ML Master Ensemble)"

        # -------------------------------------------------------------
        # CALIBRATED SAFETY BUFFER & RISK CLASSIFICATION
        # -------------------------------------------------------------
        emergency_buffer = round(max(
            income * 0.10,
            fixed * 0.25,
            prep['shock_amount'] * 0.20,
            (p90_max - predicted_routine) * 0.50
        ), 2)
        
        safe_total_ceiling = round(predicted_routine + emergency_buffer, 2)
        disposable_savings = round(max(0.0, income - predicted_routine), 2)
        
        burn_rate = predicted_routine / (income + 1.0) if income > 0 else 1.0
        if burn_rate > 0.85:
            risk_flag = "HIGH_SPENDING_RISK"
            risk_msg = "Projected outflows exceed 85% of steady income. Recommend cutting discretionary categories."
        elif burn_rate > 0.65:
            risk_flag = "MODERATE_RISK"
            risk_msg = "Balanced spending budget. Maintain your emergency buffer."
        else:
            risk_flag = "HEALTHY_SURPLUS"
            risk_msg = "Strong liquidity. Substantial monthly savings potential."

        return {
            "sanitized_summary": prep,
            "forecast": {
                "predicted_routine_spend": predicted_routine,
                "confidence_range_p10_p90": {
                    "p10_minimum_survival": p10_min,
                    "p50_expected_routine": predicted_routine,
                    "p90_upper_discretionary": p90_max
                },
                "recommended_emergency_buffer": emergency_buffer,
                "safe_total_budget_ceiling": safe_total_ceiling,
                "estimated_monthly_savings": disposable_savings,
                "confidence_tier": model_confidence
            },
            "financial_health_audit": {
                "risk_status": risk_flag,
                "advisor_insight": risk_msg,
                "is_festive_quarter": bool(is_q4)
            }
        }
