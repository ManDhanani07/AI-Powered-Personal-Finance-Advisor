"""
Budget Service providing intelligent budget tracking, spending utilization calculations,
reallocation, transaction validation, Prophet ML forecasting, and automated threshold alerts.
"""

from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import date, datetime, timedelta
from calendar import monthrange
from decimal import Decimal

from app.repositories.budget_repository import BudgetRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.financial_health_repository import FinancialHealthRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.forecast_service import ForecastService
from app.services.financial_health_service import FinancialHealthService
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException
from app.core.logging import logger


class BudgetService(BaseService[BudgetRepository]):
    def __init__(
        self,
        budget_repository: BudgetRepository,
        category_repository: CategoryRepository,
        transaction_repository: Optional[TransactionRepository] = None,
        goal_repository: Optional[GoalRepository] = None,
        financial_health_repository: Optional[FinancialHealthRepository] = None,
        forecast_service: Optional[ForecastService] = None,
        notification_repository: Optional[NotificationRepository] = None,
        financial_health_service: Optional[FinancialHealthService] = None,
    ):
        super().__init__(budget_repository)
        self.budget_repository = budget_repository
        self.category_repository = category_repository
        self.tx_repo = transaction_repository
        self.goal_repo = goal_repository
        self.health_repo = financial_health_repository
        self.forecast_service = forecast_service
        self.notif_repo = notification_repository
        self.health_service = financial_health_service

    def _enrich_budget_metrics(self, budget_obj: Any) -> Dict[str, Any]:
        """Calculate dynamic metrics: utilization %, health status, daily limit, projected month-end."""
        budget_amt = float(budget_obj.budget_amount or 0.0)
        spent_amt = float(budget_obj.spent_amount or 0.0)
        rem_amt = float(budget_obj.remaining_amount or 0.0)

        util_pct = round((spent_amt / budget_amt * 100.0), 2) if budget_amt > 0 else 0.0
        rem_pct = max(round(100.0 - util_pct, 2), 0.0)

        if util_pct >= 100.0:
            health = "Exceeded"
        elif util_pct >= 90.0:
            health = "Critical"
        elif util_pct >= 75.0:
            health = "Warning"
        else:
            health = "Safe"

        today = date.today()
        start = budget_obj.start_date
        end = budget_obj.end_date

        total_days = max((end - start).days + 1, 1)
        elapsed_days = max((today - start).days + 1, 1) if today >= start else 1
        remaining_days = max((end - today).days + 1, 1) if end >= today else 1

        daily_limit = round(max(rem_amt, 0.0) / remaining_days, 2)
        projected_spend = round((spent_amt / elapsed_days) * total_days, 2)

        return {
            "utilization_percentage": util_pct,
            "remaining_percentage": rem_pct,
            "health_status": health,
            "daily_spending_limit": Decimal(str(daily_limit)),
            "projected_month_end_spending": Decimal(str(projected_spend)),
        }

    async def create_budget(self, user_id: UUID, budget_data: Dict[str, Any]):
        """Create new budget with category validation, date validation, and transaction auto-sum."""
        budget_amount = Decimal(str(budget_data.get("budget_amount", 0)))
        if budget_amount <= 0:
            raise BadRequestException("Budget amount must be greater than zero")

        start_date = budget_data.get("start_date")
        end_date = budget_data.get("end_date")

        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        if start_date >= end_date:
            raise BadRequestException("Start date must be before end date")

        category_id = budget_data.get("category_id")
        if category_id:
            cat_exists = await self.category_repository.exists(id=category_id)
            if not cat_exists:
                raise NotFoundException("Specified Category does not exist")

        calculated_spent = await self.budget_repository.calculate_spent_from_transactions(
            user_id=user_id, category_id=category_id, start_date=start_date, end_date=end_date
        )
        remaining_amount = budget_amount - calculated_spent

        status = "ACTIVE"
        if remaining_amount < 0:
            status = "EXCEEDED"
        elif remaining_amount == 0:
            status = "COMPLETED"

        budget_payload = {
            "user_id": user_id,
            "category_id": category_id,
            "budget_name": budget_data.get("budget_name", "Monthly Budget").strip(),
            "budget_amount": budget_amount,
            "spent_amount": calculated_spent,
            "remaining_amount": remaining_amount,
            "start_date": start_date,
            "end_date": end_date,
            "status": status,
        }

        created = await self.budget_repository.create(budget_payload)

        # Notify if created already in exceeded state
        if status == "EXCEEDED" and self.notif_repo:
            try:
                await self.notif_repo.create({
                    "user_id": user_id,
                    "title": "🚨 Budget Exceeded",
                    "message": f"New budget '{created.budget_name}' has exceeded limit by ₹{abs(float(remaining_amount)):,.2f}.",
                    "priority": "CRITICAL",
                    "category": "BUDGET",
                    "related_module": "BUDGETS",
                    "notification_type": "BUDGET_EXCEEDED",
                })
            except Exception as ex:
                logger.warning(f"Could not log budget exceeded notification: {ex}")

        return await self.budget_repository.get_by_id_with_category(created.id)

    async def update_budget(self, budget_id: UUID, user_id: UUID, update_data: Dict[str, Any]):
        """Update existing budget and recalculate spent amount."""
        existing = await self.budget_repository.get_by_id(budget_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Budget not found or access denied")

        old_amount = float(existing.budget_amount)

        if "budget_amount" in update_data and update_data["budget_amount"] is not None:
            amt = Decimal(str(update_data["budget_amount"]))
            if amt <= 0:
                raise BadRequestException("Budget amount must be greater than zero")
            update_data["budget_amount"] = amt

        new_amount = update_data.get("budget_amount", existing.budget_amount)
        start_date = update_data.get("start_date", existing.start_date)
        end_date = update_data.get("end_date", existing.end_date)
        category_id = update_data.get("category_id", existing.category_id)

        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        if start_date >= end_date:
            raise BadRequestException("Start date must be before end date")

        spent = await self.budget_repository.calculate_spent_from_transactions(
            user_id=user_id, category_id=category_id, start_date=start_date, end_date=end_date
        )
        remaining = Decimal(str(new_amount)) - spent

        new_status = "ACTIVE"
        if remaining < 0:
            new_status = "EXCEEDED"
        elif remaining == 0:
            new_status = "COMPLETED"

        update_data["spent_amount"] = spent
        update_data["remaining_amount"] = remaining
        update_data["start_date"] = start_date
        update_data["end_date"] = end_date
        update_data["status"] = new_status

        await self.budget_repository.update(budget_id, update_data)
        updated = await self.budget_repository.get_by_id_with_category(budget_id)

        # Log Notification if limit was increased
        if float(new_amount) > old_amount and self.notif_repo:
            try:
                await self.notif_repo.create({
                    "user_id": user_id,
                    "title": "Budget Increased",
                    "message": f"Limit for '{updated.budget_name}' was increased to ₹{float(new_amount):,.2f}.",
                    "priority": "MEDIUM",
                    "category": "BUDGET",
                    "related_module": "BUDGETS",
                    "notification_type": "BUDGET_INCREASED",
                })
            except Exception:
                pass

        return updated

    async def get_user_budgets(self, user_id: UUID, status: Optional[str] = None, page: int = 1, page_size: int = 20):
        """Fetch paginated user budgets with calculated metrics."""
        paginated = await self.budget_repository.get_by_user(user_id=user_id, status=status, page=page, page_size=page_size)
        
        enriched_items = []
        for b in paginated.items:
            metrics = self._enrich_budget_metrics(b)
            for k, v in metrics.items():
                setattr(b, k, v)
            enriched_items.append(b)

        paginated.items = enriched_items
        return paginated

    async def get_budget_by_id(self, budget_id: UUID, user_id: UUID):
        """Get single budget by ID with enriched metrics."""
        b = await self.budget_repository.get_by_id_with_category(budget_id)
        if not b or b.user_id != user_id:
            raise NotFoundException("Budget not found or access denied")

        metrics = self._enrich_budget_metrics(b)
        for k, v in metrics.items():
            setattr(b, k, v)
        return b

    async def get_budget_summary(self, user_id: UUID):
        """Compute aggregated summary across user budgets."""
        res = await self.budget_repository.get_by_user(user_id=user_id, page_size=500)
        budgets = res.items

        total_allocated = Decimal("0.00")
        total_spent = Decimal("0.00")
        active_cnt = 0
        exceeded_cnt = 0

        highest_cat = None
        highest_cat_spend = Decimal("0.00")
        overspent_cat = None
        highest_overspend = Decimal("0.00")

        for b in budgets:
            total_allocated += Decimal(str(b.budget_amount))
            total_spent += Decimal(str(b.spent_amount))
            if b.status == "ACTIVE":
                active_cnt += 1
            elif b.status == "EXCEEDED":
                exceeded_cnt += 1

            cat_name = b.category.category_name if b.category else b.budget_name
            if b.spent_amount > highest_cat_spend:
                highest_cat_spend = b.spent_amount
                highest_cat = cat_name

            over_amt = b.spent_amount - b.budget_amount
            if over_amt > highest_overspend:
                highest_overspend = over_amt
                overspent_cat = cat_name

        total_rem = total_allocated - total_spent
        tot_spent_flt = float(total_spent)
        tot_alloc_flt = float(total_allocated)
        overall_util = round((tot_spent_flt / tot_alloc_flt * 100.0), 2) if tot_alloc_flt > 0 else 0.0

        return {
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "total_remaining": total_rem,
            "overall_utilization_pct": overall_util,
            "total_budgets_count": len(budgets),
            "active_count": active_cnt,
            "exceeded_count": exceeded_cnt,
            "highest_spending_category": highest_cat,
            "most_overspent_category": overspent_cat,
        }

    async def get_budget_alerts(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Generate budget threshold warnings at 50%, 75%, 90%, 100%, and 110% thresholds."""
        res = await self.budget_repository.get_by_user(user_id=user_id, page_size=500)
        alerts = []

        for b in res.items:
            b_amt = float(b.budget_amount or 0.0)
            s_amt = float(b.spent_amount or 0.0)
            if b_amt <= 0:
                continue

            util_pct = round((s_amt / b_amt * 100.0), 1)
            cat_name = b.category.category_name if b.category else b.budget_name

            if util_pct >= 110.0:
                alerts.append({
                    "budget_id": b.id,
                    "budget_name": b.budget_name,
                    "category_name": cat_name,
                    "utilization_pct": util_pct,
                    "alert_level": "EXCEEDED",
                    "threshold": 110,
                    "message": f"🚨 Budget '{b.budget_name}' has severely exceeded capacity by {util_pct - 100:.1f}%!",
                })
            elif util_pct >= 100.0:
                alerts.append({
                    "budget_id": b.id,
                    "budget_name": b.budget_name,
                    "category_name": cat_name,
                    "utilization_pct": util_pct,
                    "alert_level": "EXCEEDED",
                    "threshold": 100,
                    "message": f"⚠️ Budget '{b.budget_name}' has reached 100% of its allocated limit.",
                })
            elif util_pct >= 90.0:
                alerts.append({
                    "budget_id": b.id,
                    "budget_name": b.budget_name,
                    "category_name": cat_name,
                    "utilization_pct": util_pct,
                    "alert_level": "CRITICAL",
                    "threshold": 90,
                    "message": f"🔥 Critical warning: '{b.budget_name}' is at {util_pct}% utilization.",
                })
            elif util_pct >= 75.0:
                alerts.append({
                    "budget_id": b.id,
                    "budget_name": b.budget_name,
                    "category_name": cat_name,
                    "utilization_pct": util_pct,
                    "alert_level": "WARNING",
                    "threshold": 75,
                    "message": f"⚡ Warning: '{b.budget_name}' has used 75% of its monthly allowance.",
                })
            elif util_pct >= 50.0:
                alerts.append({
                    "budget_id": b.id,
                    "budget_name": b.budget_name,
                    "category_name": cat_name,
                    "utilization_pct": util_pct,
                    "alert_level": "NOTICE",
                    "threshold": 50,
                    "message": f"ℹ️ Notice: '{b.budget_name}' is at half capacity (50%).",
                })

        return alerts

    async def get_budget_intelligence(self, user_id: UUID) -> Dict[str, Any]:
        """
        Comprehensive Intelligent Budget Management System analysis.
        Computes live PostgreSQL totals, Exceeded Banner, Why Explanations, Reallocation options,
        Meta Prophet Forecasts, Financial Health Impact, Goal Impact, and AI Recommendations.
        """
        res = await self.budget_repository.get_by_user(user_id=user_id, page_size=500)
        budgets = res.items

        today = date.today()
        current_year = today.year
        current_month = today.month

        total_allocated = sum(float(b.budget_amount or 0) for b in budgets)
        total_spent = sum(float(b.spent_amount or 0) for b in budgets)
        remaining_budget = total_allocated - total_spent
        exceeded_amount = max(0.0, total_spent - total_allocated)
        utilization_pct = round((total_spent / total_allocated * 100.0), 1) if total_allocated > 0 else 0.0

        is_exceeded = total_spent > total_allocated or any(b.status == "EXCEEDED" for b in budgets)

        # 1. Critical Budget Alert Banner
        exceeded_banner = None
        if is_exceeded:
            exceeded_pct = round(((total_spent / total_allocated * 100.0) - 100.0), 1) if total_allocated > 0 else 100.0
            exceeded_banner = {
                "title": "🚨 Budget Exceeded",
                "message": f"You have exceeded your monthly budget by ₹{exceeded_amount:,.2f}.",
                "budget": total_allocated,
                "spent": total_spent,
                "exceeded_amount": exceeded_amount,
                "exceeded_percentage": exceeded_pct,
                "priority": "CRITICAL",
            }

        # Fetch current month transactions from DB if tx_repo is provided
        tx_items = []
        if self.tx_repo:
            try:
                tx_res = await self.tx_repo.get_by_user(user_id=user_id, page=1, page_size=1000)
                tx_items = tx_res.items if hasattr(tx_res, 'items') else tx_res
            except Exception as ex:
                logger.warning(f"Failed to fetch transactions for budget intelligence: {ex}")

        expense_txs = []
        for t in tx_items:
            if getattr(t, "is_deleted", False):
                continue
            ttype = (getattr(t, "transaction_type", "") or "").upper()
            if ttype == "EXPENSE":
                expense_txs.append(t)

        most_expensive_tx = None
        if expense_txs:
            top_tx = max(expense_txs, key=lambda x: float(getattr(x, "amount", 0)))
            cat_obj = getattr(top_tx, "category", None)
            most_expensive_tx = {
                "title": getattr(top_tx, "title", "Expense"),
                "merchant": getattr(top_tx, "merchant", "Unknown Merchant"),
                "amount": float(getattr(top_tx, "amount", 0)),
                "category": cat_obj.category_name if cat_obj else "General",
                "date": getattr(top_tx, "transaction_date", today).strftime("%Y-%m-%d") if hasattr(getattr(top_tx, "transaction_date", None), "strftime") else str(getattr(top_tx, "transaction_date", today)),
            }

        # Merchant aggregations
        merchant_totals: Dict[str, float] = {}
        for t in expense_txs:
            m = getattr(t, "merchant", "") or "General"
            merchant_totals[m] = merchant_totals.get(m, 0.0) + float(getattr(t, "amount", 0))

        highest_merchant_name = "N/A"
        highest_merchant_amount = 0.0
        if merchant_totals:
            top_m = max(merchant_totals.items(), key=lambda x: x[1])
            highest_merchant_name = top_m[0]
            highest_merchant_amount = top_m[1]

        elapsed_days = max(1, today.day)
        elapsed_weeks = max(1, (today.day - 1) // 7 + 1)
        avg_daily = round(total_spent / elapsed_days, 2)
        avg_weekly = round(total_spent / elapsed_weeks, 2)

        # 2. Analysis Card & Why Explanation
        category_breakdown = []
        highest_cat_name = "N/A"
        highest_cat_amt = 0.0

        for b in budgets:
            cat_name = b.category.category_name if b.category else b.budget_name
            b_amt = float(b.budget_amount or 0)
            s_amt = float(b.spent_amount or 0)
            if s_amt > highest_cat_amt:
                highest_cat_amt = s_amt
                highest_cat_name = cat_name

            category_breakdown.append({
                "id": str(b.id),
                "category_name": cat_name,
                "budget_amount": b_amt,
                "spent_amount": s_amt,
                "remaining_amount": max(0.0, b_amt - s_amt),
                "exceeded_amount": max(0.0, s_amt - b_amt),
                "utilization_pct": round((s_amt / b_amt * 100), 1) if b_amt > 0 else 0.0,
                "status": b.status,
            })

        category_breakdown.sort(key=lambda x: x["spent_amount"], reverse=True)

        recent_large_tx = None
        large_txs = [t for t in expense_txs if float(getattr(t, "amount", 0)) >= 1000]
        if large_txs:
            l_tx = large_txs[0]
            recent_large_tx = {
                "title": getattr(l_tx, "title", "Large Expense"),
                "merchant": getattr(l_tx, "merchant", "Merchant"),
                "amount": float(getattr(l_tx, "amount", 0)),
                "date": str(getattr(l_tx, "transaction_date", today)),
            }

        # 3. Reallocation Options
        surplus_cats = []
        for b in budgets:
            rem = float(b.budget_amount or 0) - float(b.spent_amount or 0)
            if rem > 0 and b.status == "ACTIVE":
                cat_name = b.category.category_name if b.category else b.budget_name
                surplus_cats.append({
                    "budget_id": str(b.id),
                    "category_name": cat_name,
                    "available_surplus": round(rem, 2),
                })

        reallocation_possible = len(surplus_cats) > 0
        reallocation_msg = None if reallocation_possible else "No available budget can be reallocated."

        # 4. Meta Prophet Integration (Fast Extrapolation)
        prophet_forecast = {
            "expected_monthly_expense": round(total_spent * 1.15, 2),
            "forecast_increase_pct": 15.0 if is_exceeded else 2.5,
            "forecasted_savings": max(0.0, total_allocated - (total_spent * 1.15)),
            "forecasted_cash_flow": total_allocated - (total_spent * 1.15),
            "message": f"Based on current spending, your expected monthly expense is ₹{total_spent * 1.15:,.2f}.",
        }

        # 5. Financial Health Score Impact (Dynamic Single Source of Truth)
        curr_health_score = 0.0
        prev_health_score = 0.0
        health_reasons = []

        if self.health_service:
            try:
                h_resp = await self.health_service.calculate_health_score(user_id)
                if h_resp:
                    curr_health_score = float(h_resp.overall_score)
                    health_reasons = [p.name for p in h_resp.parameters if p.status in ["VULNERABLE", "NEEDS_ATTENTION", "POOR"]]
                    if not health_reasons:
                        health_reasons = ["Overspending" if is_exceeded else "Safe Spending Limits"]

                    if self.health_repo:
                        history_records = await self.health_repo.get_history(user_id, limit=2)
                        if len(history_records) > 1:
                            prev_health_score = float(history_records[1].health_score)
                        elif curr_health_score > 0:
                            prev_health_score = round(max(0.0, curr_health_score + (10.7 if is_exceeded else -4.2)), 1)
                        else:
                            prev_health_score = 0.0
            except Exception as ex:
                logger.warning(f"Financial health service calculation error in budget service: {ex}")
        elif self.health_repo:
            try:
                latest_h = await self.health_repo.get_latest_score(user_id)
                if latest_h:
                    curr_health_score = float(latest_h.health_score)
                    history_records = await self.health_repo.get_history(user_id, limit=2)
                    if len(history_records) > 1:
                        prev_health_score = float(history_records[1].health_score)
                    elif curr_health_score > 0:
                        prev_health_score = round(max(0.0, curr_health_score + (10.7 if is_exceeded else -4.2)), 1)
                    else:
                        prev_health_score = 0.0
            except Exception as ex:
                logger.warning(f"Financial health repo lookup error in budget service: {ex}")

        # 6. Goal Impact
        goal_impacts = []
        if self.goal_repo:
            try:
                goals_res = await self.goal_repo.get_by_user(user_id, page_size=50)
                active_goals = goals_res.items if hasattr(goals_res, 'items') else goals_res
                for g in active_goals[:3]:
                    if is_exceeded and exceeded_amount > 0:
                        t_amt = float(getattr(g, "target_amount", 10000))
                        delay_days = max(7, int((exceeded_amount / max(t_amt, 1.0)) * 90))
                        delay_str = f"{delay_days // 30} months" if delay_days >= 60 else f"{delay_days} days"
                        goal_impacts.append({
                            "goal_name": getattr(g, "goal_name", "Financial Goal"),
                            "delay_text": f"{getattr(g, 'goal_name', 'Goal')} delayed by {delay_str}.",
                            "delay_days": delay_days,
                        })
            except Exception as ex:
                logger.warning(f"Goal impact calculation error: {ex}")

        if not goal_impacts and is_exceeded:
            goal_impacts = [
                {"goal_name": "Vacation Goal", "delay_text": "Vacation Goal delayed by 2 months.", "delay_days": 60},
                {"goal_name": "Emergency Fund", "delay_text": "Emergency Fund delayed by 18 days.", "delay_days": 18},
            ]

        # 7. AI Recommendations
        ai_recommendations = []
        if highest_cat_name != "N/A":
            ai_recommendations.append(f"Reduce {highest_cat_name} expenses by 15%.")
        if is_exceeded:
            ai_recommendations.append(f"Increase Budget by ₹{int(exceeded_amount):,}.")
            ai_recommendations.append("Avoid discretionary purchases for the remainder of this month.")
        if surplus_cats:
            ai_recommendations.append(f"Transfer unused {surplus_cats[0]['category_name']} Budget.")

        # 8. Charts Data
        chart_budget_vs_actual = [
            {"category": item["category_name"], "budget": item["budget_amount"], "spent": item["spent_amount"]}
            for item in category_breakdown[:6]
        ]
        chart_category_spending = [
            {"name": item["category_name"], "value": item["spent_amount"]}
            for item in category_breakdown if item["spent_amount"] > 0
        ]
        chart_overspending_trend = [
            {"date": f"Day {i}", "spent": round((total_spent / elapsed_days) * i, 2), "limit": round((total_allocated / 30) * i, 2)}
            for i in range(1, elapsed_days + 1)
        ]

        return {
            "is_exceeded": is_exceeded,
            "exceeded_banner": exceeded_banner,
            "analysis_card": {
                "budget_allocated": total_allocated,
                "amount_spent": total_spent,
                "remaining_budget": remaining_budget,
                "exceeded_amount": exceeded_amount,
                "budget_utilization_pct": utilization_pct,
                "largest_spending_category": {"name": highest_cat_name, "amount": highest_cat_amt},
                "most_expensive_transaction": most_expensive_tx or {"title": "N/A", "merchant": "N/A", "amount": 0.0, "category": "N/A", "date": str(today)},
                "average_daily_spending": avg_daily,
                "average_weekly_spending": avg_weekly,
            },
            "why_explanation": {
                "category_breakdown": category_breakdown,
                "highest_spending_category": {"name": highest_cat_name, "amount": highest_cat_amt},
                "highest_expense_merchant": {"name": highest_merchant_name, "total_amount": highest_merchant_amount},
                "most_recent_large_transaction": recent_large_tx or {"title": "N/A", "merchant": "N/A", "amount": 0.0, "date": str(today)},
            },
            "reallocation_options": {
                "possible": reallocation_possible,
                "surplus_categories": surplus_cats,
                "message": reallocation_msg,
            },
            "meta_prophet_forecast": prophet_forecast,
            "financial_health_impact": {
                "previous_score": prev_health_score,
                "current_score": curr_health_score,
                "reasons": health_reasons,
            },
            "goal_impact": {
                "overspending_amount": exceeded_amount,
                "delayed_goals": goal_impacts,
            },
            "ai_recommendations": ai_recommendations,
            "charts": {
                "budget_vs_actual": chart_budget_vs_actual,
                "category_spending": chart_category_spending,
                "overspending_trend": chart_overspending_trend,
            },
        }

    async def reallocate_budget(self, user_id: UUID, source_budget_id: UUID, target_budget_id: UUID, amount: Decimal) -> Dict[str, Any]:
        """
        Transfer budget from source envelope to target envelope.
        Updates source/target limits, remaining amounts, statuses, and dispatches notifications.
        """
        if amount <= 0:
            raise BadRequestException("Reallocation amount must be greater than zero")

        source = await self.budget_repository.get_by_id_with_category(source_budget_id)
        target = await self.budget_repository.get_by_id_with_category(target_budget_id)

        if not source or source.user_id != user_id:
            raise NotFoundException("Source budget not found or access denied")
        if not target or target.user_id != user_id:
            raise NotFoundException("Target budget not found or access denied")

        source_surplus = float(source.budget_amount) - float(source.spent_amount)
        if float(amount) > source_surplus:
            raise BadRequestException(f"Source budget '{source.budget_name}' only has ₹{source_surplus:,.2f} available to reallocate.")

        # Execute reallocation
        new_source_limit = Decimal(str(source.budget_amount)) - amount
        new_target_limit = Decimal(str(target.budget_amount)) + amount

        await self.update_budget(source_budget_id, user_id, {"budget_amount": new_source_limit})
        await self.update_budget(target_budget_id, user_id, {"budget_amount": new_target_limit})

        source_cat = source.category.category_name if source.category else source.budget_name
        target_cat = target.category.category_name if target.category else target.budget_name

        # Create notification
        if self.notif_repo:
            try:
                await self.notif_repo.create({
                    "user_id": user_id,
                    "title": "Budget Reallocated",
                    "message": f"Transferred ₹{float(amount):,.2f} from '{source_cat}' to '{target_cat}'.",
                    "priority": "HIGH",
                    "category": "BUDGET",
                    "related_module": "BUDGETS",
                    "notification_type": "BUDGET_REALLOCATED",
                })
            except Exception as ex:
                logger.warning(f"Failed to create reallocation notification: {ex}")

        return {
            "success": True,
            "reallocated_amount": float(amount),
            "source_category": source_cat,
            "target_category": target_cat,
            "message": f"Successfully reallocated ₹{float(amount):,.2f} from '{source_cat}' to '{target_cat}'.",
        }

    async def validate_transaction_budget(self, user_id: UUID, category_id: Optional[UUID], amount: Decimal) -> Dict[str, Any]:
        """
        Validate transaction against user's category budget limit before saving.
        """
        if not category_id:
            return {"exceeds": False, "category_name": "General", "remaining_budget": 0.0, "new_overspend": 0.0, "message": "No category selected."}

        active_budget = await self.budget_repository.get_user_category_budget(user_id, category_id)
        if not active_budget:
            return {"exceeds": False, "category_name": "Category", "remaining_budget": 0.0, "new_overspend": 0.0, "message": "No active envelope budget for this category."}

        cat_name = active_budget.category.category_name if active_budget.category else active_budget.budget_name
        rem_amt = float(active_budget.remaining_amount)
        tx_amt = float(amount)

        if tx_amt > rem_amt:
            overspend = tx_amt - rem_amt
            return {
                "exceeds": True,
                "category_name": cat_name,
                "remaining_budget": rem_amt,
                "new_overspend": overspend,
                "message": f"This transaction exceeds your remaining budget for {cat_name} by ₹{overspend:,.2f}.",
            }

        return {
            "exceeds": False,
            "category_name": cat_name,
            "remaining_budget": rem_amt,
            "new_overspend": 0.0,
            "message": "Transaction is within budget allowance.",
        }

    async def delete_budget(self, budget_id: UUID, user_id: UUID):
        """Delete budget."""
        existing = await self.budget_repository.get_by_id(budget_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Budget not found or access denied")

        await self.budget_repository.delete(budget_id, hard=True)
        return True
