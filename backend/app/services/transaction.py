from sqlalchemy.orm import Session
from typing import List, Optional, Any, Tuple
from datetime import datetime, timezone
from app.repositories.transaction import TransactionRepository
from app.repositories.account import AccountRepository
from app.repositories.category import CategoryRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.models.transaction import Transaction
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class TransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TransactionRepository(db)
        self.account_repo = AccountRepository(db)
        self.category_repo = CategoryRepository(db)

    def list_transactions(
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
        """Fetch transactions based on paginated search filters."""
        return self.repo.get_filtered(
            user_id=user_id,
            skip=skip,
            limit=limit,
            type=type,
            category_id=category_id,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            search=search,
            sort_by=sort_by,
            order=order
        )

    def get_transaction(self, transaction_id: Any, user_id: Any) -> Transaction:
        """Fetch a transaction, validating user access permissions."""
        tx = self.repo.get(transaction_id)
        if not tx or tx.user_id != user_id:
            logger.warning(f"Unauthorized transaction access check: ID {transaction_id} for user ID {user_id}")
            raise EntityNotFoundError("Transaction record not found.")
        return tx

    def create_transaction(self, user_id: Any, data: TransactionCreate) -> Transaction:
        """Create transaction, adjust account balance, and commit unit of work atomically."""
        # Validation checks
        self._validate_relationship_keys(user_id, data.category_id, data.account_id)
        tx_date = data.transaction_date if data.transaction_date else datetime.now(timezone.utc)

        try:
            # 1. Adjust accounts balance
            self._adjust_balances(data.transaction_type, data.amount, data.account_id, revert=False)

            # 2. Add ledger entry
            tx = Transaction(
                user_id=user_id,
                account_id=data.account_id,
                category_id=data.category_id,
                merchant=data.merchant.strip() if data.merchant else None,
                amount=data.amount,
                transaction_type=data.transaction_type,
                payment_method=data.payment_method.strip() if data.payment_method else None,
                transaction_date=tx_date,
                description=data.description.strip() if data.description else None,
                notes=data.notes.strip() if data.notes else None,
                location=data.location.strip() if data.location else None,
                ai_predicted_category=data.ai_predicted_category.strip() if data.ai_predicted_category else None,
                prediction_confidence=data.prediction_confidence,
                is_user_corrected=data.is_user_corrected,
                receipt_image=data.receipt_image.strip() if data.receipt_image else None
            )
            created = self.repo.create(tx)
            self.db.commit()
            logger.info(f"Created transaction ID {created.id} (amount: {created.amount}) for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction creation failed for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to record transaction.")

    def update_transaction(self, transaction_id: Any, user_id: Any, data: TransactionUpdate) -> Transaction:
        """Revert old balance impact, apply new parameters, and commit atomically."""
        tx = self.get_transaction(transaction_id, user_id)
        
        new_account = data.account_id if data.account_id is not None else tx.account_id
        new_category = data.category_id if data.category_id is not None else tx.category_id
        new_type = data.transaction_type if data.transaction_type is not None else tx.transaction_type
        new_amount = data.amount if data.amount is not None else tx.amount

        self._validate_relationship_keys(user_id, new_category, new_account)

        try:
            # 1. Rollback old balance impact
            self._adjust_balances(tx.transaction_type, tx.amount, tx.account_id, revert=True)

            # 2. Apply new balance impact
            self._adjust_balances(new_type, new_amount, new_account, revert=False)

            # 3. Apply updates to the transaction entity
            update_dict = data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                if isinstance(value, str):
                    value = value.strip()
                setattr(tx, key, value)
            
            updated = self.repo.update(tx)
            self.db.commit()
            logger.info(f"Updated transaction ID {transaction_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction update failed for ID {transaction_id}: {str(e)}")
            raise BusinessRuleError("Failed to update transaction.")

    def delete_transaction(self, transaction_id: Any, user_id: Any) -> None:
        """Remove ledger entry, revert balance impact, and commit safely."""
        tx = self.get_transaction(transaction_id, user_id)

        try:
            # 1. Rollback balance changes
            self._adjust_balances(tx.transaction_type, tx.amount, tx.account_id, revert=True)

            # 2. Delete ledger row
            self.repo.remove(tx.id)
            self.db.commit()
            logger.info(f"Deleted transaction ID {transaction_id} for user ID {user_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction deletion failed for ID {transaction_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete transaction.")

    # --- Core Balance Adjustment Handlers ---
    def _adjust_balances(
        self,
        tx_type: str,
        amount: float,
        account_id: Any,
        revert: bool = False
    ) -> None:
        """Deduct or add funds to the single linked account balance based on transaction type."""
        factor = -1 if revert else 1
        acc = self.account_repo.get(account_id)
        if not acc:
            return

        if tx_type == "Income":
            acc.balance += amount * factor
        else:  # Expense, Investment, and Transfer behave as monetary outflows (deductions)
            acc.balance -= amount * factor
        self.db.add(acc)

    def _validate_relationship_keys(
        self,
        user_id: Any,
        category_id: Optional[Any],
        account_id: Any
    ) -> None:
        if category_id:
            cat = self.category_repo.get(category_id)
            if not cat or (cat.user_id is not None and cat.user_id != user_id):
                logger.warning(f"Category constraint validation fail: ID {category_id} for user {user_id}")
                raise EntityNotFoundError("Category not found.")
                
        if account_id:
            acc = self.account_repo.get(account_id)
            if not acc or acc.user_id != user_id:
                logger.warning(f"Account validation fail: ID {account_id} for user {user_id}")
                raise EntityNotFoundError("Account not found.")
