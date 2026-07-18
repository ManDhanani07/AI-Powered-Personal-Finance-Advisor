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
        """Create transaction, adjust account balances, and commit unit of work atomically."""
        # Validation checks
        self._validate_relationship_keys(user_id, data.category_id, data.src_account_id, data.dest_account_id)
        self._validate_ledger_rules(data.type, data.src_account_id, data.dest_account_id)

        tx_date = data.transaction_date if data.transaction_date else datetime.now(timezone.utc)

        try:
            # 1. Adjust accounts balances
            self._adjust_balances(data.type, data.amount, data.src_account_id, data.dest_account_id, revert=False)

            # 2. Add ledger entry
            tx = Transaction(
                user_id=user_id,
                category_id=data.category_id,
                src_account_id=data.src_account_id,
                dest_account_id=data.dest_account_id,
                amount=data.amount,
                type=data.type,
                status=data.status,
                description=data.description.strip() if data.description else None,
                transaction_date=tx_date,
                notes=data.notes.strip() if data.notes else None
            )
            created = self.repo.create(tx)
            
            # Commit the unit of work atomically
            self.db.commit()
            logger.info(f"Created transaction ID {created.id} (amount: {created.amount}) for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction creation failed for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to record transaction.")

    def update_transaction(self, transaction_id: Any, user_id: Any, data: TransactionUpdate) -> Transaction:
        """Revert old adjustments, apply new balance updates, and commit transaction safely."""
        tx = self.get_transaction(transaction_id, user_id)
        
        new_type = data.type if data.type is not None else tx.type
        new_amount = data.amount if data.amount is not None else tx.amount
        new_src = data.src_account_id if data.src_account_id is not None else tx.src_account_id
        new_dest = data.dest_account_id if data.dest_account_id is not None else tx.dest_account_id
        new_category = data.category_id if data.category_id is not None else tx.category_id

        self._validate_relationship_keys(user_id, new_category, new_src, new_dest)
        self._validate_ledger_rules(new_type, new_src, new_dest)

        try:
            # 1. Rollback old balance impact
            self._adjust_balances(tx.type, tx.amount, tx.src_account_id, tx.dest_account_id, revert=True)

            # 2. Apply new balance impact
            self._adjust_balances(new_type, new_amount, new_src, new_dest, revert=False)

            # 3. Apply updates to the transaction entity
            update_dict = data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(tx, key, value)
            
            updated = self.repo.update(tx)
            
            # Commit unit of work atomically
            self.db.commit()
            logger.info(f"Updated transaction ID {transaction_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction update failed for ID {transaction_id}: {str(e)}")
            raise BusinessRuleError("Failed to update transaction.")

    def delete_transaction(self, transaction_id: Any, user_id: Any) -> None:
        """Remove ledger entry, revert balance impacts, and commit unit of work safely."""
        tx = self.get_transaction(transaction_id, user_id)

        try:
            # 1. Rollback balance changes
            self._adjust_balances(tx.type, tx.amount, tx.src_account_id, tx.dest_account_id, revert=True)

            # 2. Delete ledger row
            self.repo.remove(tx.id)
            
            # Commit unit of work atomically
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
        src_id: Optional[Any],
        dest_id: Optional[Any],
        revert: bool = False
    ) -> None:
        factor = -1 if revert else 1

        if tx_type == "expense" and src_id:
            src = self.account_repo.get(src_id)
            if src:
                src.balance -= amount * factor
                self.db.add(src)
                
        elif tx_type == "income" and dest_id:
            dest = self.account_repo.get(dest_id)
            if dest:
                dest.balance += amount * factor
                self.db.add(dest)
                
        elif tx_type == "transfer":
            if src_id:
                src = self.account_repo.get(src_id)
                if src:
                    src.balance -= amount * factor
                    self.db.add(src)
            if dest_id:
                dest = self.account_repo.get(dest_id)
                if dest:
                    dest.balance += amount * factor
                    self.db.add(dest)

    def _validate_relationship_keys(
        self,
        user_id: Any,
        category_id: Optional[Any],
        src_id: Optional[Any],
        dest_id: Optional[Any]
    ) -> None:
        if category_id:
            cat = self.category_repo.get(category_id)
            if not cat or (cat.user_id is not None and cat.user_id != user_id):
                logger.warning(f"Category constraint validation fail: ID {category_id} for user {user_id}")
                raise EntityNotFoundError("Category not found.")
                
        if src_id:
            src = self.account_repo.get(src_id)
            if not src or src.user_id != user_id:
                logger.warning(f"Source account validation fail: ID {src_id} for user {user_id}")
                raise EntityNotFoundError("Source account not found.")
                
        if dest_id:
            dest = self.account_repo.get(dest_id)
            if not dest or dest.user_id != user_id:
                logger.warning(f"Destination account validation fail: ID {dest_id} for user {user_id}")
                raise EntityNotFoundError("Destination account not found.")

    def _validate_ledger_rules(
        self,
        tx_type: str,
        src_id: Optional[Any],
        dest_id: Optional[Any]
    ) -> None:
        if tx_type == "expense" and (not src_id or dest_id):
            raise BusinessRuleError("Expenses must specify a source account and no destination account.")
        if tx_type == "income" and (src_id or not dest_id):
            raise BusinessRuleError("Incomes must specify a destination account and no source account.")
        if tx_type == "transfer":
            if not src_id or not dest_id:
                raise BusinessRuleError("Transfers require both source and destination accounts.")
            if src_id == dest_id:
                raise BusinessRuleError("Source and destination accounts must be different.")
