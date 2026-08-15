import json
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form, Response

from app.dependencies.auth import get_current_user
from app.dependencies.service import get_transaction_service, get_csv_import_service
from app.services.transaction_service import TransactionService
from app.services.csv_import_service import CsvImportService
from app.models.user import User
from app.schemas.base import APIResponse, PaginatedResponse
from app.schemas.transaction import (
    TransactionCreateRequest,
    TransactionUpdateRequest,
    TransactionResponse,
    TransactionSummaryResponse,
)
from app.schemas.csv_import import (
    CsvPreviewResponse,
    CsvConfirmImportRequest,
    CsvConfirmImportResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get(
    "",
    response_model=APIResponse[PaginatedResponse[TransactionResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get paginated transactions with flexible filtering & search",
)
async def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = Query(None),
    transaction_type: Optional[str] = Query(None, description="INCOME, EXPENSE, TRANSFER"),
    payment_method: Optional[str] = Query(None),
    account_type: Optional[str] = Query(None),
    merchant: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_amount: Optional[Decimal] = Query(None),
    max_amount: Optional[Decimal] = Query(None),
    is_recurring: Optional[bool] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=1900, le=2100),
    quarter: Optional[str] = Query(None, description="Q1, Q2, Q3, Q4"),
    include_deleted: bool = Query(False),
    only_deleted: bool = Query(False),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None, description="Search across merchant, description, title, category"),
    sort_by: str = Query("transaction_date"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    paginated = await service.get_user_transactions(
        user_id=current_user.id,
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

    # Validate items with TransactionResponse
    item_responses = [TransactionResponse.model_validate(tx) for tx in paginated.items]

    from app.utils.pagination import build_paginated_response
    result_paginated = build_paginated_response(
        items=item_responses,
        total_items=paginated.pagination.total_items,
        page=paginated.pagination.page,
        page_size=paginated.pagination.page_size,
    )

    return APIResponse(
        success=True,
        message="Transactions retrieved successfully",
        data=result_paginated,
    )


@router.get(
    "/summary",
    response_model=APIResponse[TransactionSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get total income, total expense, and net balance summary",
)
async def get_transaction_summary(
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    summary = await service.get_transaction_summary(current_user.id)
    return APIResponse(
        success=True,
        message="Transaction summary calculated successfully",
        data=TransactionSummaryResponse(**summary),
    )


@router.get(
    "/recent",
    response_model=APIResponse[List[TransactionResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get recent transactions",
)
async def get_recent_transactions(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    txs = await service.transaction_repository.get_recent_by_user(current_user.id, limit=limit)
    res_list = [TransactionResponse.model_validate(tx) for tx in txs]
    return APIResponse(
        success=True,
        message="Recent transactions retrieved successfully",
        data=res_list,
    )


@router.get(
    "/{transaction_id}",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get transaction by ID",
)
async def get_transaction_by_id(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    tx = await service.transaction_repository.get_by_id_with_category(transaction_id)
    if not tx or tx.user_id != current_user.id:
        return APIResponse(success=False, message="Transaction not found", data=None)

    return APIResponse(
        success=True,
        message="Transaction retrieved successfully",
        data=TransactionResponse.model_validate(tx),
    )


@router.post(
    "",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create new transaction with auto merchant recognition",
)
async def create_transaction(
    payload: TransactionCreateRequest,
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    data = payload.model_dump()
    data["user_id"] = current_user.id
    created = await service.create_transaction(data)
    return APIResponse(
        success=True,
        message="Transaction created successfully",
        data=TransactionResponse.model_validate(created),
    )


@router.put(
    "/{transaction_id}",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_200_OK,
    summary="Update transaction details",
)
async def update_transaction(
    transaction_id: UUID,
    payload: TransactionUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    update_data = payload.model_dump(exclude_unset=True)
    updated = await service.update_transaction(transaction_id, current_user.id, update_data)
    return APIResponse(
        success=True,
        message="Transaction updated successfully",
        data=TransactionResponse.model_validate(updated),
    )


@router.post(
    "/{transaction_id}/duplicate",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Duplicate an existing transaction",
)
async def duplicate_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    duplicated = await service.duplicate_transaction(transaction_id, current_user.id)
    return APIResponse(
        success=True,
        message="Transaction duplicated successfully",
        data=TransactionResponse.model_validate(duplicated),
    )


@router.post(
    "/{transaction_id}/restore",
    response_model=APIResponse[TransactionResponse],
    status_code=status.HTTP_200_OK,
    summary="Restore soft-deleted transaction",
)
async def restore_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    restored = await service.restore_transaction(transaction_id, current_user.id)
    return APIResponse(
        success=True,
        message="Transaction restored successfully",
        data=TransactionResponse.model_validate(restored),
    )


@router.delete(
    "/{transaction_id}",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete transaction (soft delete by default)",
)
async def delete_transaction(
    transaction_id: UUID,
    hard: bool = Query(False, description="Set True for permanent deletion"),
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    await service.delete_transaction(transaction_id, current_user.id, hard=hard)
    return APIResponse(
        success=True,
        message="Transaction deleted permanently" if hard else "Transaction moved to trash (soft deleted)",
        data={"deleted": True, "hard": hard, "id": str(transaction_id)},
    )


@router.post(
    "/seed",
    response_model=APIResponse[dict],
    status_code=status.HTTP_201_CREATED,
    summary="Seed 12-month sample transaction ledger for current user",
)
async def seed_transactions(
    current_user: User = Depends(get_current_user),
    service: TransactionService = Depends(get_transaction_service),
):
    seeded = await service.seed_sample_transactions(current_user.id)
    return APIResponse(
        success=True,
        message=f"Successfully seeded {len(seeded)} sample ledger transactions into PostgreSQL",
        data={"seeded_count": len(seeded)},
    )


@router.post(
    "/import-csv/preview",
    response_model=APIResponse[CsvPreviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Upload and preview CSV transactions with auto-column mapping and duplicate detection",
)
async def preview_csv_import(
    file: UploadFile = File(..., description="CSV file with transaction records"),
    default_account_type: str = Form("SAVINGS"),
    default_payment_method: str = Form("UPI"),
    column_mapping: Optional[str] = Form(None, description="Optional JSON string of column mapping overrides"),
    current_user: User = Depends(get_current_user),
    csv_service: CsvImportService = Depends(get_csv_import_service),
):
    if not file.filename or not file.filename.lower().endswith((".csv", ".txt")):
        return APIResponse(
            success=False,
            message="Invalid file format. Please upload a standard .csv file.",
            data=None,
        )

    file_bytes = await file.read()
    if not file_bytes:
        return APIResponse(
            success=False,
            message="Uploaded CSV file is empty. Please select a valid file.",
            data=None,
        )

    mapping_overrides = None
    if column_mapping:
        try:
            mapping_overrides = json.loads(column_mapping)
        except Exception:
            pass

    preview = await csv_service.parse_and_preview_csv(
        file_bytes=file_bytes,
        user_id=current_user.id,
        column_mapping_overrides=mapping_overrides,
        default_account_type=default_account_type,
        default_payment_method=default_payment_method,
    )

    return APIResponse(
        success=True,
        message=f"CSV parsed successfully: {preview.summary.valid_rows} valid transactions detected",
        data=preview,
    )


@router.post(
    "/import-csv/confirm",
    response_model=APIResponse[CsvConfirmImportResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Confirm and execute batch import of approved transactions into PostgreSQL",
)
async def confirm_csv_import(
    payload: CsvConfirmImportRequest,
    current_user: User = Depends(get_current_user),
    csv_service: CsvImportService = Depends(get_csv_import_service),
):
    result = await csv_service.execute_batch_import(
        user_id=current_user.id,
        transactions_to_import=payload.transactions,
        skip_duplicates=payload.skip_duplicates,
        default_account_type=payload.default_account_type or "SAVINGS",
        default_payment_method=payload.default_payment_method or "UPI",
    )

    return APIResponse(
        success=True,
        message=result.message,
        data=result,
    )


@router.get(
    "/import-csv/sample",
    status_code=status.HTTP_200_OK,
    summary="Download sample CSV template for transaction imports",
)
async def download_sample_csv():
    sample_csv = CsvImportService.generate_sample_csv()
    return Response(
        content=sample_csv,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="sample_transactions.csv"',
            "Content-Type": "text/csv; charset=utf-8",
        },
    )


