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

    # ============================================================
    # FOOD & DINING
    # ============================================================
    "mcdonald": "Food & Dining",
    "mcd": "Food & Dining",
    "starbucks": "Food & Dining",
    "domino": "Food & Dining",
    "dominos": "Food & Dining",
    "zomato": "Food & Dining",
    "swiggy": "Food & Dining",
    "kfc": "Food & Dining",
    "burger king": "Food & Dining",
    "subway": "Food & Dining",
    "pizza hut": "Food & Dining",
    "pizzahut": "Food & Dining",
    "taco bell": "Food & Dining",
    "wendys": "Food & Dining",
    "dunkin": "Food & Dining",
    "barista": "Food & Dining",
    "cafe": "Food & Dining",
    "coffee": "Food & Dining",
    "restaurant": "Food & Dining",
    "dining": "Food & Dining",
    "food court": "Food & Dining",
    "food delivery": "Food & Dining",
    "eatery": "Food & Dining",
    "bakery": "Food & Dining",
    "dhaba": "Food & Dining",
    "hotel restaurant": "Food & Dining",
    "biryani": "Food & Dining",
    "chai": "Food & Dining",
    "tea": "Food & Dining",
    "juice": "Food & Dining",

    # ============================================================
    # GROCERIES
    # ============================================================
    "zepto": "Groceries",
    "blinkit": "Groceries",
    "blink-it": "Groceries",
    "instamart": "Groceries",
    "swiggy instamart": "Groceries",
    "bigbasket": "Groceries",
    "big basket": "Groceries",
    "dmart": "Groceries",
    "d mart": "Groceries",
    "reliance fresh": "Groceries",
    "reliance smart": "Groceries",
    "more supermarket": "Groceries",
    "spencers": "Groceries",
    "spencer's": "Groceries",
    "star bazaar": "Groceries",
    "supermarket": "Groceries",
    "grocery": "Groceries",
    "groceries": "Groceries",
    "vegetables": "Groceries",
    "fruits": "Groceries",
    "milk": "Groceries",
    "dairy": "Groceries",
    "ration": "Groceries",

    # ============================================================
    # SHOPPING
    # ============================================================
    "amazon": "Shopping",
    "amazon india": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "ajio": "Shopping",
    "meesho": "Shopping",
    "nykaa": "Shopping",
    "tata cliq": "Shopping",
    "tatacliq": "Shopping",
    "zara": "Shopping",
    "h&m": "Shopping",
    "hm": "Shopping",
    "uniqlo": "Shopping",
    "nike": "Shopping",
    "adidas": "Shopping",
    "puma": "Shopping",
    "reebok": "Shopping",
    "skechers": "Shopping",
    "decathlon": "Shopping",
    "shoppers stop": "Shopping",
    "lifestyle": "Shopping",
    "pantaloons": "Shopping",
    "westside": "Shopping",
    "reliance trends": "Shopping",
    "max fashion": "Shopping",
    "fashion": "Shopping",
    "clothing": "Shopping",
    "apparel": "Shopping",
    "electronics": "Shopping",
    "croma": "Shopping",
    "reliance digital": "Shopping",
    "vijay sales": "Shopping",
    "retail": "Shopping",

    # ============================================================
    # TRANSPORTATION
    # ============================================================
    "uber": "Transportation",
    "uber india": "Transportation",
    "ola": "Transportation",
    "ola cabs": "Transportation",
    "rapido": "Transportation",
    "namma yatri": "Transportation",
    "auto": "Transportation",
    "cab": "Transportation",
    "taxi": "Transportation",
    "metro": "Transportation",
    "delhi metro": "Transportation",
    "dmrc": "Transportation",
    "mumbai metro": "Transportation",
    "bus": "Transportation",
    "redbus": "Transportation",
    "red bus": "Transportation",
    "irctc": "Transportation",
    "railway": "Transportation",
    "indian railways": "Transportation",
    "train": "Transportation",
    "parking": "Transportation",
    "toll": "Transportation",
    "fastag": "Transportation",

    # Fuel
    "shell": "Transportation",
    "hpcl": "Transportation",
    "bpcl": "Transportation",
    "bharat petroleum": "Transportation",
    "hindustan petroleum": "Transportation",
    "indian oil": "Transportation",
    "iocl": "Transportation",
    "reliance petrol": "Transportation",
    "petrol": "Transportation",
    "diesel": "Transportation",
    "fuel": "Transportation",
    "gas station": "Transportation",

    # ============================================================
    # TRAVEL
    # ============================================================
    "makemytrip": "Travel",
    "make my trip": "Travel",
    "mmt": "Travel",
    "goibibo": "Travel",
    "booking.com": "Travel",
    "booking": "Travel",
    "airbnb": "Travel",
    "agoda": "Travel",
    "expedia": "Travel",
    "cleartrip": "Travel",
    "yatra": "Travel",
    "easemytrip": "Travel",
    "ease my trip": "Travel",
    "ixigo": "Travel",
    "air india": "Travel",
    "indigo": "Travel",
    "vistara": "Travel",
    "spicejet": "Travel",
    "akasa": "Travel",
    "flight": "Travel",
    "airport": "Travel",
    "hotel booking": "Travel",
    "resort": "Travel",
    "vacation": "Travel",
    "trip": "Travel",

    # ============================================================
    # HEALTHCARE
    # ============================================================
    "apollo": "Healthcare",
    "apollo pharmacy": "Healthcare",
    "medplus": "Healthcare",
    "pharmeasy": "Healthcare",
    "pharm easy": "Healthcare",
    "netmeds": "Healthcare",
    "1mg": "Healthcare",
    "tata 1mg": "Healthcare",
    "practo": "Healthcare",
    "hospital": "Healthcare",
    "clinic": "Healthcare",
    "doctor": "Healthcare",
    "medical": "Healthcare",
    "pharmacy": "Healthcare",
    "medicine": "Healthcare",
    "medicines": "Healthcare",
    "diagnostic": "Healthcare",
    "diagnostics": "Healthcare",
    "pathology": "Healthcare",
    "healthcare": "Healthcare",
    "dentist": "Healthcare",
    "dental": "Healthcare",
    "eye hospital": "Healthcare",
    "optical": "Healthcare",
    "laboratory": "Healthcare",

    # ============================================================
    # ENTERTAINMENT
    # ============================================================
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "youtube premium": "Entertainment",
    "youtube music": "Entertainment",
    "prime video": "Entertainment",
    "hotstar": "Entertainment",
    "disney": "Entertainment",
    "disney+": "Entertainment",
    "jio cinema": "Entertainment",
    "jiocinema": "Entertainment",
    "sony liv": "Entertainment",
    "sonyliv": "Entertainment",
    "zee5": "Entertainment",
    "pvr": "Entertainment",
    "inox": "Entertainment",
    "cinema": "Entertainment",
    "movie": "Entertainment",
    "bookmyshow": "Entertainment",
    "gaming": "Entertainment",
    "steam": "Entertainment",
    "playstation": "Entertainment",
    "xbox": "Entertainment",
    "nintendo": "Entertainment",
    "concert": "Entertainment",
    "event": "Entertainment",

    # ============================================================
    # SUBSCRIPTIONS
    # ============================================================
    "amazon prime": "Subscriptions",
    "prime membership": "Subscriptions",
    "netflix subscription": "Subscriptions",
    "spotify subscription": "Subscriptions",
    "apple music": "Subscriptions",
    "apple one": "Subscriptions",
    "icloud": "Subscriptions",
    "google one": "Subscriptions",
    "google storage": "Subscriptions",
    "chatgpt": "Subscriptions",
    "openai": "Subscriptions",
    "claude": "Subscriptions",
    "gemini": "Subscriptions",
    "github copilot": "Subscriptions",
    "adobe": "Subscriptions",
    "canva": "Subscriptions",
    "notion": "Subscriptions",
    "linkedin premium": "Subscriptions",
    "membership": "Subscriptions",
    "subscription": "Subscriptions",
    "monthly subscription": "Subscriptions",
    "annual subscription": "Subscriptions",

    # ============================================================
    # EDUCATION
    # ============================================================
    "udemy": "Education",
    "coursera": "Education",
    "edx": "Education",
    "skillshare": "Education",
    "upgrad": "Education",
    "unacademy": "Education",
    "byjus": "Education",
    "physics wallah": "Education",
    "pw": "Education",
    "college": "Education",
    "university": "Education",
    "school": "Education",
    "tuition": "Education",
    "course": "Education",
    "courses": "Education",
    "certification": "Education",
    "exam fee": "Education",
    "books": "Education",
    "textbook": "Education",
    "stationery": "Education",

    # ============================================================
    # UTILITIES
    # ============================================================
    "airtel": "Utilities",
    "jio": "Utilities",
    "vi": "Utilities",
    "vodafone": "Utilities",
    "bsnl": "Utilities",
    "electricity": "Utilities",
    "electricity bill": "Utilities",
    "water bill": "Utilities",
    "gas bill": "Utilities",
    "internet": "Utilities",
    "broadband": "Utilities",
    "wifi": "Utilities",
    "mobile recharge": "Utilities",
    "recharge": "Utilities",
    "bescom": "Utilities",
    "torrent power": "Utilities",
    "adani electricity": "Utilities",
    "tata power": "Utilities",
    "utility": "Utilities",

    # ============================================================
    # HOUSING & RENT
    # ============================================================
    "housing": "Housing & Rent",
    "house rent": "Rent",
    "monthly rent": "Rent",
    "rent payment": "Rent",
    "landlord": "Rent",
    "rental": "Rent",
    "apartment rent": "Rent",
    "flat rent": "Rent",

    # Housing-related purchases/services
    "furniture": "Housing & Rent",
    "home decor": "Housing & Rent",
    "home depot": "Housing & Rent",
    "ikea": "Housing & Rent",
    "plumber": "Housing & Rent",
    "carpenter": "Housing & Rent",
    "electrician": "Housing & Rent",
    "house maintenance": "Housing & Rent",
    "home maintenance": "Housing & Rent",
    "repair": "Housing & Rent",

    # ============================================================
    # INSURANCE
    # ============================================================
    "lic": "Insurance",
    "life insurance": "Insurance",
    "health insurance": "Insurance",
    "car insurance": "Insurance",
    "vehicle insurance": "Insurance",
    "motor insurance": "Insurance",
    "insurance premium": "Insurance",
    "insurance": "Insurance",
    "policy premium": "Insurance",
    "policybazaar": "Insurance",

    # ============================================================
    # EMI
    # ============================================================
    "emi": "EMI",
    "loan emi": "EMI",
    "home loan": "EMI",
    "car loan": "EMI",
    "personal loan": "EMI",
    "education loan": "EMI",
    "loan repayment": "EMI",
    "loan payment": "EMI",
    "installment": "EMI",
    "installment payment": "EMI",
    "credit card emi": "EMI",

    # ============================================================
    # TAX
    # ============================================================
    "income tax": "Tax",
    "income tax department": "Tax",
    "itr": "Tax",
    "gst": "Tax",
    "tax payment": "Tax",
    "tax": "Tax",
    "tds": "Tax",
    "advance tax": "Tax",
    "professional tax": "Tax",

    # ============================================================
    # SALARY
    # ============================================================
    "salary": "Salary",
    "payroll": "Salary",
    "monthly salary": "Salary",
    "salary credit": "Salary",
    "pay": "Salary",
    "wages": "Salary",
    "bonus": "Salary",
    "annual bonus": "Salary",
    "performance bonus": "Salary",

    # ============================================================
    # FREELANCING
    # ============================================================
    "freelance": "Freelancing",
    "freelancing": "Freelancing",
    "freelance payment": "Freelancing",
    "freelancer": "Freelancing",
    "upwork": "Freelancing",
    "fiverr": "Freelancing",
    "freelancer.com": "Freelancing",
    "toptal": "Freelancing",
    "client payment": "Freelancing",
    "project payment": "Freelancing",
    "contract payment": "Freelancing",

    # ============================================================
    # BUSINESS
    # ============================================================
    "business": "Business",
    "business expense": "Business",
    "business payment": "Business",
    "vendor payment": "Business",
    "supplier": "Business",
    "inventory purchase": "Business",
    "office expense": "Business",
    "office supplies": "Business",
    "business income": "Business",
    "merchant payment": "Business",

    # ============================================================
    # INVESTMENT
    # ============================================================
    "mutual fund": "Investment",
    "mutual funds": "Investment",
    "sip": "Investment",
    "stock": "Investment",
    "stocks": "Investment",
    "share": "Investment",
    "shares": "Investment",
    "zerodha": "Investment",
    "groww": "Investment",
    "upstox": "Investment",
    "angel one": "Investment",
    "angelone": "Investment",
    "icici direct": "Investment",
    "hdfc securities": "Investment",
    "demat": "Investment",
    "brokerage": "Investment",
    "nse": "Investment",
    "bse": "Investment",
    "etf": "Investment",
    "bond": "Investment",
    "bonds": "Investment",
    "dividend": "Investment",
    "capital gain": "Investment",
    "interest income": "Investment",

    # ============================================================
    # CRYPTO STAKING YIELD
    # ============================================================
    "crypto staking": "Crypto Staking Yield",
    "staking": "Crypto Staking Yield",
    "staking reward": "Crypto Staking Yield",
    "staking rewards": "Crypto Staking Yield",
    "crypto reward": "Crypto Staking Yield",
    "crypto yield": "Crypto Staking Yield",
    "ethereum staking": "Crypto Staking Yield",
    "eth staking": "Crypto Staking Yield",
    "solana staking": "Crypto Staking Yield",
    "sol staking": "Crypto Staking Yield",
    "coinbase staking": "Crypto Staking Yield",
    "binance staking": "Crypto Staking Yield",
    "kraken staking": "Crypto Staking Yield",

    # ============================================================
    # SAVINGS
    # ============================================================
    "savings": "Savings",
    "savings transfer": "Savings",
    "savings deposit": "Savings",
    "goal deposit": "Savings",
    "goal vault": "Savings",
    "emergency fund": "Savings",
    "recurring deposit": "Savings",
    "rd": "Savings",
    "fixed deposit": "Savings",
    "fd": "Savings",

    # ============================================================
    # OTHER
    # ============================================================
    "cash withdrawal": "Other",
    "atm withdrawal": "Other",
    "cash deposit": "Other",
    "miscellaneous": "Other",
    "unknown": "Other",
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

    async def delete_all_transactions(self, user_id: UUID) -> int:
        """Permanently delete all transactions and reset budget spent totals for a user."""
        count = await self.transaction_repository.delete_all_for_user(user_id)
        
        # Reset spent amounts on budgets for this user
        try:
            from sqlalchemy import update as sa_update
            from app.models.budget import Budget
            await self.transaction_repository.db.execute(
                sa_update(Budget).where(Budget.user_id == user_id).values(spent_amount=Decimal("0.00"))
            )
            await self.transaction_repository.db.commit()
        except Exception:
            pass

        return count

    async def delete_bulk_transactions(self, user_id: UUID, transaction_ids: List[UUID]) -> int:
        """Permanently delete a specific batch of transactions for a user."""
        if not transaction_ids:
            return 0
        return await self.transaction_repository.delete_bulk_for_user(user_id, transaction_ids)

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

