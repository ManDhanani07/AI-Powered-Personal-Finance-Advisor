# 🔍 Comprehensive Machine Learning & Financial Forecasting System Audit
**Project**: AI-Powered Personal Finance Advisor  
**Component**: Expense Prediction Engine (`backend/app/ml_engine/` and `backend/app/services/expense_prediction_service.py`)  
**Auditor**: Senior Machine Learning & Financial Forecasting Engineer  
**Date**: August 20, 2026  

---

## 1. Executive Summary & Audit Scope

This document provides an exhaustive, forensic architectural and data integrity audit of the existing expense forecasting pipeline. The goal is to identify mathematical vulnerabilities, data leakage risks, temporal inconsistencies, outlier handling mechanisms, and algorithmic trade-offs before executing any model refactoring.

---

## 2. Forensic Audit Findings

### 1. Current Architecture
The existing production codebase operates a multi-layered hybrid architecture:
* **Preprocessing Layer (`engine.py::sanitize`)**: Ingests raw transaction dictionaries/DataFrames, performs 3-tier categorical netting (`Fixed Liabilities`, `Routine Essentials`, `Discretionary Spend`, `Shocks`), and normalizes logging days active.
* **Feature Extraction Layer**: Computes multi-frequency Exponentially Weighted Moving Averages ($\text{EMA}_{\text{fast}} \alpha=0.50$, $\text{EMA}_{\text{med}} \alpha=0.30$, $\text{EMA}_{\text{slow}} \alpha=0.15$), expanding medians, 3-month rolling means/medians/std, 6-month rolling metrics, and financial velocity ratios (momentum, recurrence ratio, expense-to-income ratio).
* **Multi-Stage Adaptive Ladder**:
  * **Stage 1 ($N \le 1$ Month)**: Heuristic category elasticity weights (Fixed $\times 1.0$, Routine $\times 1.01$, Discretionary $\times 0.94 / 1.15$).
  * **Stage 2 ($N \in [2, 3]$ Months)**: Adaptive regime-shifting based on $\Delta_{\text{pct}}$ (surge mean-reversion, contraction anchor, momentum projection).
  * **Stage 3 ($N \ge 4$ Months)**: Multi-scale master consensus blending fast/med EMAs, 3-month/6-month rolling means, and trimmed means ($Q_{25}-Q_{75}$), with regime-specific Q1 post-holiday normalizations.
* **Offline Serialized Models**: LightGBM residual booster (`residual_lgbm.txt`), LightGBM direct routine model (`routine_lgbm.txt`), Quantile P10 model (`quantile_p10_lgbm.txt`), Quantile P90 model (`quantile_p90_lgbm.txt`), and Huber linear regressor (`huber_model.pkl`).
* **Service Orchestration (`expense_prediction_service.py`)**: Connects database transactions via SQLAlchemy, groups by `year_month`, builds historical arrays, invokes `engine.predict`, and recursively simulates horizons $M+1, M+2, M+3$.

---

### 2. Current Target Definition
* **Target in Offline Training (`train_multi_user_engine.py`)**:
  * `target_smooth_spend` = $\text{EMA}_{\text{med}}(t+1)$
  * `target_clean_spend` = $\text{Clean Spend}(t+1) = \text{Fixed}(t+1) + \text{Routine}(t+1) + \text{Discretionary}(t+1)$
  * `target_delta` = $\text{target\_smooth\_spend} - \text{base\_anchor}(t)$
* **Target in Production Service (`expense_prediction_service.py`)**:
  * Predicts normal forecastable outflow for month $t+1$: $\hat{y}_{t+1}$.
* **Audit Finding**: In `train_multi_user_engine.py`, predicting $\text{EMA}_{\text{med}}(t+1)$ as a proxy for actual out-of-sample spend artificially suppresses target variance because $\text{EMA}_{\text{med}}(t+1)$ contains smoothed history. The true target must strictly be **$\text{Clean Actual Spend}(t+1)$** or **$\text{Normal Expense}(t+1)$**.

---

### 3. Current Feature Set
The current feature dictionary includes 32 input columns:
* **Lag Features**: `anchor_lag_1`, `anchor_lag_2`, `clean_lag_1`, `clean_lag_2`, `clean_lag_3`.
* **Multi-Scale EMAs**: `ema_fast` ($\alpha=0.50$), `ema_med` ($\alpha=0.30$), `ema_slow` ($\alpha=0.15$).
* **User Location & Baseline Metrics**: `user_median`, `user_fixed_max`, `user_income_med`.
* **Disaggregated Spend Vectors**: `fixed_spend`, `routine_spend`, `disc_spend`, `var_spend`.
* **Ratios & Momentum**: `spend_momentum` ($\text{anchor}_1 / \text{anchor}_2$), `spend_diff_1m`, `rec_ratio` ($\text{fixed} / \text{anchor}_1$), `exp_inc_ratio` ($\text{anchor}_1 / \text{income}$), `disc_ratio`, `routine_ratio`.
* **Rolling Windows**: `roll_mean_3`, `roll_median_3`, `roll_std_3`, `roll_mean_6`, `roll_median_6`.
* **Transaction Metadata**: `tx_count`, `avg_tx_size`.
* **Calendar Features**: `month_num`, `quarter`, `is_q4`, `user_history_months`.

---

### 4. Train / Validation / Test Split Integrity
* **Offline Training Script (`train_multi_user_engine.py`)**: Splits chronologically on year threshold (`year < 2025` for train, `year >= 2025` for test).
* **Audit Finding**: While chronological partitioning is used, the script currently tests on static historical partitions without **Walk-Forward Expanding-Window Validation**. Walk-forward validation must be instituted across multiple temporal folds (e.g. 6 to 12 temporal rolling cutoffs) to prevent lucky-split bias.

---

### 5. Potential Data Leakage Audit

#### A. Temporal Leakage Check
* **Status**: **PASS (in Service Layer)** / **RISK IDENTIFIED (in Training Script)**.
* **Detail**: In `expense_prediction_service.py`, `prior_yms = sorted_ym[:-1]` is passed as `historical_spends` and only month $t$ transactions are passed as current features.
* **Risk in `train_multi_user_engine.py`**:
  * Line 88: `monthly['ema_fast'] = g['clean_spend'].transform(lambda s: s.ewm(alpha=0.50, adjust=False).mean())`
  * When predicting month $t+1$, `clean_spend` at month $t$ is included in the EMA, but if features for month $t$ are aligned with target at $t+1$, the lag alignment must be strictly verified so that no summary statistics computed over the entire series (e.g. whole-user median computed without `.expanding()`) leak future information.

#### B. Feature Leakage Check
* **Status**: **CONTROLLED**.
* Features like `roll_mean_3`, `roll_median_6`, and `ema_fast` are strictly computed on historical and current observation $t$ and shifted relative to target $t+1$.

#### C. Target Leakage Check
* **Status**: **PASS**. Target $\hat{y}_{t+1}$ is computed via `shift(-1)` relative to the feature row.

#### D. Cross-User Contamination Check
* **Status**: **PASS**. Grouping operations explicitly use `groupby('user_id')`, ensuring cross-user statistics do not contaminate individual consumer lag series.

---

### 6. Outlier & Exceptional Event Handling
* **Mechanism**: Scale-Invariant Interquartile Range (IQR) Winsorization:
  $$\text{IQR} = \max\left(Q_{75} - Q_{25}, \, U_{\text{median}} \times 0.12\right)$$
  $$\text{Shock Cutoff} = \max\left(U_{\text{scale}} \times 0.35, \, Q_{75} + 1.6 \times \text{IQR}\right)$$
* **Category Netting**:
  * Fixed Contractual liabilities (Rent, EMI, SIP, Insurance) are separated from variable components.
  * Routine essentials (Groceries, Fuel, Utilities) are preserved up to an essential allowance floor when a shock category (e.g. hospital bill) occurs.
* **Audit Finding**: In raw transaction streams, large legitimate capital movements (e.g. investments, property deposits, mutual fund lump sums) must be categorized under `INVESTMENT` or `TRANSFER` rather than silently deleted.

---

### 7. Missing Value & Sparse History Handling
* **Missing Transactions**: When a user logs 0 transactions or partial month ($< 27$ days), `sanitize` prorates variable spend: $\text{Spend} \times (30.4 / \text{days\_active})$.
* **Sparse History Ladder**:
  * $N=1$: 3-tier domain elasticity model.
  * $N=2..3$: Adaptive regime model.
  * $N \ge 4$: Full multi-scale ensemble.
* **Audit Finding**: Cold-start users with $N=1$ currently rely on domain multipliers ($0.94\times / 1.15\times$). Fallback to population-level median category shares should be measured against baseline models.

---

### 8. Recursive Forecasting Logic ($M+1, M+2, M+3$)
* **Current Implementation**:
  1. Forecast $M+1$ ($\hat{y}_{M+1}$).
  2. Append $\hat{y}_{M+1}$ to simulated historical spend series.
  3. Apply decaying discretionary elasticity ($D_{t+h} = D_t \times 0.75^{h-1}$).
  4. Call `engine.predict` for target month $M+2$.
  5. Repeat for $M+3$.
* **Audit Finding**: Decaying elasticity prevents explosive growth. However, direct multi-horizon forecasting ($\text{Model}_{h=1}, \text{Model}_{h=2}, \text{Model}_{h=3}$) must be empirically benchmarked against recursive forecasting to ensure error compounding does not exceed direct multi-output models.

---

### 9. Quantile Interval Calculation ($P_{10}, P_{50}, P_{90}$)
* **Current Formula**:
  $$P_{10} = \max\left(\text{Fixed}, \, \hat{y} - 1.28 \times \sigma_{\text{effective}}\right)$$
  $$P_{90} = \hat{y} + 1.28 \times \sigma_{\text{effective}} \quad (\text{or } 1.64 \times \sigma_{\text{effective}} \text{ in Q4})$$
  $$\text{Spread}_h = \text{Spread}_1 \times \sqrt{h}$$
* **Audit Finding**: While the analytical interval is symmetrical and scale-aware, it should be benchmarked directly against a **True Quantile LightGBM Regressor (`objective='quantile', alpha=0.10, 0.90`)** to verify empirical coverage (target $\approx 80\%$) on unseen test data without artificial inflation.

---

### 10. Evaluation Metrics Audit
* Current Primary Metrics:
  * $\text{MAE} = \frac{1}{N} \sum |y_i - \hat{y}_i|$
  * $\text{RMSE} = \sqrt{\frac{1}{N} \sum (y_i - \hat{y}_i)^2}$
  * $\text{WAPE} = \frac{\sum |y_i - \hat{y}_i|}{\sum y_i} \times 100\%$
  * $R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$
* **Audit Finding**: In personal finance, WAPE can be unstable when actual spending is very low (e.g. ₹5k-₹10k months). Evaluation must report:
  1. Overall WAPE
  2. Normal-Month WAPE
  3. Median User WAPE
  4. Win Rate vs 3-Month Moving Average Baseline.

---

### 11. Summary of Identified Weaknesses & Deficiencies

1. **Training Target Inconsistency**: Training on smoothed EMA targets ($\text{EMA}_{\text{med}}$) rather than actual clean ground truth monthly outflows masks out-of-sample error.
2. **Lack of Walk-Forward Cross-Validation**: Validation was conducted on fixed year thresholds rather than expanding-window rolling temporal folds.
3. **No Direct vs. Recursive Horizon Benchmark**: Multi-month horizons used recursive autoregression without validating whether Direct Multi-Horizon models achieve lower cumulative error.
4. **Quantile Evaluation Gap**: Quantile intervals need empirical pinball loss and coverage percentage validation across holdout sets.

---

## 3. Recommended Improvement Roadmap

1. **Clean Target Standard**: Standardize the training target to `monthly_clean_normal_expense` across all training pipelines.
2. **Temporal Walk-Forward Validation Engine**: Implement an automated 6-fold expanding-window cross-validation harness.
3. **Multi-Model Benchmark**: Rigorously benchmark Previous Month, 3-Mo Moving Average, EWMA ($\alpha \in [0.1, 0.7]$), Ridge, Random Forest, HistGradientBoosting, LightGBM (L1 / L2 / Huber), and the Adaptive Multi-Scale Ensemble on unseen test data.
4. **Ablation Study**: Systematically measure the individual and combined impact of EWMA, lag features, rolling features, category decomposition, shock winsorization, and quantile regression.
5. **Scenario Robustness Reporting**: Evaluate and report scenario datasets (DS-1 through DS-6) separately from the primary generalization test set.
6. **Automated Validation Test Suite**: Add comprehensive automated test cases for data leakage, chronological sorting, quantile ordering ($P_{10} \le P_{50} \le P_{90}$), non-negativity, and API compatibility.

---
*Audit completed and certified for next-phase implementation.*
