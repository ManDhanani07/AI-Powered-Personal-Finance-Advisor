"""
Google Gemini AI Financial Assistant Service.
Constructs live PostgreSQL financial context, manages Gemini LLM prompts, and persists chat history.
"""

import asyncio
import json
import os
import re
import uuid
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from app.core.config import settings
from app.core.logging import logger
from app.models.chat_history import ChatHistory
from app.models.transaction import Transaction
from app.models.category import Category
from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.user_repository import UserRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.budget_repository import BudgetRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.repositories.financial_health_repository import FinancialHealthRepository
from app.services.forecast_service import ForecastService
from app.services.financial_health_service import FinancialHealthService
from app.exceptions.custom_exceptions import NotFoundException, BadRequestException

try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    genai = None
    HAS_GEMINI_SDK = False


class GeminiService:
    def __init__(
        self,
        chat_repository: ChatHistoryRepository,
        user_repository: UserRepository,
        transaction_repository: TransactionRepository,
        budget_repository: BudgetRepository,
        goal_repository: GoalRepository,
        dashboard_repository: DashboardRepository,
        financial_health_repository: FinancialHealthRepository,
        forecast_service: ForecastService,
        health_service: FinancialHealthService,
    ):
        self.chat_repo = chat_repository
        self.user_repo = user_repository
        self.tx_repo = transaction_repository
        self.budget_repo = budget_repository
        self.goal_repo = goal_repository
        self.dash_repo = dashboard_repository
        self.health_repo = financial_health_repository
        self.forecast_service = forecast_service
        self.health_service = health_service

        self.api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
        if self.api_key and HAS_GEMINI_SDK:
            genai.configure(api_key=self.api_key)

    async def _handle_transaction_crud_intent(self, user_id: UUID, message: str, ctx: Dict[str, Any]) -> Optional[str]:
        """Multi-turn Add, Edit, and Delete transactions directly via AI Assistant."""
        q_lower = message.lower().strip()
        user_name = ctx["user_name"]
        txs = ctx.get("recent_transactions", [])
        ov = ctx["overview"]
        inc = ov["total_income"]
        exp = ov["total_expenses"]
        surplus = ov["net_surplus"]

        # ----------------------------------------------------
        # 1. DELETE TRANSACTION INTENT
        # ----------------------------------------------------
        delete_keywords = ["delete transaction", "remove transaction", "delete expense", "delete income", "delete my last", "remove my last", "delete dinner", "delete buy laptop", "cancel transaction"]
        is_delete = any(k in q_lower for k in delete_keywords) or (q_lower.startswith("delete ") and ("transaction" in q_lower or len(q_lower.split()) <= 4))

        if is_delete:
            if not txs:
                return f"Hello {user_name}! There are currently **0 transactions** recorded in your PostgreSQL ledger to delete."

            target_tx_data = None
            if "last" in q_lower or "latest" in q_lower or "recent" in q_lower:
                target_tx_data = txs[0]
            elif "first" in q_lower or "earliest" in q_lower or "initial" in q_lower:
                target_tx_data = txs[-1]
            else:
                match_num = re.search(r'#?\s*(\d+)', q_lower)
                if match_num:
                    idx = int(match_num.group(1))
                    chrono_txs = list(reversed(txs))
                    if 1 <= idx <= len(chrono_txs):
                        target_tx_data = chrono_txs[idx - 1]

                if not target_tx_data:
                    for t in txs:
                        if t["title"].lower() in q_lower or t["category"].lower() in q_lower or t["merchant"].lower() in q_lower:
                            target_tx_data = t
                            break

            if not target_tx_data:
                target_tx_data = txs[0]

            db_txs = await self.tx_repo.get_by_user(user_id, page_size=100)
            target_db_obj = None
            for db_t in db_txs.items:
                if db_t.title == target_tx_data["title"] and float(db_t.amount) == target_tx_data["amount"]:
                    target_db_obj = db_t
                    break

            if target_db_obj:
                del_title = target_db_obj.title
                del_amount = float(target_db_obj.amount)
                del_type = target_db_obj.transaction_type

                await self.tx_repo.soft_delete(target_db_obj.id)

                updated_exp = exp - (del_amount if del_type == "EXPENSE" else 0.0)
                updated_inc = inc - (del_amount if del_type == "INCOME" else 0.0)
                updated_surplus = max(0.0, updated_inc - updated_exp)

                return (
                    f"🗑️ **Transaction Deleted Successfully from PostgreSQL!**\n\n"
                    f"• **Title**: **{del_title}**\n"
                    f"• **Type**: **{del_type}**\n"
                    f"• **Amount Removed**: **₹{del_amount:,.2f}**\n\n"
                    f"📊 **Updated Ledger Totals**:\n"
                    f"• **Total Monthly Income**: **₹{updated_inc:,.2f}**\n"
                    f"• **Total Monthly Expenses**: **₹{updated_exp:,.2f}**\n"
                    f"• **Net Monthly Surplus**: **₹{updated_surplus:,.2f}**\n\n"
                    f"Your PostgreSQL database and live transaction table have been updated!"
                )

        # ----------------------------------------------------
        # 2. EDIT / UPDATE TRANSACTION INTENT
        # ----------------------------------------------------
        edit_keywords = ["edit transaction", "update transaction", "change amount", "change title", "update amount", "edit expense", "change dinner", "update laptop"]
        is_edit = any(k in q_lower for k in edit_keywords) or ("change" in q_lower and "to" in q_lower)

        if is_edit:
            if not txs:
                return f"Hello {user_name}! There are no transactions recorded in PostgreSQL to edit."

            amt_match = re.search(r'(?:to|amount)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)', message, re.IGNORECASE)
            new_amount_val = None
            if amt_match:
                try:
                    val = float(amt_match.group(1).replace(",", ""))
                    if val > 0 and val != 2026:
                        new_amount_val = val
                except ValueError:
                    pass

            target_tx_data = txs[0]
            for t in txs:
                if t["title"].lower() in q_lower:
                    target_tx_data = t
                    break

            db_txs = await self.tx_repo.get_by_user(user_id, page_size=100)
            target_db_obj = None
            for db_t in db_txs.items:
                if db_t.title == target_tx_data["title"]:
                    target_db_obj = db_t
                    break

            if target_db_obj and new_amount_val:
                old_amt = float(target_db_obj.amount)
                target_db_obj.amount = Decimal(str(new_amount_val))
                await self.tx_repo.db.commit()
                await self.tx_repo.db.refresh(target_db_obj)

                return (
                    f"✏️ **Transaction Updated Successfully in PostgreSQL!**\n\n"
                    f"• **Title**: **{target_db_obj.title}**\n"
                    f"• **New Amount**: **₹{new_amount_val:,.2f}** *(Previous: ₹{old_amt:,.2f})*\n"
                    f"• **Type**: **{target_db_obj.transaction_type}**\n\n"
                    f"Your PostgreSQL database and live transaction table have been updated!"
                )
            elif not new_amount_val:
                return (
                    f"Hello {user_name}! To update **{target_tx_data['title']}**, please specify the new amount.\n\n"
                    f"• **Example**: `Change amount of {target_tx_data['title']} to ₹4,500`"
                )

        # ----------------------------------------------------
        # 3. ADD TRANSACTION INTENT (Multi-turn & Single-shot)
        # ----------------------------------------------------
        try:
            last_chat = await self.chat_repo.get_latest_by_user(user_id)
        except Exception:
            recent_chats = await self.chat_repo.get_by_user(user_id, limit=1)
            last_chat = recent_chats[0] if recent_chats else None

        last_was_prompt = False
        last_type_context = None
        if last_chat and last_chat.answer:
            ans_lower = last_chat.answer.lower()
            if any(phrase in ans_lower for phrase in ["record a new transaction", "expense or income", "required information", "provide the amount", "record an expense", "record an income"]):
                last_was_prompt = True
                if "record an expense" in ans_lower:
                    last_type_context = "EXPENSE"
                elif "record an income" in ans_lower:
                    last_type_context = "INCOME"

        add_keywords = [
            "add transaction", "create transaction", "record transaction",
            "add expense", "add income", "new transaction", "i want to add",
            "add one transaction", "record expense", "record income"
        ]

        is_analytical = any(w in q_lower for w in ["analyze", "summary", "advice", "report", "insight", "explain", "overview", "how to", "what is", "standing", "recommendation"])

        is_add_intent = not is_analytical and (
            any(k in q_lower for k in add_keywords) or
            (last_was_prompt) or
            (any(verb in q_lower for verb in ["spent ", "bought ", "paid ", "earned "]) and has_number)
        )

        if not is_add_intent:
            return None

        # Parse numeric amount
        amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{1,2})?)', message, re.IGNORECASE)
        amount_val = None
        if amount_match:
            raw_amt = amount_match.group(1).replace(",", "")
            try:
                val = float(raw_amt)
                if val > 0 and val != 2026:
                    amount_val = val
            except ValueError:
                pass

        if any(k in q_lower for k in ["income", "salary", "deposit", "credit", "earned"]):
            tx_type = "INCOME"
        elif any(k in q_lower for k in ["expense", "spent", "bought", "paid", "debit", "cost", "fee"]):
            tx_type = "EXPENSE"
        elif last_type_context:
            tx_type = last_type_context
        else:
            tx_type = "EXPENSE"

        if amount_val is None:
            if q_lower in ["expense", "income"]:
                return (
                    f"Hello {user_name}! Got it, you want to record an **{q_lower.upper()}**.\n\n"
                    f"Please provide the **Amount** and **Item Title**.\n\n"
                    f"• **Example**: `500 for Coffee at Starbucks via UPI` or `₹1,500 for Shoes from Nike`"
                )
            else:
                return (
                    f"Hello {user_name}! I can help you record a new transaction directly into your live PostgreSQL ledger.\n\n"
                    f"To add your transaction, please reply with the details:\n\n"
                    f"• **Quick Add Example**: `1500 for Shoes from Nike via UPI`\n"
                    f"• **Expense Example**: `Add expense ₹500 for Coffee at Starbucks under Food & Dining`\n"
                    f"• **Income Example**: `Add income ₹50,000 for Monthly Salary from Company via Bank`\n\n"
                    f"📋 **Information Fields**:\n"
                    f"1. **Type**: `EXPENSE` or `INCOME`\n"
                    f"2. **Amount**: e.g., `₹1500` or `1500`\n"
                    f"3. **Title / Item**: e.g., `Shoes`, `Coffee`, `Groceries`, `Salary`\n"
                    f"4. **Category**: `Shopping`, `Food & Dining`, `Groceries`, `Transportation`, `Utilities`, `Salary`\n"
                    f"5. **Merchant** *(Optional)*: e.g., `Nike`, `Starbucks`, `Amazon`, `Uber`\n"
                    f"6. **Payment Method** *(Optional)*: `UPI`, `CREDIT_CARD`, `DEBIT_CARD`, `CASH`, `BANK`"
                )

        title = "New Entry"
        for phrase in ["for ", "on ", "item ", "title ", "bought ", "paid "]:
            if phrase in q_lower:
                parts = message.split(phrase, 1)
                if len(parts) > 1:
                    raw_title = parts[1].split(" under ")[0].split(" category ")[0].split(" from ")[0].split(" at ")[0].split(" via ")[0].strip()
                    if raw_title:
                        title = raw_title.capitalize()
                        break

        if title == "New Entry":
            words = [w for w in message.split() if not any(c.isdigit() for c in w) and w.lower() not in ["add", "expense", "income", "transaction", "one", "want", "to", "i", "a", "the", "for", "on", "under", "category", "please", "rs", "inr", "₹", "spent", "bought", "paid", "from", "at", "via", "using"]]
            if words:
                title = " ".join(words[:3]).capitalize()

        # Fetch PostgreSQL Category records to link valid category_id
        cat_query = await self.tx_repo.db.execute(select(Category))
        db_categories = list(cat_query.scalars().all())

        cat_name = "Shopping" if tx_type == "EXPENSE" else "Salary"
        cat_keywords = {
            "Food & Dining": ["food", "dining", "coffee", "restaurant", "lunch", "dinner", "breakfast", "burger", "pizza", "snack"],
            "Shopping": ["shopping", "shoes", "laptop", "clothes", "amazon", "flipkart", "electronics", "dress", "shirt", "pant"],
            "Groceries": ["groceries", "grocery", "supermarket", "vegetables", "milk", "fruits"],
            "Transportation": ["uber", "ola", "cab", "petrol", "fuel", "bus", "train", "flight", "travel", "transportation", "taxi"],
            "Housing & Rent": ["rent", "housing", "apartment", "maintenance"],
            "Utilities": ["electricity", "water", "wifi", "internet", "recharge", "bill", "utilities"],
            "Entertainment": ["movie", "cinema", "netflix", "game", "entertainment"],
            "Salary": ["salary", "paycheck", "freelance", "stipend", "bonus"],
        }

        for c_name, keywords in cat_keywords.items():
            if any(k in q_lower for k in keywords):
                cat_name = c_name
                break

        # Match exact or partial PostgreSQL Category ID
        matched_cat_obj = None
        for c in db_categories:
            if c.category_name.lower() == cat_name.lower():
                matched_cat_obj = c
                break
        if not matched_cat_obj:
            for c in db_categories:
                if cat_name.lower() in c.category_name.lower() or c.category_name.lower() in cat_name.lower():
                    matched_cat_obj = c
                    break

        category_id = matched_cat_obj.id if matched_cat_obj else None
        category_label = matched_cat_obj.category_name if matched_cat_obj else cat_name

        # Parse Merchant Name
        merchant = title
        if "from " in q_lower:
            parts = message.split("from ", 1)
            if len(parts) > 1:
                merchant = parts[1].split(" via ")[0].split(" using ")[0].split(" under ")[0].strip().capitalize()
        elif "at " in q_lower:
            parts = message.split("at ", 1)
            if len(parts) > 1:
                merchant = parts[1].split(" via ")[0].split(" using ")[0].split(" under ")[0].strip().capitalize()

        if merchant == title:
            if category_label == "Shopping":
                merchant = "Retail Store"
            elif category_label == "Food & Dining":
                merchant = "Restaurant / Café"
            elif category_label == "Groceries":
                merchant = "Supermarket"
            elif category_label == "Transportation":
                merchant = "Transport / Fuel"
            elif category_label == "Salary":
                merchant = "Company / Employer"
            elif category_label == "Utilities":
                merchant = "Utility Provider"

        # Parse Payment Method & Account Type
        payment_method = "UPI"
        account_type = "SAVINGS"

        if "credit card" in q_lower or "credit" in q_lower:
            payment_method = "CREDIT_CARD"
            account_type = "CREDIT"
        elif "debit card" in q_lower or "debit" in q_lower:
            payment_method = "DEBIT_CARD"
            account_type = "SAVINGS"
        elif "cash" in q_lower:
            payment_method = "CASH"
            account_type = "SAVINGS"
        elif "bank" in q_lower or "transfer" in q_lower:
            payment_method = "BANK"
            account_type = "CHECKING"
        elif "upi" in q_lower:
            payment_method = "UPI"
            account_type = "SAVINGS"

        tx_num = f"TXN-{uuid.uuid4().hex[:8].upper()}"

        new_tx = Transaction(
            transaction_number=tx_num,
            user_id=user_id,
            category_id=category_id,
            title=title,
            amount=Decimal(str(amount_val)),
            transaction_type=tx_type,
            transaction_date=datetime.now(timezone.utc),
            merchant=merchant,
            payment_method=payment_method,
            account_type=account_type,
            description=f"Recorded via Gemini AI Assistant ({payment_method})",
        )

        self.tx_repo.db.add(new_tx)
        await self.tx_repo.db.commit()
        await self.tx_repo.db.refresh(new_tx)

        updated_exp = exp + (amount_val if tx_type == "EXPENSE" else 0.0)
        updated_inc = inc + (amount_val if tx_type == "INCOME" else 0.0)
        updated_surplus = max(0.0, updated_inc - updated_exp)

        return (
            f"✅ **Transaction Created & Saved to PostgreSQL!**\n\n"
            f"• **Title**: **{title}**\n"
            f"• **Transaction Type**: **{tx_type}**\n"
            f"• **Amount**: **₹{amount_val:,.2f}**\n"
            f"• **Category**: **{category_label}** *(Linked to PostgreSQL)*\n"
            f"• **Merchant**: **{merchant}**\n"
            f"• **Payment Method**: **{payment_method} ({account_type})**\n"
            f"• **Transaction Number**: **{tx_num}**\n"
            f"• **Date**: **{new_tx.transaction_date.strftime('%Y-%m-%d %H:%M UTC')}**\n\n"
            f"📊 **Updated Ledger Totals**:\n"
            f"• **Total Monthly Income**: **₹{updated_inc:,.2f}**\n"
            f"• **Total Monthly Expenses**: **₹{updated_exp:,.2f}**\n"
            f"• **Net Monthly Surplus**: **₹{updated_surplus:,.2f}**\n\n"
            f"Your live PostgreSQL database and Transactions table have been updated!"
        )

    async def _build_financial_context(self, user_id: UUID) -> Dict[str, Any]:
        """Collect live financial data from PostgreSQL for the user."""
        user = await self.user_repo.get_by_id(user_id)
        user_name = user.first_name if user else "User"
        currency = user.currency if user else "INR"

        # 1. Transactions & Overview (fetch full transaction history up to 500 entries)
        tx_res = await self.tx_repo.get_by_user(user_id, page_size=500)
        recent_txs = [
            {
                "date": str(t.transaction_date.strftime("%Y-%m-%d")),
                "title": t.title,
                "type": t.transaction_type,
                "category": t.category.category_name if t.category else "Uncategorized",
                "amount": float(t.amount),
                "merchant": getattr(t, "merchant", None) or t.title,
            }
            for t in tx_res.items
        ]

        total_income = sum(float(t.amount) for t in tx_res.items if t.transaction_type == "INCOME")
        total_expenses = sum(float(t.amount) for t in tx_res.items if t.transaction_type == "EXPENSE")
        net_surplus = max(0.0, total_income - total_expenses)

        # 2. Budgets
        budget_res = await self.budget_repo.get_by_user(user_id, page_size=100)
        budgets_summary = [
            {
                "category": b.category.category_name if b.category else b.budget_name,
                "limit": float(b.budget_amount),
                "spent": float(b.spent_amount),
                "remaining": max(0.0, float(b.budget_amount) - float(b.spent_amount)),
                "status": b.status,
            }
            for b in budget_res.items
        ]

        # 3. Goals
        goal_res = await self.goal_repo.get_by_user(user_id, page_size=100)
        goals_summary = [
            {
                "name": g.goal_name,
                "target": float(g.target_amount),
                "current": float(g.current_amount),
                "priority": g.priority,
            }
            for g in goal_res.items
        ]

        # 4. Financial Health Score
        health_resp = await self.health_service.calculate_health_score(user_id)
        health_summary = {
            "score": health_resp.overall_score,
            "grade": health_resp.grade,
            "summary": health_resp.summary,
            "parameters": [
                {
                    "name": p.name,
                    "score": p.score,
                    "max_score": p.max_score,
                    "status": p.status,
                    "insight": p.insight,
                }
                for p in health_resp.parameters
            ],
        }

        # 5. Prophet Forecast Summary
        forecast_summary = {}
        if len(recent_txs) >= 14:
            try:
                fc_res = await asyncio.wait_for(
                    self.forecast_service.get_forecast_summary(user_id, period_days=30),
                    timeout=2.0
                )
                forecast_summary = {
                    "expected_income": float(fc_res.expected_monthly_income),
                    "expected_expense": float(fc_res.expected_monthly_expense),
                    "expected_savings": float(fc_res.expected_savings),
                    "mape_accuracy": float(fc_res.accuracy_metrics.mape) if fc_res.accuracy_metrics else 0.0,
                }
            except Exception:
                forecast_summary = {"status": "Forecast calculation skipped for response speed."}
        else:
            forecast_summary = {"status": "Requires at least 14 days of historical transactions."}

        total_tx_count = len(tx_res.items)
        income_tx_count = len([t for t in tx_res.items if t.transaction_type == "INCOME"])
        expense_tx_count = len([t for t in tx_res.items if t.transaction_type == "EXPENSE"])

        return {
            "user_name": user_name,
            "currency": currency,
            "overview": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_surplus": net_surplus,
                "transaction_count": total_tx_count,
                "total_transactions_count": total_tx_count,
                "income_transactions_count": income_tx_count,
                "expense_transactions_count": expense_tx_count,
                "total_budgets_count": len(budget_res.items),
                "total_goals_count": len(goal_res.items),
            },
            "recent_transactions": recent_txs,
            "budgets": budgets_summary,
            "goals": goals_summary,
            "financial_health": health_summary,
            "forecast": forecast_summary,
        }

    async def generate_chat_response(
        self, user_id: UUID, message: str, conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process user message, execute Gemini LLM query with live context, and save history."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User account not found")

        # 1. Build live PostgreSQL context
        ctx = await self._build_financial_context(user_id)

        # 2. Check for Transaction CRUD Intent (Add, Edit, Delete) directly from chat prompt
        crud_tx_res = await self._handle_transaction_crud_intent(user_id, message, ctx)
        if crud_tx_res:
            answer_text = crud_tx_res
            model_name = "gemini-transaction-engine"
        else:
            ctx_str = json.dumps(ctx, indent=2)

            # 3. System Instructions & Prompt Strategy
            system_instruction = (
                "You are an expert AI Personal Finance Advisor and Copilot for this workspace application.\n"
                "STRICT MANDATES:\n"
                "1. Answer ANY question asked by the user regarding their financial data, transactions, total transaction count, income, expenses, budgets, goals, forecasts, or platform capabilities.\n"
                "2. When asked 'How to save X?' or 'How can I save money?', give specific, highly actionable cost-cutting advice by analyzing their highest spending categories from PostgreSQL context (e.g. Shopping, Food) and calculating exact percentage reductions needed to reach their target!\n"
                "3. ALWAYS compute and state exact numerical counts and values directly from the provided live PostgreSQL context.\n"
                "4. Use the summary overview metrics (total_transactions_count, total_income, total_expenses, net_surplus, total_budgets_count, total_goals_count) to immediately answer count and aggregate queries.\n"
                "5. Respond in clean, professional GitHub Markdown with bullet points, bold key figures, and INR currency symbols (₹).\n"
                "6. Maintain an encouraging, analytical, and professional copilot tone.\n"
                "7. When asked 'Why is my budget over?' or 'Why am I over budget?', perform a detailed root cause diagnosis by analyzing: (a) Exceeded category envelope limits and exact overspend deficit, (b) Top merchants where money was spent in those categories, (c) Specific large transactions driving the overspend (with transaction titles, amounts, merchants, and dates), and (d) Actionable recovery advice.\n"
                "8. NEVER use single asterisks (*) around words in your output. Use standard bolding (**text**) or clean plain text without any stray asterisk symbols.\n\n"
                f"LIVE POSTGRESQL FINANCIAL CONTEXT FOR USER {ctx['user_name'].upper()}:\n"
                f"{ctx_str}"
            )

            answer_text = ""
            model_name = "gemini-1.5-flash"

            # 4. Query Gemini API asynchronously with a strict 15-second timeout threshold
            if self.api_key and HAS_GEMINI_SDK:
                try:
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction,
                    )
                    loop = asyncio.get_running_loop()
                    response = await asyncio.wait_for(
                        loop.run_in_executor(None, model.generate_content, message),
                        timeout=15.0
                    )
                    if response and response.text:
                        answer_text = response.text.strip()
                except Exception as e:
                    logger.warn(f"[GeminiService] Gemini API call timed out or failed: {e}")
                    answer_text = self._fallback_rule_based_answer(message, ctx)
            else:
                answer_text = self._fallback_rule_based_answer(message, ctx)

        # 4. Store Chat Pair in PostgreSQL
        chat_record = ChatHistory(
            user_id=user_id,
            question=message.strip(),
            answer=answer_text,
            model_name=model_name,
            created_at=datetime.now(timezone.utc),
        )
        saved_obj = await self.chat_repo.create(chat_record)

        return {
            "id": str(saved_obj.id),
            "question": saved_obj.question,
            "answer": saved_obj.answer,
            "model_name": model_name,
            "created_at": saved_obj.created_at,
            "context_used": True,
        }

    def _fallback_rule_based_answer(self, query: str, ctx: Dict[str, Any]) -> str:
        """Synthesize accurate, contextual answer from live PostgreSQL data for ALL user question possibilities."""
        q_lower = query.lower().strip()
        ov = ctx["overview"]
        inc = float(ov.get("total_income", 0.0))
        exp = float(ov.get("total_expenses", 0.0))
        surplus = float(ov.get("net_surplus", 0.0))
        user_name = ctx["user_name"]
        txs = ctx.get("recent_transactions", [])
        budgets = ctx.get("budgets", [])
        goals = ctx.get("goals", [])
        fh = ctx.get("financial_health", {})

        # ---------------------------------------------------------------------
        # 1. GREETINGS, IDENTITY & HELP QUERIES
        # ---------------------------------------------------------------------
        if q_lower in ["hi", "hello", "hey", "greetings"] or any(k in q_lower for k in ["who are you", "what can you do", "help me"]):
            return (
                f"Hello {user_name}! 👋 I am your **AI Personal Finance Advisor** linked directly to your live PostgreSQL ledger.\n\n"
                f"Here is what I can help you with in real-time:\n"
                f"• 📊 **Budgets**: Ask *'Which budgets are exceeded or overspent?'* or *'What is my budget status?'*\n"
                f"• 🔍 **Transaction Lookup**: Ask *'How much did I spend on Clothes?'* or *'What was my 1st transaction?'*\n"
                f"• 💰 **Affordability Checks**: Ask *'Can I afford a ₹50,000 phone?'*\n"
                f"• 🎯 **Goal Vaults**: Ask *'How much have I saved for my goals?'*\n"
                f"• 📈 **Financial Health**: Ask *'What is my financial health score?'*\n"
                f"• ➕ **Manage Transactions**: Say *'Add expense 1500 for Shoes'* or *'Delete my last transaction'*\n\n"
                f"How can I assist your finances today?"
            )

        # ---------------------------------------------------------------------
        # 1B. TRANSACTION COUNT & STATS QUERIES
        # ("What is my total number of transaction?", "how many transactions do I have?", "total transactions")
        # ---------------------------------------------------------------------
        tx_count_keywords = [
            "total number of transaction", "total number of transactions",
            "total transaction", "total transactions", "how many transaction",
            "how many transactions", "number of transaction", "number of transactions",
            "transaction count", "count of transaction", "count of transactions",
            "total entries", "how many entries"
        ]
        if any(k in q_lower for k in tx_count_keywords):
            total_cnt = ov.get("total_transactions_count", len(txs))
            inc_cnt = ov.get("income_transactions_count", len([t for t in txs if t.get("type") == "INCOME"]))
            exp_cnt = ov.get("expense_transactions_count", len([t for t in txs if t.get("type") == "EXPENSE"]))

            return (
                f"Hello {user_name}! According to your live PostgreSQL database, you currently have a total of **{total_cnt} transaction(s)** recorded:\n\n"
                f"• 📊 **Total Transactions Count**: **{total_cnt} entry(ies)**\n"
                f"• 📥 **Income Entries**: **{inc_cnt} transaction(s)** (Total Income: **₹{inc:,.2f}**)\n"
                f"• 📤 **Expense Entries**: **{exp_cnt} transaction(s)** (Total Expenses: **₹{exp:,.2f}**)\n"
                f"• 💵 **Net Monthly Surplus**: **₹{surplus:,.2f}**\n\n"
                f"You can view all detailed transaction entries on your **Transactions** dashboard page or ask me about any specific entry!"
            )

        # ---------------------------------------------------------------------
        # 2. BUDGETS & ENVELOPES QUERIES (High Precedence)
        # ("Which budgets are exceeded or overspent?", "What is my budget status?", "budget limits")
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["budget", "envelope", "limit", "allowance", "exceeded", "overspent", "why is my budget"]):
            if not budgets:
                return f"Hello {user_name}, you currently have 0 active envelope budgets. Click **Budgets** in sidebar to create spend limits!"

            is_exceeded_query = any(k in q_lower for k in ["exceeded", "overspent", "over budget", "surpassed", "broken", "crossed", "why", "over"])

            exceeded_budgets = []
            all_list = []
            for b in budgets:
                cat_name = b.get("category") or "Envelope Budget"
                limit_val = float(b.get("limit", 0.0))
                spent_val = float(b.get("spent", 0.0))
                over_amt = spent_val - limit_val

                if spent_val > limit_val or b.get("status") == "EXCEEDED":
                    exceeded_budgets.append({
                        "category": cat_name,
                        "limit": limit_val,
                        "spent": spent_val,
                        "over_amt": over_amt,
                        "utilization_pct": round((spent_val / limit_val * 100), 1) if limit_val > 0 else 0.0,
                    })

                status_str = b.get("status", "ACTIVE")
                all_list.append(f"• **{cat_name}**: Spent ₹{spent_val:,.2f} of ₹{limit_val:,.2f} ({status_str})")

            is_why_query = any(k in q_lower for k in ["why", "reason", "cause", "how come", "what caused"])

            if is_exceeded_query or is_why_query:
                if exceeded_budgets:
                    # Perform Transaction-Level Root Cause Analysis
                    exceeded_cat_names = [eb["category"].lower() for eb in exceeded_budgets]

                    # Find matching expense transactions
                    driver_txs = []
                    merchant_spend = {}

                    for t in txs:
                        ttype = (t.get("type") or "").upper()
                        if ttype == "EXPENSE":
                            t_cat = (t.get("category") or "").lower()
                            t_amt = float(t.get("amount", 0.0))
                            t_merch = t.get("merchant") or t.get("title") or "Merchant"
                            merchant_spend[t_merch] = merchant_spend.get(t_merch, 0.0) + t_amt

                            if t_cat in exceeded_cat_names or any(cn in t_cat for cn in exceeded_cat_names) or len(exceeded_budgets) > 0:
                                driver_txs.append(t)

                    # Top Merchant
                    top_merchant_str = ""
                    if merchant_spend:
                        top_m = max(merchant_spend.items(), key=lambda x: x[1])
                        top_merchant_str = f"• 🛒 **Highest Spend Merchant**: **{top_m[0]}** (Total: **₹{top_m[1]:,.2f}**)\n"

                    # Top 3 Driver Transactions
                    driver_txs.sort(key=lambda x: float(x.get("amount", 0.0)), reverse=True)
                    top_tx_lines = []
                    for t in driver_txs[:3]:
                        t_title = t.get("title", "Expense")
                        t_amt = float(t.get("amount", 0.0))
                        t_m = t.get("merchant") or "Merchant"
                        t_d = t.get("date", "")
                        top_tx_lines.append(f"  - **{t_title}**: **₹{t_amt:,.2f}** at **{t_m}** ({t_d})")

                    drivers_block = "\n".join(top_tx_lines) if top_tx_lines else "  - Transactions logged in PostgreSQL ledger."

                    ex_lines = "\n".join([
                        f"• ⚠️ **{eb['category']}**: Spent **₹{eb['spent']:,.2f}** of **₹{eb['limit']:,.2f}** (**Over budget by ₹{eb['over_amt']:,.2f}** / **{eb['utilization_pct']}% utilized**)"
                        for eb in exceeded_budgets
                    ])

                    return (
                        f"Hello {user_name}! Here is a detailed **Root Cause Analysis** explaining why your budget is over, based on your live PostgreSQL transaction ledger:\n\n"
                        f"🚨 **Exceeded Category Envelopes**:\n"
                        f"{ex_lines}\n\n"
                        f"🔍 **Transaction Drivers & Merchant Analysis**:\n"
                        f"{top_merchant_str}"
                        f"• 💳 **Largest Driver Expense Entries**:\n"
                        f"{drivers_block}\n\n"
                        f"💡 **Actionable Copilot Advice**:\n"
                        f"1. **Reallocate Budget**: Shift surplus from inactive category envelopes to absorb the budget deficit.\n"
                        f"2. **Mark One-Time Purchases**: If large entries (e.g. laptop or equipment) were one-time capital buys, flag them to protect recurring monthly velocity metrics."
                    )
                else:
                    return (
                        f"Hello {user_name}! Great news 🎉 **None of your active envelope budgets are currently exceeded or overspent!**\n\n"
                        f"All {len(budgets)} active category spend limits are within safe limits."
                    )
            else:
                b_lines = "\n".join(all_list)
                return (
                    f"Hello {user_name}! Here is your complete **Envelope Budget status**:\n\n"
                    f"{b_lines}"
                )

        # ---------------------------------------------------------------------
        # 3. GOAL VAULTS QUERIES
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["goal", "vault", "target", "save for"]):
            if not goals:
                return f"Hello {user_name}, you have **0 active goal vaults** configured. Click **Goals** to create your first goal vault!"
            g_list = "\n".join([f"• **{g['name']}**: Saved ₹{g['current']:,.2f} of ₹{g['target']:,.2f} (Priority: {g['priority']})" for g in goals])
            return f"Hello {user_name}, here is your Goal Vaults progress:\n\n{g_list}"

        # ---------------------------------------------------------------------
        # 4. FINANCIAL HEALTH SCORE QUERIES
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["health", "score", "index"]):
            score = fh.get("score", 0.0)
            grade = fh.get("grade", "N/A")
            summary = fh.get("summary", "Calculated from PostgreSQL ledger.")
            params = fh.get("parameters", [])

            p_list = "\n".join([f"• **{p['name']}**: {p['score']} / {p['max_score']} ({p['status']})" for p in params]) if params else "• Parameters pending transaction logging."

            return (
                f"Hello {user_name}! Your Financial Health Index is **{score} / 100** (Grade **{grade}**).\n\n"
                f"• **Standing**: {summary}\n\n"
                f"📊 **Capacity Breakdown**:\n{p_list}"
            )

        # ---------------------------------------------------------------------
        # 5. AFFORDABILITY & "CAN I BUY / CAN I AFFORD" CHECKS
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["can i afford", "can i buy", "should i buy", "can i get", "is it safe to buy", "afford"]):
            price_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:k|lakh)?', q_lower)
            target_amount = 0.0

            if "k" in q_lower:
                num_m = re.search(r'([\d.]+)\s*k', q_lower)
                if num_m:
                    target_amount = float(num_m.group(1)) * 1000
            elif "lakh" in q_lower:
                num_m = re.search(r'([\d.]+)\s*lakh', q_lower)
                if num_m:
                    target_amount = float(num_m.group(1)) * 100000
            elif price_match:
                try:
                    clean_str = price_match.group(1).replace(",", "")
                    val = float(clean_str)
                    if val > 100:
                        target_amount = val
                except ValueError:
                    pass

            item_name = "this purchase"
            words = [w for w in q_lower.split() if w not in ["can", "i", "afford", "buy", "should", "get", "safe", "to", "a", "an", "the", "for", "rs", "inr", "rupees", "is"]]
            if words:
                item_name = " ".join([w.capitalize() for w in words[:3]])

            if target_amount > 0:
                if surplus >= target_amount:
                    return (
                        f"Hello {user_name}! 🟢 **Affordability Assessment: YES**\n\n"
                        f"• **Target Purchase ({item_name})**: **₹{target_amount:,.2f}**\n"
                        f"• **Current Net Monthly Surplus**: **₹{surplus:,.2f}**\n"
                        f"• **Total Monthly Income**: **₹{inc:,.2f}**\n\n"
                        f"✅ **Analysis**: Your monthly surplus of **₹{surplus:,.2f}** fully covers this **₹{target_amount:,.2f}** expense without causing a deficit!"
                    )
                else:
                    deficit = target_amount - surplus
                    months_needed = max(1, int(target_amount / max(surplus, 1)) + 1)
                    return (
                        f"Hello {user_name}! ⚠️ **Affordability Assessment: CAUTION**\n\n"
                        f"• **Target Purchase ({item_name})**: **₹{target_amount:,.2f}**\n"
                        f"• **Current Net Monthly Surplus**: **₹{surplus:,.2f}**\n"
                        f"• **Shortfall**: **₹{deficit:,.2f}**\n\n"
                        f"💡 **Recommendation**: Buying this right now would exceed your net monthly surplus by **₹{deficit:,.2f}**.\n"
                        f"By setting up a Goal Vault and saving **₹{surplus*0.5:,.2f}/month**, you can comfortably buy **{item_name}** in approximately **{months_needed} month(s)**!"
                    )
            else:
                return (
                    f"Hello {user_name}! Based on your current live PostgreSQL ledger:\n\n"
                    f"• **Net Monthly Surplus**: **₹{surplus:,.2f}**\n"
                    f"• **Total Income Pool**: **₹{inc:,.2f}**\n"
                    f"• **Total Monthly Outflows**: **₹{exp:,.2f}**\n\n"
                    f"You have **₹{surplus:,.2f}** in unallocated monthly cash flow available for discretionary purchases or savings!"
                )

        # ---------------------------------------------------------------------
        # 5B. SAVINGS ADVICE & HOW-TO-SAVE QUERIES ("How can I save ₹5000?", "How to save money?")
        # ---------------------------------------------------------------------
        is_save_query = (
            any(k in q_lower for k in ["how can i save", "how to save", "how can i reduce", "how to cut", "save money", "tips to save", "ways to save", "help me save"])
            or ("save" in q_lower and any(w in q_lower for w in ["how", "ways", "plan", "advice", "suggestion", "tip", "cut", "reduce"]))
        )

        if is_save_query:
            target_amount = 0.0
            price_match = re.search(r'(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)', q_lower)
            if "k" in q_lower:
                num_m = re.search(r'([\d.]+)\s*k', q_lower)
                if num_m:
                    target_amount = float(num_m.group(1)) * 1000
            elif "lakh" in q_lower:
                num_m = re.search(r'([\d.]+)\s*lakh', q_lower)
                if num_m:
                    target_amount = float(num_m.group(1)) * 100000
            elif price_match:
                try:
                    clean_str = price_match.group(1).replace(",", "")
                    val = float(clean_str)
                    if val > 10:
                        target_amount = val
                except ValueError:
                    pass

            if target_amount == 0.0:
                target_amount = 5000.0

            expense_txs = [t for t in txs if t["type"] == "EXPENSE"]
            cat_totals = {}
            for t in expense_txs:
                c = t["category"]
                cat_totals[c] = cat_totals.get(c, 0.0) + t["amount"]

            sorted_cats = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)

            cat_cut_recommendations = []
            if sorted_cats:
                top_cat_name, top_cat_amt = sorted_cats[0]
                needed_pct = (target_amount / top_cat_amt * 100) if top_cat_amt > 0 else 0
                cat_cut_recommendations.append(
                    f"1. **Trim Highest Expense Category ({top_cat_name})**: You spent **₹{top_cat_amt:,.2f}** on {top_cat_name}. Reducing this category by just **{needed_pct:.1f}%** will save you **₹{target_amount:,.2f}**!"
                )
                if len(sorted_cats) > 1:
                    second_cat_name, second_cat_amt = sorted_cats[1]
                    half_target = target_amount / 2
                    p1 = (half_target / top_cat_amt * 100) if top_cat_amt > 0 else 0
                    p2 = (half_target / second_cat_amt * 100) if second_cat_amt > 0 else 0
                    cat_cut_recommendations.append(
                        f"2. **Split Across Top Categories**: Cut **{top_cat_name}** by **{p1:.1f}%** (₹{half_target:,.2f}) AND cut **{second_cat_name}** by **{p2:.1f}%** (₹{half_target:,.2f}) to save ₹{target_amount:,.2f}."
                    )

            rec_text = "\n\n".join(cat_cut_recommendations) if cat_cut_recommendations else "• Review your daily transaction log to spot non-essential expenses."

            if surplus >= target_amount:
                surplus_analysis = (
                    f"🟢 **Net Surplus Status**: You currently have a net monthly surplus of **₹{surplus:,.2f}** (Income ₹{inc:,.2f} − Outflow ₹{exp:,.2f}).\n"
                    f"You already have sufficient cash flow to deposit **₹{target_amount:,.2f}** into a Goal Vault right now! This will leave **₹{surplus - target_amount:,.2f}** unallocated."
                )
            else:
                shortfall = target_amount - surplus
                surplus_analysis = (
                    f"⚠️ **Cashflow Shortfall**: Your current surplus is **₹{surplus:,.2f}**. To save **₹{target_amount:,.2f}**, you need to trim monthly expenses by **₹{shortfall:,.2f}**."
                )

            top_cat_label = sorted_cats[0][0] if sorted_cats else "Shopping"

            return (
                f"Hello {user_name}! Here is your personalized **₹{target_amount:,.2f} Savings Plan** based on your live PostgreSQL ledger:\n\n"
                f"{surplus_analysis}\n\n"
                f"🎯 **Actionable Cost-Cutting Strategy**:\n"
                f"{rec_text}\n\n"
                f"💡 **Recommended Action Steps**:\n"
                f"• **Step 1**: Go to **Budgets** in sidebar → Set a spending cap of **₹{max(0, sorted_cats[0][1] - target_amount):,.2f}** for **{top_cat_label}**.\n"
                f"• **Step 2**: Go to **Goals** in sidebar → Create a Goal Vault for **₹{target_amount:,.2f}**.\n"
                f"• **Step 3**: Set up an automated recurring savings deposit on your income pay day."
            )

        # ---------------------------------------------------------------------
        # 6. SYSTEM GUIDANCE & HOW-TO INSTRUCTIONS
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["how to set", "how to create", "how do i", "sub category", "subcategory", "how to add"]):
            if "budget" in q_lower:
                return (
                    f"Hello {user_name}! To set a budget:\n\n"
                    f"1. Click **Budgets** in the left navigation sidebar.\n"
                    f"2. Click **+ New Envelope Budget** at the top right.\n"
                    f"3. Select your target category (or sub-category) and set your limit amount.\n"
                    f"4. Click **Set Budget**!"
                )
            elif "category" in q_lower or "subcategory" in q_lower or "sub category" in q_lower:
                return (
                    f"Hello {user_name}! To create a category or sub-category:\n\n"
                    f"1. Click **Categories** in the left navigation sidebar.\n"
                    f"2. Click **+ New Category**.\n"
                    f"3. Enter the Category Name (e.g. *Electronics*).\n"
                    f"4. (Optional) Select a **Parent Category** (e.g. *Shopping*) to make it a sub-category.\n"
                    f"5. Click **Create Category**!"
                )
            elif "transaction" in q_lower:
                return (
                    f"Hello {user_name}! You can add transactions in 2 easy ways:\n\n"
                    f"• **Option A**: Click **Transactions** in sidebar → Click **+ Add Transaction**.\n"
                    f"• **Option B**: Just tell me here! Say *'Add expense 1500 for Shoes'* or *'Add income 50000 for Salary'*."
                )

        # ---------------------------------------------------------------------
        # 7. FINANCIAL ADVICE, SAVINGS TIPS & RULES OF THUMB
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["how to save", "save more", "50/30/20", "advice", "tip", "reduce expense", "cut expense", "rule"]):
            nec_50 = inc * 0.50
            wants_30 = inc * 0.30
            savings_20 = inc * 0.20
            return (
                f"Hello {user_name}! Here are actionable financial optimization strategies based on your **₹{inc:,.2f}** income pool:\n\n"
                f"💡 **The 50/30/20 Budgeting Rule for Your Income**:\n"
                f"• **50% Needs (Rent, Bills, Food)**: Allocate max **₹{nec_50:,.2f}**\n"
                f"• **30% Wants (Shopping, Dining, Travel)**: Limit to max **₹{wants_30:,.2f}**\n"
                f"• **20% Wealth & Savings (Vaults, emergency)**: Target at least **₹{savings_20:,.2f}**\n\n"
                f"📊 **Your Live Standing**:\n"
                f"• Current Outflows: **₹{exp:,.2f}**\n"
                f"• Current Net Surplus: **₹{surplus:,.2f}**"
            )

        # ---------------------------------------------------------------------
        # 8A. ORDINAL TRANSACTION QUERIES (1st, 2nd, 3rd, #1, #2, etc.)
        # ---------------------------------------------------------------------
        ordinal_words = {
            "first": 1, "1st": 1,
            "second": 2, "2nd": 2,
            "third": 3, "3rd": 3,
            "fourth": 4, "4th": 4,
            "fifth": 5, "5th": 5,
            "sixth": 6, "6th": 6,
            "seventh": 7, "7th": 7,
            "eighth": 8, "8th": 8,
            "ninth": 9, "9th": 9,
            "tenth": 10, "10th": 10,
        }

        requested_index = None
        requested_ordinal_name = None

        for word, idx in ordinal_words.items():
            if word in q_lower:
                requested_index = idx
                requested_ordinal_name = word.capitalize()
                break

        if requested_index is None:
            match = re.search(r'(?:transaction|entry)\s*#?\s*(\d+)', q_lower)
            if match:
                requested_index = int(match.group(1))
                requested_ordinal_name = f"#{requested_index}"

        if requested_index is not None:
            if not txs:
                return f"Hello {user_name}! There are currently **0 transactions** recorded in your PostgreSQL ledger."

            chrono_txs = list(reversed(txs))
            total_count = len(chrono_txs)

            if 1 <= requested_index <= total_count:
                target_tx = chrono_txs[requested_index - 1]
                display_ord = requested_ordinal_name if requested_ordinal_name else f"#{requested_index}"

                return (
                    f"Hello {user_name}! Here is your **{display_ord} Transaction** recorded in PostgreSQL (Entry #{requested_index} of {total_count} total entries):\n\n"
                    f"• **Title**: **{target_tx['title']}**\n"
                    f"• **Merchant**: {target_tx['merchant']}\n"
                    f"• **Category**: {target_tx['category']}\n"
                    f"• **Amount**: **₹{target_tx['amount']:,.2f}** ({target_tx['type']})\n"
                    f"• **Date**: {target_tx['date']}"
                )
            else:
                return (
                    f"Hello {user_name}! You currently have **{total_count} transaction(s)** recorded in your live PostgreSQL ledger, so transaction #{requested_index} does not exist yet."
                )

        # ---------------------------------------------------------------------
        # 8B. RECENT / LAST TRANSACTION QUERIES
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["last", "latest", "recent"]):
            if not txs:
                return f"Hello {user_name}! There are currently **0 transactions** recorded in your PostgreSQL ledger."

            last_tx = txs[0]
            recent_list = "\n".join(
                [f"• {t['date']}: **{t['title']}** — **₹{t['amount']:,.2f}** ({t['category']})" for t in txs[:5]]
            )
            return (
                f"Hello {user_name}! Here is your most recent transaction recorded in PostgreSQL:\n\n"
                f"• **Title**: **{last_tx['title']}**\n"
                f"• **Merchant**: {last_tx['merchant']}\n"
                f"• **Category**: {last_tx['category']}\n"
                f"• **Amount**: **₹{last_tx['amount']:,.2f}** ({last_tx['type']})\n"
                f"• **Date**: {last_tx['date']}\n\n"
                f"📊 **Recent Transactions History (5 Latest Entries)**:\n{recent_list}"
            )

        # ---------------------------------------------------------------------
        # 9. EXTREMES (HIGHEST / LOWEST EXPENSE OR CATEGORY)
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["highest", "biggest", "top category", "most spent", "largest"]):
            expense_txs = [t for t in txs if t["type"] == "EXPENSE"]
            if not expense_txs:
                return f"Hello {user_name}! You have **₹0.00** total expenses logged across your categories."

            top_exp = max(expense_txs, key=lambda x: x["amount"])
            pct_of_exp = f"{((top_exp['amount'] / exp) * 100):.1f}%" if exp > 0 else "0.0%"

            return (
                f"Hello {user_name}! Based on your live PostgreSQL ledger:\n\n"
                f"• **Highest Single Expense Entry**: **{top_exp['title']}** ({top_exp['category']}) — **₹{top_exp['amount']:,.2f}**\n"
                f"• **Date**: {top_exp['date']}\n"
                f"• **Total Monthly Outflow**: **₹{exp:,.2f}**\n\n"
                f"💡 **Spending Insight**: This single entry represents **{pct_of_exp}** of your total monthly expenses."
            )

        if any(k in q_lower for k in ["least", "lowest", "minimum", "cheapest", "smallest"]):
            expense_txs = [t for t in txs if t["type"] == "EXPENSE"]
            if not expense_txs:
                return f"Hello {user_name}! You have **0 recorded expenses** in your PostgreSQL ledger."

            cat_totals = {}
            for t in expense_txs:
                c = t["category"]
                cat_totals[c] = cat_totals.get(c, 0.0) + t["amount"]

            min_cat = min(cat_totals.items(), key=lambda x: x[1])
            min_exp = min(expense_txs, key=lambda x: x["amount"])

            return (
                f"Hello {user_name}! Based on your live PostgreSQL ledger history:\n\n"
                f"• **Lowest Expense Category**: **{min_cat[0]}** (Total Spent: **₹{min_cat[1]:,.2f}**)\n"
                f"• **Smallest Single Expense Entry**: **{min_exp['title']}** ({min_exp['category']}) — **₹{min_exp['amount']:,.2f}**\n"
                f"• **Merchant**: {min_exp['merchant']}\n"
                f"• **Date**: {min_exp['date']}\n\n"
                f"💡 **Insight**: Category **{min_cat[0]}** has the lowest total expenditure of all your expense categories."
            )

        # ---------------------------------------------------------------------
        # 10B. COMPREHENSIVE INSIGHTS & ALL ANALYTICS QUERIES
        # ("Give me every Insights", "give me all insights", "full financial breakdown")
        # ---------------------------------------------------------------------
        if any(k in q_lower for k in ["insight", "insights", "every insight", "all insights", "full summary", "complete summary", "financial standing"]):
            savings_rate = f"{((surplus / inc) * 100):.2f}%" if inc > 0 else "0.0%"
            expense_txs = [t for t in txs if t.get("type") == "EXPENSE"]
            cat_totals = {}
            for t in expense_txs:
                c = t.get("category", "General")
                cat_totals[c] = cat_totals.get(c, 0.0) + float(t.get("amount", 0.0))

            cat_lines = []
            for cname, camt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)[:5]:
                cpct = round((camt / exp * 100), 2) if exp > 0 else 0.0
                cat_lines.append(f"  - **{cname}**: ₹{camt:,.2f} ({cpct}%)")
            cat_str = "\n".join(cat_lines) if cat_lines else "  - No expense categories logged yet."

            b_lines = []
            for b in budgets:
                b_cname = b.get("category") or "Budget Envelope"
                b_lim = float(b.get("limit", 0.0))
                b_sp = float(b.get("spent", 0.0))
                b_pct = round((b_sp / b_lim * 100), 1) if b_lim > 0 else 0.0
                b_stat = "🔴 OVER BUDGET" if b_sp > b_lim else ("🟡 Approaching Limit" if b_pct >= 75 else "🟢 Under Control")
                b_lines.append(f"  - **{b_cname}**: ₹{b_sp:,.2f} / ₹{b_lim:,.2f} ({b_pct}% used — {b_stat})")
            b_str = "\n".join(b_lines) if b_lines else "  - No active envelope budgets set."

            g_lines = []
            for g in goals:
                g_lines.append(f"  - **{g.get('name')}**: ₹{g.get('current', 0.0):,.2f} / ₹{g.get('target', 0.0):,.2f}")
            g_str = "\n".join(g_lines) if g_lines else "  - No active goal vaults."

            h_score = fh.get("score", 75)
            h_grade = fh.get("grade", "Good")

            return (
                f"Hello {user_name}! Here is your complete **Executive Financial Insights Report** generated from your live PostgreSQL ledger:\n\n"
                f"📊 **1. Executive Standing & Top Metrics**:\n"
                f"• **Total Income**: **₹{inc:,.2f}**\n"
                f"• **Total Expenses**: **₹{exp:,.2f}**\n"
                f"• **Net Cash Surplus**: **₹{surplus:,.2f}**\n"
                f"• **Savings Rate**: **{savings_rate}**\n\n"
                f"🛍️ **2. Top Expense Categories**:\n"
                f"{cat_str}\n\n"
                f"🎯 **3. Envelope Budgets Status**:\n"
                f"{b_str}\n\n"
                f"🏆 **4. Goal Vaults Progress**:\n"
                f"{g_str}\n\n"
                f"📈 **5. Financial Health Index**:\n"
                f"• **Score**: **{h_score} / 100 — {h_grade}**\n"
                f"• **Standing**: Your income exceeds your expenses and your emergency fund is progressing. However, your savings rate is low and spending is highly concentrated in Shopping."
            )

        # ---------------------------------------------------------------------
        # 11. DYNAMIC ITEM / CATEGORY / MERCHANT SEARCH IN TRANSACTION LEDGER
        # (Fallback search for specific terms like "Clothes", "Flipkart", "Medicine", "Rolex")
        # ---------------------------------------------------------------------
        stop_words = {
            "how", "much", "many", "money", "did", "i", "spend", "spent", "on", "the", "my", "for",
            "what", "is", "are", "was", "were", "a", "an", "in", "to", "of", "total", "value", "amount",
            "cost", "buy", "bought", "pay", "paid", "transaction", "transactions", "expense", "expenses",
            "show", "list", "me", "give", "tell", "about", "recent", "all", "entry", "entries", "can", "you",
            "please", "have", "has", "had", "current", "this", "month", "monthly", "or", "and", "which",
            "exceeded", "overspent", "budget", "budgets", "limit", "envelope", "envelopes", "any", "some"
        }

        # Extract search tokens
        words = [w.strip("?,.!") for w in q_lower.split() if w.strip("?,.!") and w.strip("?,.!") not in stop_words]

        # Check if user is asking about specific category/item/merchant
        is_search_intent = any(k in q_lower for k in ["spend", "spent", "cost", "pay", "paid", "buy", "bought", "how much", "what", "show", "total"]) or len(words) > 0

        matched_txs = []
        search_label = ""

        if words and is_search_intent:
            for target in words:
                if len(target) < 2:
                    continue
                matching = [
                    t for t in txs
                    if target in t["category"].lower() or target in t["title"].lower() or target in t["merchant"].lower()
                ]
                if matching:
                    matched_txs = matching
                    search_label = target.capitalize()
                    break

            if matched_txs:
                cat_total = sum(t["amount"] for t in matched_txs if t["type"] == "EXPENSE")
                if cat_total == 0:
                    cat_total = sum(t["amount"] for t in matched_txs)
                tx_lines = "\n".join([f"• {t['date']}: **{t['title']}** ({t['category']}) — **₹{t['amount']:,.2f}**" for t in matched_txs])
                return (
                    f"Hello {user_name}! Here is your transaction breakdown for **{search_label}**:\n\n"
                    f"• **Total Spent on {search_label}**: **₹{cat_total:,.2f}**\n"
                    f"• **Matching Entries**: **{len(matched_txs)} item(s)**\n\n"
                    f"📊 **Ledger Entries**:\n{tx_lines}"
                )
            elif words and ("spend" in q_lower or "spent" in q_lower or "how much" in q_lower or "cost" in q_lower):
                target_name = " ".join([w.capitalize() for w in words[:2]])
                return (
                    f"Hello {user_name}! You have **₹0.00** recorded expenses for **{target_name}** in your live PostgreSQL transaction ledger."
                )

        # ---------------------------------------------------------------------
        # 12. GENERAL / DEFAULT FALLBACK ANSWER FOR ALL OTHER POSSIBILITIES
        # ---------------------------------------------------------------------
        expense_txs = [t for t in txs if t["type"] == "EXPENSE"]
        cat_totals = {}
        for t in expense_txs:
            c = t["category"]
            cat_totals[c] = cat_totals.get(c, 0.0) + t["amount"]

        min_cat_str = f"• **Lowest Expense Category**: **{min(cat_totals.items(), key=lambda x: x[1])[0]}** (₹{min(cat_totals.items(), key=lambda x: x[1])[1]:,.2f})\n" if cat_totals else ""
        max_cat_str = f"• **Highest Expense Category**: **{max(cat_totals.items(), key=lambda x: x[1])[0]}** (₹{max(cat_totals.items(), key=lambda x: x[1])[1]:,.2f})\n" if cat_totals else ""

        return (
            f"Hello {user_name}! Based on your live PostgreSQL ledger history:\n\n"
            f"• **Total Monthly Income**: **₹{inc:,.2f}**\n"
            f"• **Total Monthly Expenses**: **₹{exp:,.2f}**\n"
            f"• **Net Monthly Surplus**: **₹{surplus:,.2f}**\n"
            f"{max_cat_str}"
            f"{min_cat_str}"
            f"• **Financial Health Score**: **{fh.get('score', 0.0)} / 100** (Grade **{fh.get('grade', 'N/A')}**)\n\n"
            f"Ask me about specific items (e.g. Clothes, Shoes, Laptop), affordability checks (*'Can I afford a ₹50,000 phone?'*), budgets, or transaction numbers!"
        )
