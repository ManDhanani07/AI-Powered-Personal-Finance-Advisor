from sqlalchemy.orm import Session
from typing import List, Any
from app.repositories.account import AccountRepository
from app.schemas.account import AccountCreate, AccountUpdate
from app.models.account import Account
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class AccountService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AccountRepository(db)

    def list_accounts(self, user_id: Any) -> List[Account]:
        """List active user accounts."""
        return self.repo.get_by_user(user_id)

    def get_account(self, account_id: Any, user_id: Any) -> Account:
        """Fetch a specific account owned by the user, raising EntityNotFoundError if missing."""
        account = self.repo.get(account_id)
        if not account or account.user_id != user_id:
            logger.warning(f"Unauthorized account query: ID {account_id} for user ID {user_id}")
            raise EntityNotFoundError("Account not found.")
        return account

    def create_account(self, user_id: Any, data: AccountCreate) -> Account:
        """Create a new financial account and commit the database transaction safely."""
        try:
            account = Account(
                user_id=user_id,
                name=data.name.strip(),
                type=data.type,
                balance=data.balance,
                currency=data.currency
            )
            created = self.repo.create(account)
            self.db.commit()
            logger.info(f"Created account ID {created.id} ({created.name}) for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Account creation failed for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to create account.")

    def update_account(self, account_id: Any, user_id: Any, data: AccountUpdate) -> Account:
        """Update account parameters and commit database transaction safely."""
        account = self.get_account(account_id, user_id)
        try:
            update_dict = data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(account, key, value)
            updated = self.repo.update(account)
            self.db.commit()
            logger.info(f"Updated account ID {account_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Account update failed for ID {account_id}: {str(e)}")
            raise BusinessRuleError("Failed to update account.")

    def delete_account(self, account_id: Any, user_id: Any) -> None:
        """Delete an account and commit, raising error if transaction history blocks removal."""
        account = self.get_account(account_id, user_id)
        try:
            self.repo.remove(account.id)
            self.db.commit()
            logger.info(f"Deleted account ID {account_id} for user ID {user_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Account deletion blocked for ID {account_id}: {str(e)}")
            raise BusinessRuleError("Cannot delete account because it contains transaction history. Deactivate it instead.")
