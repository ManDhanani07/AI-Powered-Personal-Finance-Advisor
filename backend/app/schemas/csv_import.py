"""
Pydantic Schemas for CSV Transaction Import, Preview, and Batch Confirmation.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class CsvColumnMapping(BaseModel):
    date: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[str] = None
    debit: Optional[str] = None
    credit: Optional[str] = None
    transaction_type: Optional[str] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    account: Optional[str] = None
    status: Optional[str] = None


class CsvPreviewRow(BaseModel):
    row_index: int
    raw_data: Dict[str, Any]
    date: Optional[str] = None
    parsed_date: Optional[datetime] = None
    merchant: Optional[str] = None
    title: str
    description: Optional[str] = None
    amount: Decimal
    formatted_amount: str
    transaction_type: str  # INCOME or EXPENSE
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    account_type: str = "SAVINGS"
    payment_method: str = "UPI"
    status: str = "COMPLETED"
    is_valid: bool = True
    is_duplicate: bool = False
    needs_review: bool = False
    validation_errors: List[str] = Field(default_factory=list)
    review_reasons: List[str] = Field(default_factory=list)


class CsvPreviewSummary(BaseModel):
    total_rows: int
    valid_rows: int
    review_rows: int
    duplicate_rows: int
    invalid_rows: int
    total_income_amount: Decimal = Decimal("0.00")
    total_expense_amount: Decimal = Decimal("0.00")
    detected_headers: List[str]
    column_mapping: Dict[str, Optional[str]]
    unmapped_headers: List[str] = Field(default_factory=list)


class CsvPreviewResponse(BaseModel):
    summary: CsvPreviewSummary
    preview_rows: List[CsvPreviewRow]
    available_categories: List[Dict[str, Any]] = Field(default_factory=list)


class CsvImportTransactionItem(BaseModel):
    date: str  # ISO string or parseable date
    title: str
    merchant: Optional[str] = None
    description: Optional[str] = None
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    transaction_type: str  # INCOME or EXPENSE
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    account_type: Optional[str] = "SAVINGS"
    payment_method: Optional[str] = "UPI"
    status: Optional[str] = "COMPLETED"
    notes: Optional[str] = None


class CsvConfirmImportRequest(BaseModel):
    transactions: List[CsvImportTransactionItem]
    skip_duplicates: bool = True
    default_account_type: Optional[str] = "SAVINGS"
    default_payment_method: Optional[str] = "UPI"
    filename: Optional[str] = "transactions.csv"


class CsvConfirmImportResponse(BaseModel):
    imported_count: int
    skipped_duplicates: int
    total_requested: int
    total_income_imported: Decimal
    total_expense_imported: Decimal
    message: str
