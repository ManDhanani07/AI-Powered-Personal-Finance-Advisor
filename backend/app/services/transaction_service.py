"""
Transaction Service providing financial transaction processing, auto-merchant categorization, and net calculations.
"""

import uuid
import secrets
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.transaction import Transaction
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.user_repository import UserRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.budget_repository import BudgetRepository
from app.services.base import BaseService
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException

MERCHANT_CATEGORY_RULES = {
    # Food & Dining
    "mcdonald": "Food & Dining",
    "starbucks": "Food & Dining",
    "domino": "Food & Dining",
    "zomato": "Food & Dining",
    "swiggy": "Food & Dining",
    "kfc": "Food & Dining",
    "burger king": "Food & Dining",
    "subway": "Food & Dining",
    "restaurant": "Food & Dining",
    # Transportation
    "uber": "Transportation",
    "ola": "Transportation",
    "rapido": "Transportation",
    "shell": "Transportation",
    "fuel": "Transportation",
    "petrol": "Transportation",
    "hpcl": "Transportation",
    "bpcl": "Transportation",
    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "zara": "Shopping",
    "shoppers stop": "Shopping",
    "ajio": "Shopping",
    # Healthcare
    "apollo": "Healthcare",
    "medplus": "Healthcare",
    "pharmacy": "Healthcare",
    "hospital": "Healthcare",
    "clinic": "Healthcare",
    "doctor": "Healthcare",
    # Utilities
    "electricity": "Utilities",
    "water bill": "Utilities",
    "gas bill": "Utilities",
    "airtel": "Utilities",
    "jio": "Utilities",
    "bescom": "Utilities",
    # Entertainment
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "prime": "Entertainment",
    "cinema": "Entertainment",
    "pvr": "Entertainment",
    "bookmyshow": "Entertainment",
    # Salary / Income
    "salary": "Salary",
    "tcs": "Salary",
    "payroll": "Salary",
    "stipend": "Salary",
    "bonus": "Salary",
    # Investments / Income
    "interest": "Investments",
    "sbi": "Investments",
    "dividend": "Investments",
    "yield": "Investments",
}


def _attach_calculated_fields(tx: Optional[Transaction]) -> Optional[Transaction]:
    """Helper to dynamically attach net_amount and direction to Transaction instances."""
    if not tx:
        return tx
    ttype = (tx.transaction_type or "").upper()
    if ttype == "INCOME":
        setattr(tx, "direction", "IN")
        setattr(tx, "net_amount", tx.amount)
    elif ttype == "EXPENSE":
        setattr(tx, "direction", "OUT")
        setattr(tx, "net_amount", -tx.amount)
    else:
        setattr(tx, "direction", "NEUTRAL")
        setattr(tx, "net_amount", Decimal("0.00"))
    return tx


class TransactionService(BaseService[TransactionRepository]):
    def __init__(
        self,
        transaction_repository: TransactionRepository,
        user_repository: UserRepository,
        category_repository: CategoryRepository,
        budget_repository: BudgetRepository,
    ):
        super().__init__(transaction_repository)
        self.transaction_repository = transaction_repository
        self.user_repository = user_repository
        self.category_repository = category_repository
        self.budget_repository = budget_repository

    async def _auto_detect_category(self, merchant_name: Optional[str], transaction_type: str) -> Optional[UUID]:
        """Auto-detect category ID based on merchant rules."""
        if not merchant_name:
            uncat = await self.category_repository.get_by_name("Uncategorized")
            return uncat.id if uncat else None

        lower_merchant = merchant_name.lower().strip()
        matched_cat_name = None

        for keyword, cat_name in MERCHANT_CATEGORY_RULES.items():
            if keyword in lower_merchant:
                matched_cat_name = cat_name
                break

        if matched_cat_name:
            found_cat = await self.category_repository.get_by_name(matched_cat_name)
            if found_cat:
                return found_cat.id

        uncat = await self.category_repository.get_by_name("Uncategorized")
        return uncat.id if uncat else None

    async def create_transaction(self, transaction_data: Dict[str, Any]):
        """Create transaction with auto merchant recognition, unique number generation, and budget impact."""
        user_id = transaction_data.get("user_id")
        if not user_id or not await self.user_repository.exists(id=user_id):
            raise NotFoundException("Valid User is required for transaction creation")

        amount = Decimal(str(transaction_data.get("amount", 0.00)))
        if amount <= 0:
            raise BadRequestException("Transaction amount must be greater than zero")

        transaction_type = (transaction_data.get("transaction_type") or "EXPENSE").upper()
        if transaction_type not in ["INCOME", "EXPENSE", "TRANSFER"]:
            raise BadRequestException("Invalid transaction_type. Must be INCOME, EXPENSE, or TRANSFER")

        # Auto-detect category if not explicitly provided
        category_id = transaction_data.get("category_id")
        if not category_id:
            category_id = await self._auto_detect_category(transaction_data.get("merchant"), transaction_type)

        if category_id and not await self.category_repository.exists(id=category_id):
            category_id = None

        # Auto-generate unique transaction number
        now_str = datetime.utcnow().strftime("%Y%m%d")
        rand_hex = secrets.token_hex(4).upper()
        tx_number = f"TXN-{now_str}-{rand_hex}"

        transaction_data["transaction_number"] = tx_number
        transaction_data["category_id"] = category_id
        transaction_data["amount"] = amount
        transaction_data["transaction_type"] = transaction_type
        transaction_data["payment_method"] = (transaction_data.get("payment_method") or "UPI").upper()
        transaction_data["account_type"] = (transaction_data.get("account_type") or "SAVINGS").upper()

        if "transaction_date" not in transaction_data or not transaction_data["transaction_date"]:
            transaction_data["transaction_date"] = datetime.utcnow()

        # Create Transaction in DB
        created_tx = await self.transaction_repository.create(transaction_data)

        # Eager load category details
        full_tx = await self.transaction_repository.get_by_id_with_category(created_tx.id)

        # Safely attempt updating budget spent amount if this is an EXPENSE under a category
        if transaction_type == "EXPENSE" and category_id and full_tx:
            try:
                active_budget = await self.budget_repository.get_user_category_budget(
                    user_id=user_id,
                    category_id=category_id,
                    target_date=full_tx.transaction_date.date(),
                )
                if active_budget:
                    await self.budget_repository.update_spent_amount(active_budget.id, amount)
            except Exception:
                pass

        res = full_tx or created_tx
        return _attach_calculated_fields(res)

    async def update_transaction(self, transaction_id: UUID, user_id: UUID, update_data: Dict[str, Any]):
        """Update existing transaction for user."""
        existing = await self.transaction_repository.get_by_id_with_category(transaction_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Transaction not found or access denied")

        if "amount" in update_data and update_data["amount"] is not None:
            amount = Decimal(str(update_data["amount"]))
            if amount <= 0:
                raise BadRequestException("Amount must be greater than zero")
            update_data["amount"] = amount

        if "transaction_type" in update_data and update_data["transaction_type"]:
            update_data["transaction_type"] = update_data["transaction_type"].upper()

        if "payment_method" in update_data and update_data["payment_method"]:
            update_data["payment_method"] = update_data["payment_method"].upper()

        if "account_type" in update_data and update_data["account_type"]:
            update_data["account_type"] = update_data["account_type"].upper()

        await self.transaction_repository.update(transaction_id, update_data)
        updated = await self.transaction_repository.get_by_id_with_category(transaction_id)
        return _attach_calculated_fields(updated)

    async def duplicate_transaction(self, transaction_id: UUID, user_id: UUID):
        """Duplicate an existing transaction."""
        original = await self.transaction_repository.get_by_id_with_category(transaction_id)
        if not original or original.user_id != user_id:
            raise NotFoundException("Transaction not found or access denied")

        duplicate_payload = {
            "user_id": original.user_id,
            "category_id": original.category_id,
            "title": f"Copy of {original.title}",
            "description": original.description,
            "merchant": original.merchant,
            "transaction_type": original.transaction_type,
            "payment_method": original.payment_method,
            "account_type": original.account_type,
            "amount": original.amount,
            "transaction_date": datetime.utcnow(),
            "location": original.location,
            "notes": original.notes,
            "is_recurring": original.is_recurring,
        }

        return await self.create_transaction(duplicate_payload)

    async def delete_transaction(self, transaction_id: UUID, user_id: UUID, hard: bool = False):
        """Delete transaction (soft delete by default, hard delete if specified)."""
        existing = await self.transaction_repository.get_by_id(transaction_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Transaction not found or access denied")

        if hard:
            await self.transaction_repository.delete(transaction_id, hard=True)
        else:
            await self.transaction_repository.soft_delete(transaction_id)
        return True

    async def restore_transaction(self, transaction_id: UUID, user_id: UUID):
        """Restore soft-deleted transaction for user."""
        existing = await self.transaction_repository.get_by_id(transaction_id)
        if not existing or existing.user_id != user_id:
            raise NotFoundException("Transaction not found or access denied")

        await self.transaction_repository.restore(transaction_id)
        restored = await self.transaction_repository.get_by_id_with_category(transaction_id)
        return _attach_calculated_fields(restored)

    async def get_user_transactions(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category_id: Optional[UUID] = None,
        transaction_type: Optional[str] = None,
        payment_method: Optional[str] = None,
        account_type: Optional[str] = None,
        merchant: Optional[str] = None,
        location: Optional[str] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        is_recurring: Optional[bool] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        quarter: Optional[str] = None,
        include_deleted: bool = False,
        only_deleted: bool = False,
        search: Optional[str] = None,
        sort_by: str = "transaction_date",
        sort_order: str = "desc",
    ):
        """Get paginated transaction list with net amount and direction calculations."""
        paginated = await self.transaction_repository.get_by_user(
            user_id=user_id,
            page=page,
            page_size=page_size,
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            transaction_type=transaction_type,
            payment_method=payment_method,
            account_type=account_type,
            merchant=merchant,
            location=location,
            min_amount=min_amount,
            max_amount=max_amount,
            is_recurring=is_recurring,
            month=month,
            year=year,
            quarter=quarter,
            include_deleted=include_deleted,
            only_deleted=only_deleted,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        for item in paginated.items:
            _attach_calculated_fields(item)

        return paginated

    async def seed_sample_transactions(self, user_id: UUID) -> List[Transaction]:
        """Seed 12 months of realistic financial transactions into PostgreSQL for user."""
        now = datetime.utcnow()
        created_transactions = []

        sample_templates = [
            {"type": "INCOME", "title": "Monthly Salary Credit", "amount": 125000, "merchant": "TCS Enterprise", "method": "BANK", "account": "SAVINGS", "cat": "Salary"},
            {"type": "EXPENSE", "title": "Monthly Apartment Rent", "amount": 35000, "merchant": "Urban Housing", "method": "BANK", "account": "SAVINGS", "cat": "Housing & Rent"},
            {"type": "EXPENSE", "title": "BigBasket Supermarket", "amount": 14200, "merchant": "BigBasket", "method": "CREDIT_CARD", "account": "CREDIT", "cat": "Groceries"},
            {"type": "EXPENSE", "title": "Swiggy Food Order", "amount": 6500, "merchant": "Swiggy", "method": "UPI", "account": "SAVINGS", "cat": "Food & Dining"},
            {"type": "EXPENSE", "title": "Airtel Broadband & Utilities", "amount": 4200, "merchant": "Airtel", "method": "UPI", "account": "SAVINGS", "cat": "Utilities"},
            {"type": "EXPENSE", "title": "Zerodha ELSS Mutual Fund SIP", "amount": 25000, "merchant": "Zerodha", "method": "BANK", "account": "SAVINGS", "cat": "Investments"},
            {"type": "EXPENSE", "title": "Uber Fuel & Commute", "amount": 5800, "merchant": "Uber", "method": "CREDIT_CARD", "account": "CREDIT", "cat": "Transportation"},
            {"type": "EXPENSE", "title": "Netflix & Spotify Subscription", "amount": 1499, "merchant": "Netflix", "method": "CREDIT_CARD", "account": "CREDIT", "cat": "Subscriptions"},
        ]

        # Generate entries across past 6 months
        for month_offset in range(6, -1, -1):
            tx_date_base = now - timedelta(days=month_offset * 30)

            for template in sample_templates:
                category = await self.category_repository.get_by_name_or_create(
                    category_name=template["cat"],
                    category_type=template["type"],
                )

                tx_num = f"TX-{secrets.token_hex(4).upper()}"
                tx = Transaction(
                    transaction_number=tx_num,
                    user_id=user_id,
                    category_id=category.id,
                    title=template["title"],
                    description=f"Auto-generated ledger entry for {template['title']}",
                    merchant=template["merchant"],
                    transaction_type=template["type"],
                    payment_method=template["method"],
                    account_type=template["account"],
                    amount=Decimal(str(template["amount"])),
                    transaction_date=tx_date_base - timedelta(days=secrets.randbelow(20)),
                    location="Mumbai, IN",
                    is_recurring=(template["type"] == "INCOME" or template["cat"] == "Housing & Rent"),
                )
                saved_tx = await self.transaction_repository.create(tx)
                created_transactions.append(saved_tx)

        return created_transactions

    async def get_transaction_summary(self, user_id: UUID) -> Dict[str, Any]:
        """Compute total income, total expense, and net balance summary for a user."""
        summary = await self.transaction_repository.get_summary_by_user(user_id)
        return {
            "total_income": summary.get("total_income", 0.0),
            "total_expense": summary.get("total_expense", summary.get("total_expenses", 0.0)),
            "net_balance": summary.get("net_balance", summary.get("net_savings", 0.0)),
            "total_count": summary.get("total_count", summary.get("transaction_count", 0)),
        }

