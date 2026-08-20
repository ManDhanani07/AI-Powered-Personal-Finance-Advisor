"""
Robust Multi-Tier Transaction Classification Layer.
Categorizes transactions into:
- NORMAL_CONSUMER_EXPENSE (Routine living essentials)
- FIXED_EXPENSE (Contractual recurring liabilities)
- DISCRETIONARY_EXPENSE (Elastic lifestyle spend)
- INVESTMENT (SIP, Mutual Funds, Stocks, Gold, Fixed Deposits)
- SAVINGS_TRANSFER (Inter-account savings, goal vaults, emergency fund)
- INCOME (Salary, dividends, freelance, interest)
- ONE_OFF_LIFE_EVENT (Medical emergencies, weddings, home repairs, deposits, tax)

Uses merchant + description + category + transaction_type + recurring + amount without solely relying on amount thresholds.
"""

from enum import Enum
from typing import Dict, Any, List
import pandas as pd
import numpy as np


class TransactionFlowType(str, Enum):
    NORMAL_CONSUMER_EXPENSE = "NORMAL_CONSUMER_EXPENSE"
    FIXED_EXPENSE = "FIXED_EXPENSE"
    DISCRETIONARY_EXPENSE = "DISCRETIONARY_EXPENSE"
    INVESTMENT = "INVESTMENT"
    SAVINGS_TRANSFER = "SAVINGS_TRANSFER"
    INCOME = "INCOME"
    ONE_OFF_LIFE_EVENT = "ONE_OFF_LIFE_EVENT"


class TransactionClassifier:
    """
    Forensic transaction classifier separating genuine consumer consumption
    from investment flows, internal transfers, and isolated non-forecastable shocks.
    """

    INVESTMENT_KEYWORDS = [
        'sip', 'mutual fund', 'zerodha', 'groww', 'kuvera', 'et money', 'upstox',
        'shares', 'equity', 'stocks', 'fixed deposit', 'term deposit', 'fd transfer',
        'recurring deposit', 'rd transfer', 'gold purchase', 'sovereign gold bond',
        'ppf', 'nps', 'national pension', 'demat', 'trading account'
    ]

    SAVINGS_TRANSFER_KEYWORDS = [
        'transfer to savings', 'goal vault', 'piggy bank', 'emergency fund',
        'sweep transfer', 'self transfer', 'to own account', 'intra account',
        'vault deposit', 'auto sweep'
    ]

    FIXED_EXPENSE_KEYWORDS = [
        'rent', 'house rent', 'flat rent', 'mortgage', 'home loan', 'car loan',
        'personal loan', 'emi', 'loan repayment', 'bajaj finance', 'hapa loan',
        'life insurance', 'lic', 'term insurance', 'health insurance', 'mediclaim',
        'electricity', 'power bill', 'bescom', 'tata power', 'water bill', 'bwssb',
        'broadband', 'wifi', 'airtel broadband', 'jio fiber', 'act fibernet',
        'subscription', 'netflix', 'spotify', 'amazon prime', 'youtube premium',
        'school fees', 'tuition fees', 'college fees', 'maintenance'
    ]

    SHOCK_EVENT_KEYWORDS = [
        'hospitalization', 'hospital emergency', 'surgery', 'icu', 'emergency room',
        'operation', 'manipal hospital', 'apollo hospital', 'fortis hospital',
        'wedding', 'marriage', 'marriage hall', 'catering', 'wedding jewellery',
        'home renovation', 'interior design', 'painting work', 'major plumbing',
        'property deposit', 'rental deposit', 'security deposit', 'advance token',
        'income tax payment', 'advance tax', 'property tax', 'legal settlement',
        'court fees', 'accident repair', 'car total loss'
    ]

    ROUTINE_EXPENSE_KEYWORDS = [
        'grocery', 'supermarket', 'bigbasket', 'blinkit', 'zepto', 'dmart',
        'milk', 'vegetables', 'fruits', 'meat', 'bakery', 'fuel', 'petrol',
        'diesel', 'cng', 'indian oil', 'hpcl', 'bpcl', 'shell', 'transit',
        'metro', 'bus', 'auto', 'uber', 'ola', 'rapido', 'pharmacy', 'chemist',
        'medicines', 'apollo pharmacy', 'medplus', 'clinic', 'doctor consultation',
        'personal care', 'salon', 'barber', 'gym', 'fitness', 'cult.fit'
    ]

    DISCRETIONARY_KEYWORDS = [
        'shopping', 'myntra', 'amazon shopping', 'flipkart', 'zara', 'h&m',
        'uniqlo', 'lifestyle', 'westside', 'electronics', 'croma', 'reliance digital',
        'apple store', 'gadgets', 'dining', 'restaurant', 'zomato', 'swiggy',
        'barbeque nation', 'starbucks', 'cafe', 'bar', 'pub', 'liquor',
        'entertainment', 'bookmyshow', 'pvr', 'inox', 'movie', 'concert',
        'vacation', 'resort', 'flight', 'makemytrip', 'goibibo', 'hotel', 'airbnb',
        'party', 'gifts', 'festival', 'celebration'
    ]

    @classmethod
    def classify_single(cls, tx: Dict[str, Any]) -> TransactionFlowType:
        """Classifies a single transaction dictionary."""
        amt = float(tx.get('amount', 0.0) or 0.0)
        ttype = str(tx.get('transaction_type', '')).strip().lower()
        cat = str(tx.get('category', '')).strip().lower()
        desc = str(tx.get('description', '')).strip().lower()
        merchant = str(tx.get('merchant', '')).strip().lower()
        rec_raw = tx.get('recurring', False)
        is_rec = bool(str(rec_raw).strip().lower() in ['true', 'yes', 'y', '1', 't'] if not isinstance(rec_raw, bool) else rec_raw)

        text_corpus = f"{cat} {desc} {merchant}".lower()

        # 1. Income check
        if ttype == 'income' or 'salary' in text_corpus or 'dividend' in text_corpus:
            return TransactionFlowType.INCOME

        # 2. Investment check
        if any(k in text_corpus for k in cls.INVESTMENT_KEYWORDS):
            return TransactionFlowType.INVESTMENT

        # 3. Savings transfer check
        if any(k in text_corpus for k in cls.SAVINGS_TRANSFER_KEYWORDS):
            return TransactionFlowType.SAVINGS_TRANSFER

        # 4. One-off exceptional shock life event check
        if any(k in text_corpus for k in cls.SHOCK_EVENT_KEYWORDS):
            return TransactionFlowType.ONE_OFF_LIFE_EVENT

        # 5. Fixed Contractual Liabilities
        if is_rec or any(k in text_corpus for k in cls.FIXED_EXPENSE_KEYWORDS):
            return TransactionFlowType.FIXED_EXPENSE

        # 6. Discretionary elastic spend
        if any(k in text_corpus for k in cls.DISCRETIONARY_KEYWORDS):
            return TransactionFlowType.DISCRETIONARY_EXPENSE

        # 7. Routine essentials
        if any(k in text_corpus for k in cls.ROUTINE_EXPENSE_KEYWORDS):
            return TransactionFlowType.NORMAL_CONSUMER_EXPENSE

        # Default fallback
        return TransactionFlowType.NORMAL_CONSUMER_EXPENSE

    @classmethod
    def classify_dataframe(cls, df: pd.DataFrame) -> pd.DataFrame:
        """Applies classification across a DataFrame of transactions."""
        df_out = df.copy()
        df_out['flow_type'] = df_out.apply(lambda r: cls.classify_single(r.to_dict()).value, axis=1)
        
        # Categorical helper flags
        df_out['is_consumption'] = df_out['flow_type'].isin([
            TransactionFlowType.NORMAL_CONSUMER_EXPENSE.value,
            TransactionFlowType.FIXED_EXPENSE.value,
            TransactionFlowType.DISCRETIONARY_EXPENSE.value
        ])
        df_out['is_investment'] = df_out['flow_type'] == TransactionFlowType.INVESTMENT.value
        df_out['is_savings_transfer'] = df_out['flow_type'] == TransactionFlowType.SAVINGS_TRANSFER.value
        df_out['is_shock'] = df_out['flow_type'] == TransactionFlowType.ONE_OFF_LIFE_EVENT.value
        df_out['is_income'] = df_out['flow_type'] == TransactionFlowType.INCOME.value
        
        return df_out
