"""
Goal Service providing financial target tracking, automated progress calculations, and AI-driven smart goal insights.
"""

import math
import uuid
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal

from app.repositories.goal_repository import GoalRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException


class GoalService(BaseService[GoalRepository]):
    def __init__(
        self,
        goal_repository: GoalRepository,
        transaction_repository: Optional[TransactionRepository] = None,
        category_repository: Optional[CategoryRepository] = None,
        notification_repository: Optional[NotificationRepository] = None,
    ):
        super().__init__(goal_repository)
        self.goal_repository = goal_repository
        self.transaction_repository = transaction_repository
        self.category_repository = category_repository
        self.notification_repository = notification_repository

    def _enrich_goal_metrics(self, goal_obj: Any) -> Dict[str, Any]:
        """Calculate dynamic metrics: remaining amount, completion %, remaining months, required monthly saving, performance status."""
        target_amt = float(goal_obj.target_amount or 0.0)
        curr_amt = float(goal_obj.current_amount or 0.0)
        rem_amt = max(target_amt - curr_amt, 0.0)

        comp_pct = min(round((curr_amt / target_amt * 100.0), 2), 100.0) if target_amt > 0 else 0.0

        today = date.today()
        target = goal_obj.target_date

        days_left = max((target - today).days, 1)
        rem_months = max(math.ceil(days_left / 30.4375), 1)

        req_monthly = round(rem_amt / rem_months, 2)
        monthly_contrib = float(getattr(goal_obj, "monthly_contribution", 0.0) or 0.0)

        # Performance Status
        if curr_amt >= target_amt or goal_obj.status == "ACHIEVED":
            perf = "Achieved"
        elif monthly_contrib >= req_monthly and req_monthly > 0:
            perf = "Ahead of Schedule"
        elif monthly_contrib >= (req_monthly * 0.85) and req_monthly > 0:
            perf = "On Track"
        else:
            perf = "Behind Schedule"

        return {
            "remaining_amount": Decimal(str(rem_amt)),
            "completion_percentage": comp_pct,
            "remaining_months": rem_months,
            "required_monthly_saving": Decimal(str(req_monthly)),
            "performance_status": perf,
        }

    async def create_goal(self, user_id: UUID, goal_data: Dict[str, Any]):
        """Create new financial savings goal."""
        target_amount = Decimal(str(goal_data.get("target_amount", 0)))
        if target_amount <= 0:
            raise BadRequestException("Target amount must be greater than zero")

        monthly_contrib = Decimal(str(goal_data.get("monthly_contribution", 0)))
        if monthly_contrib < 0:
            raise BadRequestException("Monthly contribution cannot be negative")

        target_date = goal_data.get("target_date")
        if isinstance(target_date, str):
            parsed_date = None
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                try:
                    parsed_date = datetime.strptime(target_date, fmt).date()
                    break
                except ValueError:
                    continue
            if not parsed_date:
                raise BadRequestException("Invalid target date format. Expected YYYY-MM-DD or DD-MM-YYYY.")
            target_date = parsed_date
        elif isinstance(target_date, datetime):
            target_date = target_date.date()

        if target_date <= date.today():
            raise BadRequestException("Target date must be in the future")

        goal_name = goal_data.get("goal_name", "").strip()
        if not goal_name:
            raise BadRequestException("Goal name is required")

        curr_amt = Decimal(str(goal_data.get("current_amount", 0)))

        # Create goal payload
        goal_payload = {
            "user_id": user_id,
            "goal_name": goal_name,
            "goal_type": (goal_data.get("goal_type") or "SAVINGS").upper().replace(" ", "_"),
            "target_amount": target_amount,
            "current_amount": curr_amt,
            "target_date": target_date,
            "priority": (goal_data.get("priority") or "MEDIUM").upper(),
            "status": "IN_PROGRESS",
        }

        created = await self.goal_repository.create(goal_payload)

        # Log initial deposit as EXPENSE transaction if current_amount > 0 to deduct from surplus
        if curr_amt > 0 and self.transaction_repository:
            try:
                cat_id = None
                if self.category_repository:
                    savings_cat = await self.category_repository.get_by_name("Savings")
                    if savings_cat:
                        cat_id = savings_cat.id
                await self.transaction_repository.create({
                    "transaction_number": f"TXN-{uuid.uuid4().hex[:8].upper()}",
                    "user_id": user_id,
                    "category_id": cat_id,
                    "title": f"Goal Vault Deposit - {goal_name}",
                    "amount": curr_amt,
                    "transaction_type": "EXPENSE",
                    "merchant": "Goal Vault Reserve",
                    "payment_method": "BANK_TRANSFER",
                    "account_type": "SAVINGS",
                    "transaction_date": datetime.now(),
                    "notes": f"Initial allocation of ₹{curr_amt:,.2f} into Goal Vault '{goal_name}' deducted from cash surplus.",
                })
            except Exception as e:
                print(f"[GoalService] Error logging initial goal deposit transaction: {e}")

        metrics = self._enrich_goal_metrics(created)
        for k, v in metrics.items():
            setattr(created, k, v)
        created.monthly_contribution = monthly_contrib
        return created

    async def update_goal(self, goal_id: UUID, user_id: UUID, update_data: Dict[str, Any]):
        """Update existing goal and deduct/restore surplus if current_amount changes."""
        existing = await self.goal_repository.get_by_id(goal_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Goal not found or access denied")

        old_current = Decimal(str(existing.current_amount or 0))

        if "target_amount" in update_data and update_data["target_amount"] is not None:
            amt = Decimal(str(update_data["target_amount"]))
            if amt <= 0:
                raise BadRequestException("Target amount must be greater than zero")
            update_data["target_amount"] = amt

        if "current_amount" in update_data and update_data["current_amount"] is not None:
            c_amt = Decimal(str(update_data["current_amount"]))
            if c_amt < 0:
                raise BadRequestException("Current amount cannot be negative")
            update_data["current_amount"] = c_amt
            if c_amt >= (update_data.get("target_amount") or existing.target_amount):
                update_data["status"] = "ACHIEVED"

        if "target_date" in update_data and update_data["target_date"]:
            t_date = update_data["target_date"]
            if isinstance(t_date, str):
                parsed_date = None
                for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                    try:
                        parsed_date = datetime.strptime(t_date, fmt).date()
                        break
                    except ValueError:
                        continue
                if not parsed_date:
                    raise BadRequestException("Invalid target date format. Expected YYYY-MM-DD or DD-MM-YYYY.")
                t_date = parsed_date
            elif isinstance(t_date, datetime):
                t_date = t_date.date()
            if t_date <= date.today():
                raise BadRequestException("Target date must be in the future")
            update_data["target_date"] = t_date

        if "goal_name" in update_data and update_data["goal_name"]:
            update_data["goal_name"] = update_data["goal_name"].strip()

        if "priority" in update_data and update_data["priority"]:
            update_data["priority"] = update_data["priority"].upper()

        if "status" in update_data and update_data["status"]:
            update_data["status"] = update_data["status"].upper()

        updated = await self.goal_repository.update(goal_id, update_data)

        # Calculate surplus change if current_amount changed
        if "current_amount" in update_data:
            new_current = Decimal(str(update_data["current_amount"]))
            delta = new_current - old_current
            if delta != 0 and self.transaction_repository:
                try:
                    cat_id = None
                    if self.category_repository:
                        savings_cat = await self.category_repository.get_by_name("Savings")
                        if savings_cat:
                            cat_id = savings_cat.id

                    if delta > 0:
                        # Deposit: deduct from surplus (EXPENSE)
                        await self.transaction_repository.create({
                            "transaction_number": f"TXN-{uuid.uuid4().hex[:8].upper()}",
                            "user_id": user_id,
                            "category_id": cat_id,
                            "title": f"Goal Vault Deposit - {updated.goal_name}",
                            "amount": delta,
                            "transaction_type": "EXPENSE",
                            "merchant": "Goal Vault Reserve",
                            "payment_method": "BANK_TRANSFER",
                            "account_type": "SAVINGS",
                            "transaction_date": datetime.now(),
                            "notes": f"Transferred ₹{delta:,.2f} from monthly cash surplus into Goal Vault '{updated.goal_name}'.",
                        })
                    else:
                        # Withdrawal: return to surplus (INCOME)
                        withdraw_amt = abs(delta)
                        await self.transaction_repository.create({
                            "transaction_number": f"TXN-{uuid.uuid4().hex[:8].upper()}",
                            "user_id": user_id,
                            "category_id": cat_id,
                            "title": f"Goal Vault Withdrawal - {updated.goal_name}",
                            "amount": withdraw_amt,
                            "transaction_type": "INCOME",
                            "merchant": "Goal Vault Reserve",
                            "payment_method": "BANK_TRANSFER",
                            "account_type": "SAVINGS",
                            "transaction_date": datetime.now(),
                            "notes": f"Returned ₹{withdraw_amt:,.2f} from Goal Vault '{updated.goal_name}' back into cash surplus.",
                        })
                except Exception as e:
                    print(f"[GoalService] Error logging surplus adjustment transaction: {e}")

        metrics = self._enrich_goal_metrics(updated)
        for k, v in metrics.items():
            setattr(updated, k, v)
        return updated

    async def deposit_funds(self, goal_id: UUID, user_id: UUID, amount: Decimal, notes: Optional[str] = None):
        """Deposit funds into goal vault and deduct money from monthly surplus."""
        if amount <= 0:
            raise BadRequestException("Deposit amount must be greater than zero")

        existing = await self.goal_repository.get_by_id(goal_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Goal not found or access denied")

        old_current = Decimal(str(existing.current_amount or 0))
        new_current = old_current + amount
        status_val = "ACHIEVED" if new_current >= existing.target_amount else existing.status

        updated = await self.goal_repository.update(goal_id, {
            "current_amount": new_current,
            "status": status_val,
        })

        # Deduct deposit amount from surplus by logging an EXPENSE transaction
        if self.transaction_repository:
            try:
                cat_id = None
                if self.category_repository:
                    savings_cat = await self.category_repository.get_by_name("Savings")
                    if savings_cat:
                        cat_id = savings_cat.id

                await self.transaction_repository.create({
                    "transaction_number": f"TXN-{uuid.uuid4().hex[:8].upper()}",
                    "user_id": user_id,
                    "category_id": cat_id,
                    "title": f"Goal Vault Deposit - {existing.goal_name}",
                    "amount": amount,
                    "transaction_type": "EXPENSE",
                    "merchant": "Goal Vault Reserve",
                    "payment_method": "BANK_TRANSFER",
                    "account_type": "SAVINGS",
                    "transaction_date": datetime.now(),
                    "notes": notes or f"Deducted ₹{amount:,.2f} from monthly cash surplus to fund Goal Vault '{existing.goal_name}'.",
                })
            except Exception as e:
                print(f"[GoalService] Error logging deposit transaction: {e}")

        # Dispatch notification
        if self.notification_repository:
            try:
                await self.notification_repository.create({
                    "user_id": user_id,
                    "title": f"Goal Deposit: ₹{amount:,.2f}",
                    "message": f"Successfully allocated ₹{amount:,.2f} to '{existing.goal_name}'. Money deducted from liquid cash surplus.",
                    "priority": "HIGH",
                    "category": "GOAL",
                    "related_module": "GOALS",
                    "notification_type": "GOAL_PROGRESS",
                })
            except Exception as e:
                print(f"[GoalService] Error logging deposit notification: {e}")

        metrics = self._enrich_goal_metrics(updated)
        for k, v in metrics.items():
            setattr(updated, k, v)
        return updated

    async def get_user_goals(
        self,
        user_id: UUID,
        status: Optional[str] = None,
        goal_type: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """Fetch paginated goals with calculated metrics."""
        paginated = await self.goal_repository.get_by_user(
            user_id=user_id,
            status=status,
            goal_type=goal_type,
            priority=priority,
            search=search,
            page=page,
            page_size=page_size,
        )

        enriched_items = []
        for g in paginated.items:
            metrics = self._enrich_goal_metrics(g)
            for k, v in metrics.items():
                setattr(g, k, v)
            enriched_items.append(g)

        paginated.items = enriched_items
        return paginated

    async def get_goal_by_id(self, goal_id: UUID, user_id: UUID):
        """Get single goal by ID with enriched metrics."""
        g = await self.goal_repository.get_by_id(goal_id)
        if not g or g.user_id != user_id:
            raise NotFoundException("Goal not found or access denied")

        metrics = self._enrich_goal_metrics(g)
        for k, v in metrics.items():
            setattr(g, k, v)
        return g

    async def get_goal_summary(self, user_id: UUID):
        """Compute aggregated summary across user financial goals."""
        res = await self.goal_repository.get_by_user(user_id=user_id, page_size=500)
        goals = res.items

        total_target = Decimal("0.00")
        total_saved = Decimal("0.00")
        achieved_cnt = 0
        in_prog_cnt = 0

        highest_prio_goal = None
        nearest_date = None

        for g in goals:
            total_target += Decimal(str(g.target_amount))
            total_saved += Decimal(str(g.current_amount))
            if g.status == "ACHIEVED" or g.current_amount >= g.target_amount:
                achieved_cnt += 1
            else:
                in_prog_cnt += 1

            if g.priority in ["CRITICAL", "HIGH"] and not highest_prio_goal:
                highest_prio_goal = g.goal_name

            if not nearest_date or g.target_date < nearest_date:
                nearest_date = g.target_date

        total_rem = max(total_target - total_saved, Decimal("0.00"))
        tot_saved_flt = float(total_saved)
        tot_target_flt = float(total_target)
        overall_comp = round((tot_saved_flt / tot_target_flt * 100.0), 2) if tot_target_flt > 0 else 0.0

        return {
            "total_target_amount": total_target,
            "total_saved_amount": total_saved,
            "total_remaining_amount": total_rem,
            "overall_completion_pct": overall_comp,
            "total_goals_count": len(goals),
            "achieved_count": achieved_cnt,
            "in_progress_count": in_prog_cnt,
            "highest_priority_goal": highest_prio_goal,
            "nearest_deadline": nearest_date,
        }

    async def get_goal_recommendations(self, user_id: UUID) -> List[Dict[str, Any]]:
        """Generate smart goal recommendations and AI insight alerts."""
        res = await self.goal_repository.get_by_user(user_id=user_id, page_size=500)
        recommendations = []

        for g in res.items:
            metrics = self._enrich_goal_metrics(g)
            comp_pct = metrics["completion_percentage"]
            perf = metrics["performance_status"]
            req_monthly = float(metrics["required_monthly_saving"])

            if comp_pct >= 100.0 or g.status == "ACHIEVED":
                recommendations.append({
                    "goal_id": g.id,
                    "goal_name": g.goal_name,
                    "type": "ACHIEVED",
                    "severity": "SUCCESS",
                    "title": "🎉 Target Achieved!",
                    "message": f"Congratulations! You have successfully reached 100% of your target for '{g.goal_name}'.",
                })
            elif perf == "Behind Schedule":
                recommendations.append({
                    "goal_id": g.id,
                    "goal_name": g.goal_name,
                    "type": "MISSING_DEADLINE",
                    "severity": "WARNING",
                    "title": "⚠️ Behind Target Schedule",
                    "message": f"'{g.goal_name}' is currently behind schedule. Consider increasing monthly savings to ₹{req_monthly:,.2f}/mo.",
                })
            elif perf == "Ahead of Schedule":
                recommendations.append({
                    "goal_id": g.id,
                    "goal_name": g.goal_name,
                    "type": "COMPLETING_EARLY",
                    "severity": "INFO",
                    "title": "🚀 Ahead of Schedule!",
                    "message": f"Great progress! You are saving faster than planned for '{g.goal_name}' and may reach it early.",
                })

        return recommendations

    async def delete_goal(self, goal_id: UUID, user_id: UUID):
        """Delete goal."""
        existing = await self.goal_repository.get_by_id(goal_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Goal not found or access denied")

        await self.goal_repository.delete(goal_id, hard=True)
        return True
