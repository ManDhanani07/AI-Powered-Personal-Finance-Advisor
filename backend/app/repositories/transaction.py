from typing import List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from datetime import datetime
from app.repositories.base import BaseRepository
from app.models.transaction import Transaction

class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, db: Session):
        super().__init__(Transaction, db)

    def get_filtered(
        self,
        user_id: Any,
        skip: int = 0,
        limit: int = 50,
        type: Optional[str] = None,
        category_id: Optional[Any] = None,
        account_id: Optional[Any] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: str = "transaction_date",
        order: str = "desc"
    ) -> Tuple[List[Transaction], int]:
        """Retrieve paginated, filtered, sorted, and searchable transactions for a user."""
        query = self.db.query(Transaction).filter(Transaction.user_id == user_id)

        # Category and Type Filtering
        if type:
            query = query.filter(Transaction.transaction_type == type)
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
            
        # Account Filter (checks the single account_id column)
        if account_id:
            query = query.filter(Transaction.account_id == account_id)
            
        # Date Boundaries
        if start_date:
            query = query.filter(Transaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(Transaction.transaction_date <= end_date)
            
        # Amount Boundaries
        if min_amount is not None:
            query = query.filter(Transaction.amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Transaction.amount <= max_amount)
            
        # Text/Term Search
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Transaction.description.ilike(search_pattern),
                    Transaction.notes.ilike(search_pattern),
                    Transaction.merchant.ilike(search_pattern)
                )
            )

        # Count total matching rows
        total_count = query.count()

        # Dynamic Sorting
        sort_column = getattr(Transaction, sort_by, None)
        if sort_column is None:
            sort_column = Transaction.transaction_date
            
        if order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Paginate results
        results = query.offset(skip).limit(limit).all()

        return results, total_count
