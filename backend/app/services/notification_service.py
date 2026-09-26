"""
Enterprise Notification Service housing Dynamic PostgreSQL Financial Rule Evaluation Engines.
"""

from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal

from app.repositories.notification_repository import NotificationRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.notification import NotificationResponse
from app.models.notification import Notification
from app.core.logging import logger
from app.exceptions.custom_exceptions import NotFoundException, BadRequestException


class NotificationService:
    def __init__(self, db_session):
        self.db = db_session
        self.notif_repo = NotificationRepository(db_session)
        self.tx_repo = TransactionRepository(db_session)
        self.budget_repo = BudgetRepository(db_session)
        self.goal_repo = GoalRepository(db_session)
        self.report_repo = ReportRepository(db_session)

    async def get_user_notifications(
        self,
        user_id: UUID,
        is_read: Optional[bool] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        related_module: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """Fetch stored notifications for user from PostgreSQL without side-effect creation."""
        try:
            await self.evaluate_dynamic_rules(user_id)
        except Exception as e:
            logger.warning(f"Error evaluating notifications for user {user_id}: {e}")

        items, total_count = await self.notif_repo.get_user_notifications(
            user_id=user_id,
            is_read=is_read,
            priority=priority,
            category=category,
            related_module=related_module,
            search=search,
            page=page,
            page_size=page_size,
        )
        unread_count = await self.notif_repo.get_unread_count(user_id)

        items_schema = [NotificationResponse.model_validate(item) for item in items]

        return {
            "items": items_schema,
            "total_count": total_count,
            "unread_count": unread_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
        }

    async def get_unread_summary(self, user_id: UUID, limit: int = 5) -> Dict[str, Any]:
        """Fetch unread count and latest unread notifications for navbar preview popover."""
        try:
            await self.evaluate_dynamic_rules(user_id)
        except Exception as e:
            logger.warning(f"Error evaluating notifications for user {user_id}: {e}")

        count = await self.notif_repo.get_unread_count(user_id)
        latest = await self.notif_repo.get_latest_unread(user_id, limit)
        latest_schema = [NotificationResponse.model_validate(item) for item in latest]
        return {
            "unread_count": count,
            "latest_notifications": latest_schema,
        }

    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Notification:
        """Mark single notification as read."""
        notif = await self.notif_repo.mark_as_read(notification_id, user_id)
        if not notif:
            raise NotFoundException("Notification not found.")
        return notif

    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all unread notifications as read."""
        return await self.notif_repo.mark_all_as_read(user_id)

    async def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        """Delete notification."""
        success = await self.notif_repo.delete_notification(notification_id, user_id)
        if not success:
            raise NotFoundException("Notification not found.")
        return True

    async def evaluate_dynamic_rules(self, user_id: UUID):
        """Evaluate real financial condition rules against PostgreSQL user data."""
        now = datetime.utcnow()
        start_30d = now - timedelta(days=30)

        # 1. Fetch live financial summary & user records
        summary = await self.report_repo.get_income_expense_summary(user_id, None, None)
        txs = await self.report_repo.get_filtered_transactions(user_id, start_date=start_30d, end_date=now)
        budgets_res = await self.budget_repo.get_by_user(user_id)
        budgets = budgets_res.items if hasattr(budgets_res, 'items') else budgets_res
        goals_res = await self.goal_repo.get_by_user(user_id)
        goals = goals_res.items if hasattr(goals_res, 'items') else goals_res
        health_history = await self.report_repo.get_health_score_history(user_id, limit=2)

        # Welcome rule: if total notifications for user is 0 and user is newly onboarded
        total_existing = await self.notif_repo.get_unread_count(user_id)
        if total_existing == 0 and len(txs) == 0:
            if not await self.notif_repo.exists_recent_type(user_id, "WELCOME_NOTIFICATION", 8760):
                await self._create_notification(
                    user_id=user_id,
                    title="👋 Welcome to FinTech AI!",
                    message="Start managing your finances by logging transactions, tracking budget limits, and establishing savings goals.",
                    priority="LOW",
                    category="SYSTEM",
                    notification_type="WELCOME_NOTIFICATION",
                    icon="bell",
                )

        # Rule 1 & 2: Budget Limit Reached & Budget Exceeded
        for b in budgets:
            limit_val = float(b.budget_amount or 0)
            spent_val = float(b.spent_amount or 0)
            if limit_val > 0:
                utilization = (spent_val / limit_val) * 100
                cat_name = b.category.category_name if b.category else (b.budget_name or "Budget")
                if utilization >= 100:
                    notif_type = f"BUDGET_EXCEEDED_{b.id}"
                    if not await self.notif_repo.exists_recent_type(user_id, notif_type, 24):
                        await self._create_notification(
                            user_id=user_id,
                            title=f"🚨 Budget Exceeded: {cat_name}",
                            message=f"You have spent ₹{spent_val:,.0f} of your ₹{limit_val:,.0f} limit ({utilization:.0f}%).",
                            priority="CRITICAL",
                            category="BUDGET",
                            notification_type=notif_type,
                            icon="pie-chart",
                            reference_id=str(b.id),
                        )
                elif utilization >= 80:
                    notif_type = f"BUDGET_WARNING_80_{b.id}"
                    if not await self.notif_repo.exists_recent_type(user_id, notif_type, 24):
                        await self._create_notification(
                            user_id=user_id,
                            title=f"⚠️ Budget Warning (80% Used): {cat_name}",
                            message=f"You have reached {utilization:.0f}% of your ₹{limit_val:,.0f} budget limit.",
                            priority="HIGH",
                            category="BUDGET",
                            notification_type=notif_type,
                            icon="pie-chart",
                            reference_id=str(b.id),
                        )

        # Rule 3 & 4: Goal Completed & Goal Behind Schedule
        for g in goals:
            target = float(g.target_amount or 0)
            current = float(g.current_amount or 0)
            if target > 0:
                pct = (current / target) * 100
                if pct >= 100:
                    notif_type = f"GOAL_COMPLETED_{g.id}"
                    if not await self.notif_repo.exists_recent_type(user_id, notif_type, 48):
                        await self._create_notification(
                            user_id=user_id,
                            title=f"🎉 Savings Goal Achieved: {g.goal_name}",
                            message=f"Congratulations! You reached 100% of your ₹{target:,.0f} target for {g.goal_name}.",
                            priority="HIGH",
                            category="GOAL",
                            notification_type=notif_type,
                            icon="target",
                            reference_id=str(g.id),
                        )
                elif pct < 50 and g.target_date and (g.target_date - now.date()).days < 30:
                    notif_type = f"GOAL_BEHIND_{g.id}"
                    if not await self.notif_repo.exists_recent_type(user_id, notif_type, 48):
                        await self._create_notification(
                            user_id=user_id,
                            title=f"⏳ Goal Behind Schedule: {g.goal_name}",
                            message=f"Target date is approaching in {(g.target_date - now.date()).days} days with {pct:.0f}% saved.",
                            priority="MEDIUM",
                            category="GOAL",
                            notification_type=notif_type,
                            icon="target",
                            reference_id=str(g.id),
                        )

        # Rule 5: Low Account Balance
        net_bal = summary.get("net_savings", 0)
        if net_bal < 10000 and summary.get("transaction_count", 0) > 0:
            notif_type = "LOW_ACCOUNT_BALANCE"
            if not await self.notif_repo.exists_recent_type(user_id, notif_type, 48):
                await self._create_notification(
                    user_id=user_id,
                    title="⚠️ Low Net Balance Warning",
                    message=f"Current net balance is ₹{net_bal:,.0f}. Consider slowing discretionary spend.",
                    priority="HIGH",
                    category="TRANSACTION",
                    notification_type=notif_type,
                    icon="trending-down",
                )

        # Rule 6 & 7: Large Expense (>20k) & Large Income (>50k) Transactions
        for t in txs:
            amt = float(t.amount or 0)
            t_type = (t.transaction_type or "").upper()
            if t_type == "EXPENSE" and amt >= 20000:
                notif_type = f"LARGE_EXPENSE_{t.id}"
                if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                    await self._create_notification(
                        user_id=user_id,
                        title=f"💸 Large Expense Detected: {t.title}",
                        message=f"A large expense of ₹{amt:,.0f} was logged for {t.merchant or 'merchant'}.",
                        priority="HIGH",
                        category="TRANSACTION",
                        notification_type=notif_type,
                        icon="trending-down",
                        reference_id=str(t.id),
                    )
            elif t_type == "INCOME" and amt >= 50000:
                notif_type = f"LARGE_INCOME_{t.id}"
                if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                    await self._create_notification(
                        user_id=user_id,
                        title=f"💰 Large Income Received: {t.title}",
                        message=f"Income credit of ₹{amt:,.0f} has been deposited.",
                        priority="MEDIUM",
                        category="TRANSACTION",
                        notification_type=notif_type,
                        icon="trending-up",
                        reference_id=str(t.id),
                    )

        # Rule 8: Forecast / Cash Flow Warning
        total_exp = summary.get("total_expenses", 0)
        total_inc = summary.get("total_income", 0)
        if total_exp > total_inc and total_inc > 0:
            notif_type = "FORECAST_WARNING"
            if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                await self._create_notification(
                    user_id=user_id,
                    title="🔮 Cash Flow Deficit Warning",
                    message=f"Monthly expenses (₹{total_exp:,.0f}) exceed total income (₹{total_inc:,.0f}).",
                    priority="CRITICAL",
                    category="FORECAST",
                    notification_type=notif_type,
                    icon="sparkles",
                )

        # Rule 9: Low Savings Rate Alert (<15%)
        s_rate = summary.get("savings_rate", 0)
        if s_rate < 15 and summary.get("transaction_count", 0) > 0:
            notif_type = "LOW_SAVINGS_RATE"
            if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                await self._create_notification(
                    user_id=user_id,
                    title="⚠️ Low Savings Rate Alert",
                    message=f"Your current savings rate is {s_rate:.1f}%. Target at least 20% to build financial stability.",
                    priority="HIGH",
                    category="HEALTH",
                    notification_type=notif_type,
                    icon="heart-pulse",
                )

        # Rule 10 & 11: Health Score Changes
        if health_history and len(health_history) >= 1:
            score = health_history[0].get("score", 75)
            if score >= 85:
                notif_type = "HEALTH_SCORE_EXCELLENT"
                if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                    await self._create_notification(
                        user_id=user_id,
                        title="🌟 Financial Health Score: Grade A",
                        message=f"Your Financial Health Score is {score:.0f}/100.",
                        priority="LOW",
                        category="HEALTH",
                        notification_type=notif_type,
                        icon="heart-pulse",
                    )
            elif score < 60:
                notif_type = "HEALTH_SCORE_DECREASED"
                if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                    await self._create_notification(
                        user_id=user_id,
                        title="📉 Financial Health Score Dropped",
                        message=f"Your Financial Health Score dropped to {score:.0f}/100.",
                        priority="HIGH",
                        category="HEALTH",
                        notification_type=notif_type,
                        icon="heart-pulse",
                    )

        # Rule 12 & 13: Subscription & Recurring Bill Reminders (STRICTLY for EXPENSE transactions)
        seen_subscription_keys = set()
        for t in txs:
            t_type = (t.transaction_type or "").upper()
            cat_name = (t.category.category_name if t.category else "").lower()
            if t_type == "EXPENSE" and (
                t.is_recurring or "subscription" in cat_name or "bill" in cat_name or "utility" in cat_name or "rent" in cat_name
            ):
                sub_key = (t.merchant or t.title or "subscription").strip().lower()
                if sub_key in seen_subscription_keys:
                    continue
                seen_subscription_keys.add(sub_key)

                notif_type = f"SUBSCRIPTION_REMINDER_{sub_key}"
                if not await self.notif_repo.exists_recent_type(user_id, notif_type, 72):
                    await self._create_notification(
                        user_id=user_id,
                        title=f"🔄 Recurring Bill / Subscription: {t.title}",
                        message=f"Upcoming recurring payment of ₹{float(t.amount or 0):,.0f} for {t.merchant or 'service'}.",
                        priority="LOW",
                        category="REMINDER",
                        notification_type=notif_type,
                        icon="calendar",
                        reference_id=str(t.id),
                    )

    async def _create_notification(
        self,
        user_id: UUID,
        title: str,
        message: str,
        priority: str,
        category: str,
        notification_type: str,
        metadata_json: Optional[Dict[str, Any]] = None,
        icon: Optional[str] = "bell",
        reference_id: Optional[str] = None,
    ) -> Notification:
        """Internal helper to persist notification into PostgreSQL."""
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            priority=priority.upper(),
            category=category.upper(),
            related_module=category.upper(),
            notification_type=notification_type,
            type=priority.upper(),
            status="UNREAD",
            icon=icon or "bell",
            reference_id=reference_id,
            is_read=False,
            metadata_json=metadata_json,
        )
        return await self.notif_repo.create(notif)
