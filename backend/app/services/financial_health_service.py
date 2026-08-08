"""
Financial Health Score Engine Service.
Rule-based weighted scoring engine evaluating PostgreSQL transaction history, budgets, and goals.
"""

import math
from typing import Dict, Any, List, Tuple
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.models.financial_health_history import FinancialHealthHistory
from app.repositories.financial_health_repository import FinancialHealthRepository
from app.schemas.financial_health import (
    FinancialHealthResponse,
    ParameterDetail,
    RecommendationItem,
    FinancialHealthHistoryItem,
    FinancialHealthBreakdownResponse,
)


class FinancialHealthService:
    """
    Weighted Financial Health Engine (Range 0 - 100).
    Weights:
    - Savings Rate: 20%
    - Budget Discipline: 20%
    - Income Stability: 15%
    - Expense Stability: 15%
    - Goal Progress: 10%
    - Emergency Fund: 10%
    - Debt Ratio: 10%
    Total = 100%
    """

    WEIGHTS = {
        "savings_rate": 20.0,
        "budget_discipline": 20.0,
        "income_stability": 15.0,
        "expense_stability": 15.0,
        "goal_progress": 10.0,
        "emergency_fund": 10.0,
        "debt_ratio": 10.0,
    }

    def __init__(self, repository: FinancialHealthRepository):
        self.repo = repository

    @staticmethod
    def _calculate_grade(score: float) -> Tuple[str, str]:
        if score >= 95.0:
            return "A+", "Exceptional financial health with pristine stability & budget discipline."
        elif score >= 90.0:
            return "A", "Excellent financial condition. Strong savings and controlled debt."
        elif score >= 85.0:
            return "B+", "Very good financial standing with healthy cash reserves."
        elif score >= 75.0:
            return "B", "Good overall financial health. Minor room for optimization."
        elif score >= 65.0:
            return "C", "Fair financial condition. Spending or emergency buffer needs attention."
        elif score >= 50.0:
            return "D", "Weak financial metrics. High spending variance or debt burden."
        else:
            return "F", "Critical financial distress. High vulnerability to cash shortfalls."

    async def calculate_health_score(self, user_id: UUID) -> FinancialHealthResponse:
        now = datetime.utcnow()

        # 1. Fetch User Records asynchronously from DB
        transactions = await self.repo.get_user_transactions(user_id)
        budgets = await self.repo.get_user_budgets(user_id)
        goals = await self.repo.get_user_goals(user_id)

        # Check if user has zero transactions
        if not transactions:
            parameters = [
                ParameterDetail(key="savings_rate", name="Savings Rate", weight_pct=20.0, score=0.0, max_score=20.0, percentage=0.0, value_text="0.0% Savings", status="INACTIVE", insight="No transactions recorded yet."),
                ParameterDetail(key="budget_discipline", name="Budget Discipline", weight_pct=20.0, score=0.0, max_score=20.0, percentage=0.0, value_text="0.0% Adherence", status="INACTIVE", insight="No budgets configured."),
                ParameterDetail(key="income_stability", name="Income Stability", weight_pct=15.0, score=0.0, max_score=15.0, percentage=0.0, value_text="0.0% Stable", status="INACTIVE", insight="No income transactions recorded."),
                ParameterDetail(key="expense_stability", name="Expense Stability", weight_pct=15.0, score=0.0, max_score=15.0, percentage=0.0, value_text="0.0% Controlled", status="INACTIVE", insight="No expense transactions recorded."),
                ParameterDetail(key="goal_progress", name="Goal Progress", weight_pct=10.0, score=0.0, max_score=10.0, percentage=0.0, value_text="0.0% Complete", status="INACTIVE", insight="No savings goals created."),
                ParameterDetail(key="emergency_fund", name="Emergency Fund", weight_pct=10.0, score=0.0, max_score=10.0, percentage=0.0, value_text="0.0 Mo. Buffer", status="INACTIVE", insight="No emergency buffer calculated."),
                ParameterDetail(key="debt_ratio", name="Debt Ratio", weight_pct=10.0, score=0.0, max_score=10.0, percentage=0.0, value_text="0.0% EMI Burden", status="INACTIVE", insight="No debt payments detected."),
            ]
            return FinancialHealthResponse(
                user_id=user_id,
                overall_score=0.0,
                grade="N/A",
                summary="No transactions logged yet. Add your first transaction or load sample ledger data to calculate your dynamic health score.",
                calculated_at=now,
                parameters=parameters,
                insights=["Log your first income or expense transaction to calculate your dynamic health score."],
                recommendations=[],
            )

        # ─── PARAMETER 1: SAVINGS RATE (20%) ─────────────────────────────────────
        total_income = sum(
            float(t.amount) for t in transactions if t.transaction_type == "INCOME"
        )
        total_expense = sum(
            float(t.amount) for t in transactions if t.transaction_type == "EXPENSE"
        )

        net_savings = max(0.0, total_income - total_expense)
        savings_rate_pct = (net_savings / total_income * 100.0) if total_income > 0 else 0.0

        # Score: 0% -> 0 pts, 20% -> 12 pts, >= 35% -> 20.0 pts
        savings_score = min(20.0, max(0.0, (savings_rate_pct / 35.0) * 20.0))
        savings_status = "EXCELLENT" if savings_rate_pct >= 30 else ("GOOD" if savings_rate_pct >= 15 else "POOR")
        savings_insight = (
            f"Savings rate is strong at {savings_rate_pct:.1f}% of income."
            if savings_rate_pct >= 20
            else f"Savings rate is low at {savings_rate_pct:.1f}%. Target at least 20%."
        )

        # ─── PARAMETER 2: BUDGET DISCIPLINE (20%) ─────────────────────────────────
        total_budget_limit = sum(float(b.budget_amount) for b in budgets)
        total_budget_spent = sum(float(b.spent_amount) for b in budgets)

        if total_budget_limit > 0:
            budget_overspend = max(0.0, total_budget_spent - total_budget_limit)
            overspend_ratio = budget_overspend / total_budget_limit
            budget_score = max(0.0, 20.0 * (1.0 - overspend_ratio))
            budget_pct = max(0.0, min(100.0, (1.0 - overspend_ratio) * 100.0))
        else:
            budget_score = 18.0
            budget_pct = 90.0

        budget_status = "EXCELLENT" if budget_score >= 18 else ("GOOD" if budget_score >= 14 else "POOR")
        budget_insight = (
            "Budget discipline is strong with zero category overruns."
            if budget_score >= 16
            else f"Budget utilization is high. ₹{max(0, total_budget_spent - total_budget_limit):,.0f} spent over limit."
        )

        # ─── PARAMETER 3: INCOME STABILITY (15%) ─────────────────────────────────
        income_by_month: Dict[str, float] = {}
        for t in transactions:
            if t.transaction_type == "INCOME":
                m_key = t.transaction_date.strftime("%Y-%m")
                income_by_month[m_key] = income_by_month.get(m_key, 0.0) + float(t.amount)

        income_vals = list(income_by_month.values())
        if len(income_vals) >= 2:
            mean_inc = sum(income_vals) / len(income_vals)
            variance_inc = sum((x - mean_inc) ** 2 for x in income_vals) / len(income_vals)
            std_inc = math.sqrt(variance_inc)
            cv_inc = (std_inc / mean_inc) if mean_inc > 0 else 0.0
            income_score = max(0.0, 15.0 * (1.0 - min(1.0, cv_inc * 1.5)))
        else:
            income_score = 13.5
            cv_inc = 0.05

        income_pct = (income_score / 15.0) * 100.0
        income_status = "EXCELLENT" if income_score >= 12.5 else "GOOD"
        income_insight = (
            f"Income streams are steady with low variation ({cv_inc * 100:.1f}% variance)."
            if cv_inc < 0.15
            else f"Income varies by {cv_inc * 100:.1f}% month-over-month."
        )

        # ─── PARAMETER 4: EXPENSE STABILITY (15%) ────────────────────────────────
        expense_by_month: Dict[str, float] = {}
        for t in transactions:
            if t.transaction_type == "EXPENSE":
                m_key = t.transaction_date.strftime("%Y-%m")
                expense_by_month[m_key] = expense_by_month.get(m_key, 0.0) + float(t.amount)

        expense_vals = list(expense_by_month.values())
        if len(expense_vals) >= 2:
            mean_exp = sum(expense_vals) / len(expense_vals)
            variance_exp = sum((x - mean_exp) ** 2 for x in expense_vals) / len(expense_vals)
            std_exp = math.sqrt(variance_exp)
            cv_exp = (std_exp / mean_exp) if mean_exp > 0 else 0.0
            expense_score = max(0.0, 15.0 * (1.0 - min(1.0, cv_exp * 1.2)))
        else:
            expense_score = 13.0
            cv_exp = 0.08

        expense_pct = (expense_score / 15.0) * 100.0
        expense_status = "EXCELLENT" if expense_score >= 12.0 else "FAIR"
        expense_insight = (
            f"Expense outflows are consistent with low volatility ({cv_exp * 100:.1f}%)."
            if cv_exp < 0.20
            else f"High spending fluctuation of {cv_exp * 100:.1f}% month-over-month."
        )

        # ─── PARAMETER 5: GOAL PROGRESS (10%) ────────────────────────────────────
        if goals:
            total_goal_pct = sum(
                min(100.0, (float(g.current_amount) / float(g.target_amount) * 100.0))
                if float(g.target_amount) > 0 else 0.0
                for g in goals
            )
            avg_goal_pct = total_goal_pct / len(goals)
            goal_score = min(10.0, (avg_goal_pct / 100.0) * 10.0)
        else:
            goal_score = 7.5
            avg_goal_pct = 75.0

        goal_status = "EXCELLENT" if goal_score >= 8.0 else ("GOOD" if goal_score >= 5.0 else "POOR")
        goal_insight = f"Savings goal completion is averaging {avg_goal_pct:.1f}% across vaults."

        # ─── PARAMETER 6: EMERGENCY FUND RUNWAY (10%) ────────────────────────────
        avg_monthly_exp = (total_expense / 3.0) if total_expense > 0 else 30000.0
        liquid_savings = net_savings + sum(float(g.current_amount) for g in goals)
        runway_months = (liquid_savings / avg_monthly_exp) if avg_monthly_exp > 0 else 3.0

        emergency_score = min(10.0, max(0.0, (runway_months / 6.0) * 10.0))
        emergency_pct = (emergency_score / 10.0) * 100.0
        emergency_status = "EXCELLENT" if runway_months >= 5.0 else ("GOOD" if runway_months >= 3.0 else "POOR")
        emergency_insight = (
            f"Emergency fund covers {runway_months:.1f} months of living expenses."
            if runway_months >= 3.0
            else f"Emergency fund covers only {runway_months:.1f} months. Recommend 6 months safety net."
        )

        # ─── PARAMETER 7: DEBT RATIO (10%) ──────────────────────────────────────
        debt_payments = sum(
            float(t.amount) for t in transactions
            if t.transaction_type == "EXPENSE" and (
                "emi" in (t.title or "").lower() or "loan" in (t.title or "").lower()
            )
        )
        debt_ratio_pct = (debt_payments / total_income * 100.0) if total_income > 0 else 0.0
        debt_score = max(0.0, 10.0 * (1.0 - min(1.0, debt_ratio_pct / 50.0)))
        debt_pct = (debt_score / 10.0) * 100.0
        debt_status = "EXCELLENT" if debt_ratio_pct <= 15.0 else ("GOOD" if debt_ratio_pct <= 30.0 else "POOR")
        debt_insight = (
            f"Debt-to-income ratio is healthy at {debt_ratio_pct:.1f}%."
            if debt_ratio_pct <= 25.0
            else f"Debt EMI payments consume {debt_ratio_pct:.1f}% of income. Keep below 20%."
        )

        # ─── OVERALL SCORE & GRADE ─────────────────────────────────────────────
        overall_score = round(
            savings_score + budget_score + income_score + expense_score + goal_score + emergency_score + debt_score,
            1
        )
        overall_score = max(0.0, min(100.0, overall_score))
        grade, summary_text = self._calculate_grade(overall_score)

        # ─── ASSEMBLE PARAMETERS ────────────────────────────────────────────────
        parameters = [
            ParameterDetail(
                key="savings_rate",
                name="Savings Rate",
                weight_pct=self.WEIGHTS["savings_rate"],
                score=round(savings_score, 1),
                max_score=20.0,
                percentage=round((savings_score / 20.0) * 100.0, 1),
                value_text=f"{savings_rate_pct:.1f}% Savings",
                status=savings_status,
                insight=savings_insight,
            ),
            ParameterDetail(
                key="budget_discipline",
                name="Budget Discipline",
                weight_pct=self.WEIGHTS["budget_discipline"],
                score=round(budget_score, 1),
                max_score=20.0,
                percentage=round(budget_pct, 1),
                value_text=f"{budget_pct:.1f}% Adherence",
                status=budget_status,
                insight=budget_insight,
            ),
            ParameterDetail(
                key="income_stability",
                name="Income Stability",
                weight_pct=self.WEIGHTS["income_stability"],
                score=round(income_score, 1),
                max_score=15.0,
                percentage=round(income_pct, 1),
                value_text=f"{(1 - cv_inc) * 100:.1f}% Stable",
                status=income_status,
                insight=income_insight,
            ),
            ParameterDetail(
                key="expense_stability",
                name="Expense Stability",
                weight_pct=self.WEIGHTS["expense_stability"],
                score=round(expense_score, 1),
                max_score=15.0,
                percentage=round(expense_pct, 1),
                value_text=f"{(1 - cv_exp) * 100:.1f}% Controlled",
                status=expense_status,
                insight=expense_insight,
            ),
            ParameterDetail(
                key="goal_progress",
                name="Goal Progress",
                weight_pct=self.WEIGHTS["goal_progress"],
                score=round(goal_score, 1),
                max_score=10.0,
                percentage=round(avg_goal_pct, 1),
                value_text=f"{avg_goal_pct:.1f}% Complete",
                status=goal_status,
                insight=goal_insight,
            ),
            ParameterDetail(
                key="emergency_fund",
                name="Emergency Fund",
                weight_pct=self.WEIGHTS["emergency_fund"],
                score=round(emergency_score, 1),
                max_score=10.0,
                percentage=round(emergency_pct, 1),
                value_text=f"{runway_months:.1f} Mo. Buffer",
                status=emergency_status,
                insight=emergency_insight,
            ),
            ParameterDetail(
                key="debt_ratio",
                name="Debt Ratio",
                weight_pct=self.WEIGHTS["debt_ratio"],
                score=round(debt_score, 1),
                max_score=10.0,
                percentage=round(debt_pct, 1),
                value_text=f"{debt_ratio_pct:.1f}% EMI Burden",
                status=debt_status,
                insight=debt_insight,
            ),
        ]

        # ─── GENERATE INSIGHTS LIST ────────────────────────────────────────────
        insights = [p.insight for p in parameters]

        # ─── GENERATE RECOMMENDATIONS ──────────────────────────────────────────
        recommendations: List[RecommendationItem] = []
        rec_id = 1

        if savings_rate_pct < 20.0:
            recommendations.append(
                RecommendationItem(
                    id=str(rec_id),
                    category="SAVINGS",
                    title="Increase Savings Rate to 20%",
                    description=f"Current savings rate is {savings_rate_pct:.1f}%. Set auto-transfers to reroute surplus income into liquid savings vaults.",
                    impact="HIGH",
                    action_type="SET_SAVINGS_RULE",
                )
            )
            rec_id += 1

        if budget_score < 16.0:
            recommendations.append(
                RecommendationItem(
                    id=str(rec_id),
                    category="BUDGET",
                    title="Tighten Discretionary Category Envelopes",
                    description="Reallocate envelope limits to prevent monthly budget overspending.",
                    impact="HIGH",
                    action_type="ADJUST_BUDGET",
                )
            )
            rec_id += 1

        if runway_months < 6.0:
            recommendations.append(
                RecommendationItem(
                    id=str(rec_id),
                    category="EMERGENCY",
                    title="Expand Emergency Fund Buffer",
                    description=f"Current runway is {runway_months:.1f} months. Accumulate at least 6 months of expenses in a high-yield emergency vault.",
                    impact="HIGH",
                    action_type="CREATE_VAULT",
                )
            )
            rec_id += 1

        if debt_ratio_pct > 25.0:
            recommendations.append(
                RecommendationItem(
                    id=str(rec_id),
                    category="DEBT",
                    title="Reduce Debt EMI Burden",
                    description=f"Debt payments consume {debt_ratio_pct:.1f}% of income. Prioritize high-interest loan prepayments.",
                    impact="HIGH",
                    action_type="PREPAY_DEBT",
                )
            )
            rec_id += 1

        if not recommendations:
            recommendations.append(
                RecommendationItem(
                    id=str(rec_id),
                    category="SAVINGS",
                    title="Maintain Pristine Financial Habits",
                    description="Your financial discipline and score are in the top tier. Continue your current budget and vault allocation rules.",
                    impact="LOW",
                    action_type="MAINTAIN_HABITS",
                )
            )

        # ─── STORE HISTORY IN POSTGRESQL ────────────────────────────────────────
        history_record = FinancialHealthHistory(
            user_id=user_id,
            health_score=Decimal(str(overall_score)),
            grade=grade,
            saving_score=Decimal(str(round(savings_score, 2))),
            budget_score=Decimal(str(round(budget_score, 2))),
            income_score=Decimal(str(round(income_score, 2))),
            expense_score=Decimal(str(round(expense_score, 2))),
            goal_score=Decimal(str(round(goal_score, 2))),
            emergency_score=Decimal(str(round(emergency_score, 2))),
            debt_score=Decimal(str(round(debt_score, 2))),
            breakdown={"overall_score": overall_score, "grade": grade, "summary": summary_text},
            recommendations=[r.model_dump() for r in recommendations],
            calculated_at=now,
        )
        await self.repo.save_history(history_record)

        return FinancialHealthResponse(
            overall_score=overall_score,
            grade=grade,
            summary=summary_text,
            calculated_at=now,
            parameters=parameters,
            insights=insights,
            recommendations=recommendations,
        )

    async def get_health_history(self, user_id: UUID, limit: int = 12) -> List[FinancialHealthHistoryItem]:
        transactions = await self.repo.get_user_transactions(user_id)
        if not transactions:
            return []
        records = await self.repo.get_history(user_id, limit)
        return [FinancialHealthHistoryItem.model_validate(r) for r in records]

    async def get_health_breakdown(self, user_id: UUID) -> FinancialHealthBreakdownResponse:
        current_health = await self.calculate_health_score(user_id)
        return FinancialHealthBreakdownResponse(
            overall_score=current_health.overall_score,
            grade=current_health.grade,
            weight_distribution=self.WEIGHTS,
            parameters=current_health.parameters,
            insights=current_health.insights,
        )
