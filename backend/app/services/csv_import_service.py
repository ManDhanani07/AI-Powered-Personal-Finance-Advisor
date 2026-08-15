"""
Production-Quality CSV Transaction Import Service.
Handles flexible column alias detection, resilient date & amount normalization,
intelligent rule-based merchant categorization, duplicate detection against database records,
and atomic batch insertion into PostgreSQL.
"""

import io
import re
import csv
import uuid
from uuid import UUID
import secrets
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone, date
from decimal import Decimal, InvalidOperation
from dateutil import parser as date_parser
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.csv_import import (
    CsvPreviewRow,
    CsvPreviewSummary,
    CsvPreviewResponse,
    CsvImportTransactionItem,
    CsvConfirmImportResponse,
)
from app.exceptions.custom_exceptions import BadRequestException

# ── Column Alias Dictionaries ──────────────────────────────────────────────────

COLUMN_ALIASES = {
    "date": [
        "date", "transaction_date", "transaction date", "tx_date", "txn_date",
        "posting_date", "value_date", "date_time", "datetime", "txn date",
        "txndate", "transactiondate", "trans_date", "booking_date", "trade_date"
    ],
    "merchant": [
        "merchant", "payee", "vendor", "company", "merchant_name", "merchant name",
        "party", "beneficiary", "recipient", "store", "shop", "dealer", "seller"
    ],
    "description": [
        "description", "details", "narration", "remarks", "transaction_description",
        "transaction description", "particulars", "notes", "memo", "info",
        "txn_description", "comment", "narrative", "reference"
    ],
    "amount": [
        "amount", "value", "transaction_amount", "transaction amount", "txn_amount",
        "net_amount", "total", "amt", "amount (inr)", "amount(inr)", "amount in inr",
        "amount_in_inr", "transaction_amt", "grand_total"
    ],
    "debit": [
        "debit", "debit_amount", "debit amount", "dr", "withdrawal",
        "withdrawal_amount", "spend", "debit (inr)", "debit(inr)", "withdrawal (dr)",
        "paid_out", "money_out", "dr_amount"
    ],
    "credit": [
        "credit", "credit_amount", "credit amount", "cr", "deposit",
        "deposit_amount", "deposit (cr)", "credit (inr)", "credit(inr)",
        "paid_in", "money_in", "cr_amount"
    ],
    "transaction_type": [
        "type", "transaction_type", "transaction type", "txn_type", "debit_credit",
        "debit/credit", "dr_cr", "dr/cr", "credit_debit", "entry_type", "cr/dr",
        "direction", "flow", "d/c", "c/d"
    ],
    "category": [
        "category", "expense_category", "expense category", "transaction_category",
        "transaction category", "tag", "category_name", "category name", "budget_category"
    ],
    "payment_method": [
        "payment_method", "payment method", "payment_mode", "payment mode", "mode",
        "channel", "payment_type", "payment type", "txn_mode", "method", "instrument"
    ],
    "account": [
        "account", "account_name", "account name", "bank_account", "bank account",
        "source_account", "source account", "bank", "account_type", "account type",
        "account_no", "wallet"
    ],
    "status": [
        "status", "transaction_status", "transaction status", "state", "txn_status"
    ],
}

from app.services.transaction_service import MERCHANT_CATEGORY_RULES


class CsvImportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self._categories_cache: Optional[List[Category]] = None

    # ── Category Preloading & Resolution ──────────────────────────────────────

    async def _get_all_categories(self) -> List[Category]:
        if self._categories_cache is None:
            query = select(Category).order_by(Category.category_name)
            result = await self.db.execute(query)
            self._categories_cache = list(result.scalars().all())
        return self._categories_cache

    async def resolve_category(
        self,
        raw_category: Optional[str],
        merchant: Optional[str],
        description: Optional[str],
        transaction_type: str,
    ) -> Tuple[Optional[UUID], Optional[str], Optional[str], bool]:
        """
        Resolves category ID, name, and color.
        Returns (category_id, category_name, category_color, needs_review)
        """
        categories = await self._get_all_categories()
        
        # 1. Try explicit CSV category matching
        if raw_category and raw_category.strip():
            clean_raw = raw_category.strip().lower()
            # Exact match
            for cat in categories:
                if cat.category_name.lower() == clean_raw:
                    return cat.id, cat.category_name, cat.color, False
            # Substring match
            for cat in categories:
                if clean_raw in cat.category_name.lower() or cat.category_name.lower() in clean_raw:
                    return cat.id, cat.category_name, cat.color, False

        # 2. Rule-based merchant/description keyword matching
        text_corpus = f"{merchant or ''} {description or ''}".lower().strip()
        if text_corpus:
            for kw, cat_name in MERCHANT_CATEGORY_RULES.items():
                if kw in text_corpus:
                    for cat in categories:
                        if cat.category_name.lower() == cat_name.lower():
                            return cat.id, cat.category_name, cat.color, False

        # 3. Fallback based on transaction type
        if transaction_type == "INCOME":
            for cat in categories:
                if cat.category_name.lower() in ["salary", "business", "freelancing", "income"]:
                    return cat.id, cat.category_name, cat.color, False

        # 4. Fallback to "Other" or "Uncategorized"
        for cat in categories:
            if cat.category_name.lower() in ["other", "uncategorized", "general"]:
                return cat.id, cat.category_name, cat.color, True

        return None, "Uncategorized", "#94A3B8", True

    # ── Header & Column Detection ─────────────────────────────────────────────

    @staticmethod
    def _clean_header(header: str) -> str:
        if not header:
            return ""
        # Strip UTF-8 BOM, spaces, underscores, and convert to lower
        return re.sub(r"[^a-zA-Z0-9]", "_", header.strip().lstrip("\ufeff")).lower().strip("_")

    def detect_column_mapping(self, headers: List[str]) -> Dict[str, Optional[str]]:
        """
        Detects mapped columns from CSV headers using alias dictionaries.
        """
        mapping: Dict[str, Optional[str]] = {
            "date": None,
            "merchant": None,
            "description": None,
            "amount": None,
            "debit": None,
            "credit": None,
            "transaction_type": None,
            "category": None,
            "payment_method": None,
            "account": None,
            "status": None,
        }

        cleaned_headers = [(h, self._clean_header(h), h.lower().strip()) for h in headers]

        for canonical, aliases in COLUMN_ALIASES.items():
            for orig, clean, lower_orig in cleaned_headers:
                if mapping[canonical] is not None:
                    continue

                for alias in aliases:
                    alias_clean = self._clean_header(alias)
                    if clean == alias_clean or lower_orig == alias.lower():
                        mapping[canonical] = orig
                        break

        # Fallback heuristic: If no merchant found, but description found, map description
        if not mapping["merchant"] and mapping["description"]:
            pass  # Will be extracted from description

        return mapping

    # ── Amount Normalization ──────────────────────────────────────────────────

    @staticmethod
    def normalize_amount(raw_val: Any) -> Tuple[Optional[Decimal], Optional[str], Optional[str]]:
        """
        Parses amount from raw string or number.
        Returns (amount_magnitude: Decimal, inferred_type: 'INCOME'|'EXPENSE'|None, error_msg: Optional[str])
        """
        if raw_val is None or str(raw_val).strip() == "":
            return None, None, "Empty amount value"

        val_str = str(raw_val).strip()

        # Check parenthetical negative format e.g. (1,500.00)
        is_parenthetical = False
        if val_str.startswith("(") and val_str.endswith(")"):
            is_parenthetical = True
            val_str = val_str[1:-1].strip()

        # Check explicit negative sign
        is_negative = False
        if is_parenthetical or val_str.startswith("-") or val_str.endswith("-") or "dr" in val_str.lower():
            is_negative = True

        # Remove currency symbols, commas, and alphabetic characters (except digits and period)
        cleaned = re.sub(r"[₹$€£,]", "", val_str)
        cleaned = re.sub(r"(?i)\b(inr|rs|rs\.|dr|cr|usd|eur|gbp)\b", "", cleaned).strip()
        cleaned = cleaned.replace("-", "").replace("+", "").strip()

        try:
            amount_dec = Decimal(cleaned)
            if amount_dec <= Decimal("0.00"):
                return None, None, "Amount must be greater than zero"

            amount_dec = round(amount_dec, 2)
            inferred_type = "EXPENSE" if is_negative else None
            return amount_dec, inferred_type, None
        except (InvalidOperation, ValueError):
            return None, None, f"Invalid numeric amount format: '{raw_val}'"

    # ── Date Normalization ────────────────────────────────────────────────────

    @staticmethod
    def normalize_date(raw_val: Any) -> Tuple[Optional[datetime], Optional[str]]:
        """
        Parses date from raw string.
        Returns (datetime_utc, error_msg: Optional[str])
        """
        if not raw_val or str(raw_val).strip() == "":
            return None, "Missing transaction date"

        val_str = str(raw_val).strip()

        # 1. Try explicit regex-based common formats
        common_formats = [
            "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y",
            "%d/%m/%y", "%d-%m-%y", "%Y/%m/%d",
            "%d %b %Y", "%d-%b-%Y", "%d %B %Y", "%d-%B-%Y",
            "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S",
        ]

        for fmt in common_formats:
            try:
                dt = datetime.strptime(val_str, fmt)
                # Check realistic year range (1990 to 2100)
                if 1990 <= dt.year <= 2100:
                    return dt.replace(tzinfo=timezone.utc), None
            except ValueError:
                continue

        # 2. Dateutil parser with dayfirst heuristic
        try:
            dt = date_parser.parse(val_str, dayfirst=True)
            if 1990 <= dt.year <= 2100:
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt, None
            return None, f"Date year out of valid range (1990-2100): '{val_str}'"
        except Exception:
            return None, f"Unable to parse date format: '{val_str}'"

    # ── Type & Method Normalization ───────────────────────────────────────────

    @staticmethod
    def normalize_transaction_type(
        raw_type: Optional[str],
        debit_val: Optional[Any],
        credit_val: Optional[Any],
        inferred_from_amount: Optional[str],
        merchant_or_desc: Optional[str] = None,
        category_name: Optional[str] = None,
    ) -> str:
        """
        Determines if transaction is INCOME or EXPENSE.
        """
        # Dual column check
        if debit_val and str(debit_val).strip() and not (credit_val and str(credit_val).strip()):
            return "EXPENSE"
        if credit_val and str(credit_val).strip() and not (debit_val and str(debit_val).strip()):
            return "INCOME"

        if raw_type:
            clean = raw_type.strip().upper()
            if clean in ["EXPENSE", "DEBIT", "DR", "WITHDRAWAL", "SPEND", "OUT", "PAID", "DEBITED"]:
                return "EXPENSE"
            if clean in ["INCOME", "CREDIT", "CR", "DEPOSIT", "IN", "RECEIVED", "REFUND", "CREDITED"]:
                return "INCOME"

        if inferred_from_amount:
            return inferred_from_amount

        if category_name and category_name.lower() in ["salary", "freelancing", "business", "income"]:
            return "INCOME"

        if merchant_or_desc:
            corpus = merchant_or_desc.lower()
            if any(k in corpus for k in ["salary", "payroll", "stipend", "bonus", "dividend", "interest credited", "client payment", "cashback", "refund"]):
                return "INCOME"

        # Default fallback
        return "EXPENSE"

    @staticmethod
    def normalize_payment_method(raw_val: Optional[str], default_method: str = "UPI") -> str:
        if not raw_val or not str(raw_val).strip():
            return default_method.upper()

        val = str(raw_val).upper().strip()
        if any(k in val for k in ["UPI", "GPAY", "PHONEPE", "PAYTM", "BHIM"]):
            return "UPI"
        if any(k in val for k in ["CREDIT CARD", "CREDIT_CARD", " CC ", "CARD"]):
            return "CREDIT_CARD"
        if any(k in val for k in ["DEBIT CARD", "DEBIT_CARD", " DC "]):
            return "DEBIT_CARD"
        if any(k in val for k in ["NET BANKING", "NETBANKING", "NEFT", "RTGS", "IMPS"]):
            return "NET_BANKING"
        if any(k in val for k in ["BANK TRANSFER", "BANK_TRANSFER", "TRANSFER", "WIRE", "ACH"]):
            return "BANK_TRANSFER"
        if "CASH" in val:
            return "CASH"

        return default_method.upper()

    @staticmethod
    def normalize_account_type(raw_val: Optional[str], default_account: str = "SAVINGS") -> str:
        if not raw_val or not str(raw_val).strip():
            return default_account.upper()

        val = str(raw_val).upper().strip()
        if any(k in val for k in ["SAVING", "SAVINGS"]):
            return "SAVINGS"
        if any(k in val for k in ["CHECKING", "CURRENT", "SALARY"]):
            return "CHECKING"
        if any(k in val for k in ["CREDIT", "CREDIT CARD"]):
            return "CREDIT"
        if any(k in val for k in ["INVESTMENT", "DEMAT", "TRADING"]):
            return "INVESTMENT"
        if any(k in val for k in ["WALLET", "CASH"]):
            return "WALLET"

        return default_account.upper()

    @staticmethod
    def normalize_status(raw_val: Optional[str]) -> str:
        if not raw_val or not str(raw_val).strip():
            return "COMPLETED"
        val = str(raw_val).upper().strip()
        if any(k in val for k in ["COMPLETED", "SUCCESS", "SUCCESSFUL", "POSTED", "SETTLED", "CLEARED", "PAID"]):
            return "COMPLETED"
        if any(k in val for k in ["PENDING", "PROCESSING", "SUBMITTED"]):
            return "PENDING"
        if any(k in val for k in ["FAILED", "DECLINED", "REJECTED", "BOUNCED"]):
            return "FAILED"
        if any(k in val for k in ["CANCELLED", "CANCELED", "REVERSED", "VOID"]):
            return "CANCELLED"
        return "COMPLETED"

    # ── Duplicate Signature Engine ────────────────────────────────────────────

    @staticmethod
    def _create_signature(user_id: uuid.UUID, txn_date: datetime, amount: Decimal, merchant_or_title: str, txn_type: str) -> str:
        d_str = txn_date.strftime("%Y-%m-%d")
        amt_str = f"{amount:.2f}"
        name_clean = re.sub(r"[^a-zA-Z0-9]", "", (merchant_or_title or "").lower().strip())[:30]
        return f"{user_id}:{d_str}:{amt_str}:{txn_type.upper()}:{name_clean}"

    async def _fetch_user_transaction_signatures(self, user_id: uuid.UUID) -> set:
        """
        Fetches existing non-deleted transaction signatures for duplicate checking.
        """
        query = select(
            Transaction.transaction_date,
            Transaction.amount,
            Transaction.title,
            Transaction.merchant,
            Transaction.transaction_type,
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.is_deleted == False,
            )
        )
        result = await self.db.execute(query)
        signatures = set()
        for row in result.all():
            m_or_t = row.merchant or row.title or ""
            sig = self._create_signature(user_id, row.transaction_date, row.amount, m_or_t, row.transaction_type)
            signatures.add(sig)
        return signatures

    # ── Main Preview Pipeline ─────────────────────────────────────────────────

    async def parse_and_preview_csv(
        self,
        file_bytes: bytes,
        user_id: uuid.UUID,
        column_mapping_overrides: Optional[Dict[str, str]] = None,
        default_account_type: str = "SAVINGS",
        default_payment_method: str = "UPI",
    ) -> CsvPreviewResponse:
        """
        Parses CSV, auto-detects columns, normalizes all rows, checks duplicates against DB,
        and returns structured preview response.
        """
        if not file_bytes:
            raise BadRequestException("The uploaded CSV file is empty.")

        # Decode CSV content handling UTF-8, UTF-8-SIG, and Latin-1
        content_str = None
        for enc in ["utf-8-sig", "utf-8", "latin-1", "iso-8859-1"]:
            try:
                content_str = file_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue

        if content_str is None:
            raise BadRequestException("Unable to decode CSV file. Please ensure it is saved with standard UTF-8 encoding.")

        # Detect CSV dialect (comma, semicolon, tab)
        sample = content_str[:4096]
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        except Exception:
            dialect = csv.excel

        reader = csv.reader(io.StringIO(content_str), dialect=dialect)
        rows_raw = list(reader)

        if not rows_raw:
            raise BadRequestException("CSV file contains no data rows.")

        # Extract headers & data rows
        headers_raw = [h.strip() for h in rows_raw[0] if h is not None]
        data_rows = rows_raw[1:]

        if not data_rows:
            raise BadRequestException("CSV file contains headers but no transaction rows.")

        # Limit max preview rows to 5000 to protect memory
        if len(data_rows) > 5000:
            raise BadRequestException(f"CSV file contains {len(data_rows)} rows. Maximum allowed per import is 5,000 rows.")

        # Auto-detect column mapping
        detected_mapping = self.detect_column_mapping(headers_raw)
        if column_mapping_overrides:
            for k, v in column_mapping_overrides.items():
                if k in detected_mapping:
                    detected_mapping[k] = v

        # Fetch existing DB signatures for duplicate detection
        existing_signatures = await self._fetch_user_transaction_signatures(user_id)
        seen_file_signatures = set()

        preview_rows: List[CsvPreviewRow] = []
        valid_count = 0
        duplicate_count = 0
        review_count = 0
        invalid_count = 0
        total_income = Decimal("0.00")
        total_expense = Decimal("0.00")

        # Map header name to column index
        header_index_map = {h: idx for idx, h in enumerate(headers_raw)}

        def get_val(col_key: str, row: List[str]) -> Optional[str]:
            header_name = detected_mapping.get(col_key)
            if not header_name or header_name not in header_index_map:
                return None
            idx = header_index_map[header_name]
            return row[idx].strip() if idx < len(row) else None

        for idx, row in enumerate(data_rows, start=1):
            if not any(row):
                continue  # skip completely blank lines

            raw_dict = {headers_raw[i]: row[i].strip() for i in range(min(len(headers_raw), len(row)))}
            validation_errors = []
            review_reasons = []

            # 1. Parse Date
            raw_date = get_val("date", row)
            parsed_date, date_err = self.normalize_date(raw_date)
            if date_err:
                validation_errors.append(date_err)

            # 2. Parse Amount & Debit/Credit
            raw_amount = get_val("amount", row)
            raw_debit = get_val("debit", row)
            raw_credit = get_val("credit", row)

            amount_val = None
            inferred_type = None

            if raw_debit or raw_credit:
                if raw_debit and str(raw_debit).strip():
                    amount_val, _, amt_err = self.normalize_amount(raw_debit)
                    inferred_type = "EXPENSE"
                elif raw_credit and str(raw_credit).strip():
                    amount_val, _, amt_err = self.normalize_amount(raw_credit)
                    inferred_type = "INCOME"
                else:
                    amt_err = "No valid debit or credit amount found"
            else:
                amount_val, inferred_type, amt_err = self.normalize_amount(raw_amount)

            if amt_err:
                validation_errors.append(amt_err)

            # 3. Extract Merchant / Description / Title
            raw_merchant = get_val("merchant", row)
            raw_description = get_val("description", row)
            raw_category = get_val("category", row)

            merchant_clean = raw_merchant.strip() if raw_merchant else None
            desc_clean = raw_description.strip() if raw_description else None

            # Fallback title
            title = merchant_clean or desc_clean or "Transaction"
            if not merchant_clean and desc_clean:
                title = desc_clean[:50]
                merchant_clean = desc_clean[:50]

            if not merchant_clean and not desc_clean:
                validation_errors.append("Missing merchant or transaction description")

            # 4. Determine Transaction Type
            raw_type = get_val("transaction_type", row)
            final_type = self.normalize_transaction_type(
                raw_type,
                raw_debit,
                raw_credit,
                inferred_type,
                merchant_or_desc=merchant_clean or desc_clean,
                category_name=raw_category,
            )

            # 5. Category Resolution
            cat_id, cat_name, cat_color, cat_needs_rev = await self.resolve_category(
                raw_category, merchant_clean, desc_clean, final_type
            )
            if cat_needs_rev:
                review_reasons.append("Category could not be matched with high confidence")

            # 6. Account & Payment Method & Status
            raw_account = get_val("account", row)
            raw_method = get_val("payment_method", row)
            raw_status = get_val("status", row)

            account_type = self.normalize_account_type(raw_account, default_account_type)
            payment_method = self.normalize_payment_method(raw_method, default_payment_method)
            status_str = self.normalize_status(raw_status)

            # 7. Check Duplicate
            is_dup = False
            if parsed_date and amount_val:
                sig = self._create_signature(user_id, parsed_date, amount_val, merchant_clean or title, final_type)
                if sig in existing_signatures:
                    is_dup = True
                    review_reasons.append("Matches existing transaction in ledger")
                elif sig in seen_file_signatures:
                    is_dup = True
                    review_reasons.append("Duplicate row within uploaded CSV")
                else:
                    seen_file_signatures.add(sig)

            # Check overall validity
            is_valid = len(validation_errors) == 0
            needs_review = is_dup or len(review_reasons) > 0 or not is_valid

            # Metrics
            if not is_valid:
                invalid_count += 1
            elif is_dup:
                duplicate_count += 1
            elif needs_review:
                review_count += 1
                valid_count += 1
            else:
                valid_count += 1

            if is_valid and amount_val:
                if final_type == "INCOME":
                    total_income += amount_val
                else:
                    total_expense += amount_val

            fmt_amount = f"+₹{amount_val:,.2f}" if final_type == "INCOME" else f"-₹{amount_val:,.2f}" if amount_val else "₹0.00"

            preview_rows.append(
                CsvPreviewRow(
                    row_index=idx,
                    raw_data=raw_dict,
                    date=parsed_date.strftime("%d %b %Y") if parsed_date else raw_date,
                    parsed_date=parsed_date,
                    merchant=merchant_clean,
                    title=title,
                    description=desc_clean,
                    amount=amount_val or Decimal("0.00"),
                    formatted_amount=fmt_amount,
                    transaction_type=final_type,
                    category_id=cat_id,
                    category_name=cat_name,
                    category_color=cat_color,
                    account_type=account_type,
                    payment_method=payment_method,
                    status=status_str,
                    is_valid=is_valid,
                    is_duplicate=is_dup,
                    needs_review=needs_review,
                    validation_errors=validation_errors,
                    review_reasons=review_reasons,
                )
            )

        # Available categories for frontend dropdown
        categories = await self._get_all_categories()
        cat_list = [{"id": str(c.id), "name": c.category_name, "color": c.color} for c in categories]

        mapped_values = set(filter(None, detected_mapping.values()))
        unmapped_headers = [h for h in headers_raw if h not in mapped_values]

        summary = CsvPreviewSummary(
            total_rows=len(preview_rows),
            valid_rows=valid_count,
            review_rows=review_count,
            duplicate_rows=duplicate_count,
            invalid_rows=invalid_count,
            total_income_amount=total_income,
            total_expense_amount=total_expense,
            detected_headers=headers_raw,
            column_mapping=detected_mapping,
            unmapped_headers=unmapped_headers,
        )

        return CsvPreviewResponse(
            summary=summary,
            preview_rows=preview_rows,
            available_categories=cat_list,
        )

    # ── Batch Confirmation & PostgreSQL Insertion ────────────────────────────

    async def execute_batch_import(
        self,
        user_id: uuid.UUID,
        transactions_to_import: List[CsvImportTransactionItem],
        skip_duplicates: bool = True,
        default_account_type: str = "SAVINGS",
        default_payment_method: str = "UPI",
    ) -> CsvConfirmImportResponse:
        """
        Executes atomic batch insertion of confirmed transactions into PostgreSQL.
        """
        if not transactions_to_import:
            raise BadRequestException("No transactions provided for import.")

        # Pre-fetch existing signatures
        existing_signatures = await self._fetch_user_transaction_signatures(user_id) if skip_duplicates else set()
        seen_batch_signatures = set()

        db_entities: List[Transaction] = []
        skipped_count = 0
        total_income = Decimal("0.00")
        total_expense = Decimal("0.00")

        now_str = datetime.utcnow().strftime("%Y%m%d")

        for item in transactions_to_import:
            # Parse Date
            dt, _ = self.normalize_date(item.date)
            if not dt:
                dt = datetime.now(timezone.utc)

            amount = item.amount
            txn_type = (item.transaction_type or "EXPENSE").upper()
            m_or_t = item.merchant or item.title

            if skip_duplicates:
                sig = self._create_signature(user_id, dt, amount, m_or_t, txn_type)
                if sig in existing_signatures or sig in seen_batch_signatures:
                    skipped_count += 1
                    continue
                seen_batch_signatures.add(sig)

            # Generate unique transaction number
            rand_hex = secrets.token_hex(4).upper()
            tx_number = f"TXN-{now_str}-{rand_hex}"

            # Calculate amount totals
            if txn_type == "INCOME":
                total_income += amount
            else:
                total_expense += amount

            tx = Transaction(
                id=uuid.uuid4(),
                transaction_number=tx_number,
                user_id=user_id,
                category_id=item.category_id,
                title=item.title[:255],
                description=item.description,
                merchant=(item.merchant or item.title)[:150] if item.merchant or item.title else None,
                transaction_type=txn_type,
                payment_method=(item.payment_method or default_payment_method).upper(),
                account_type=(item.account_type or default_account_type).upper(),
                amount=amount,
                transaction_date=dt,
                location=None,
                notes=item.notes,
                is_recurring=False,
            )
            db_entities.append(tx)

        if not db_entities:
            return CsvConfirmImportResponse(
                imported_count=0,
                skipped_duplicates=skipped_count,
                total_requested=len(transactions_to_import),
                total_income_imported=Decimal("0.00"),
                total_expense_imported=Decimal("0.00"),
                message="All transactions were skipped as duplicates.",
            )

        # Execute Batch Insert within safe Transaction
        try:
            self.db.add_all(db_entities)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            raise BadRequestException(f"Database error occurred during batch transaction import: {str(e)}")

        return CsvConfirmImportResponse(
            imported_count=len(db_entities),
            skipped_duplicates=skipped_count,
            total_requested=len(transactions_to_import),
            total_income_imported=total_income,
            total_expense_imported=total_expense,
            message=f"{len(db_entities)} transactions imported successfully."
            + (f" ({skipped_count} duplicate transactions skipped.)" if skipped_count > 0 else ""),
        )

    # ── Sample CSV Template Generator ─────────────────────────────────────────

    @staticmethod
    def generate_sample_csv() -> str:
        """
        Generates standard CSV sample file with real-world Indian & international transaction examples.
        """
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Merchant", "Description", "Amount", "Type", "Category", "Payment Method", "Account"])
        writer.writerow(["15/08/2026", "Swiggy", "Dinner order #98234", "450.00", "Expense", "Food & Dining", "UPI", "Savings"])
        writer.writerow(["14/08/2026", "Tech Corp India", "August Monthly Salary", "85000.00", "Income", "Salary", "Bank Transfer", "Savings"])
        writer.writerow(["13/08/2026", "Amazon India", "Electronics & Office Cable", "1499.00", "Expense", "Shopping", "Credit Card", "Checking"])
        writer.writerow(["12/08/2026", "Uber India", "Trip to Bangalore Airport", "780.00", "Expense", "Transportation", "UPI", "Savings"])
        writer.writerow(["10/08/2026", "Netflix", "Monthly Ultra HD Plan", "649.00", "Expense", "Entertainment", "Credit Card", "Checking"])
        writer.writerow(["08/08/2026", "Airtel Broadband", "Fiber 200Mbps Monthly Bill", "999.00", "Expense", "Utilities", "UPI", "Savings"])
        writer.writerow(["05/08/2026", "Freelance Client", "UI/UX Consultation Project", "25000.00", "Income", "Freelancing", "Bank Transfer", "Savings"])
        return output.getvalue()
