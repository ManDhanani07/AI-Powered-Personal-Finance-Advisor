from sqlalchemy.orm import Session
from typing import List, Any
from app.repositories.budget import BudgetRepository
from app.repositories.category import CategoryRepository
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.models.budget import Budget
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class BudgetService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BudgetRepository(db)
        self.category_repo = CategoryRepository(db)

    def list_budgets(self, user_id: Any) -> List[Budget]:
        """Fetch all budgets configured by a user."""
        return self.repo.get_by_user(user_id)

    def get_budget(self, budget_id: Any, user_id: Any) -> Budget:
        """Fetch a specific budget, checking user access."""
        budget = self.repo.get(budget_id)
        if not budget or budget.user_id != user_id:
            logger.warning(f"Unauthorized budget query: ID {budget_id} for user ID {user_id}")
            raise EntityNotFoundError("Budget not found.")
        return budget

    def create_budget(self, user_id: Any, data: BudgetCreate) -> Budget:
        """Create a category budget limit and commit safely."""
        # Category validation
        cat = self.category_repo.get(data.category_id)
        if not cat or (cat.user_id is not None and cat.user_id != user_id):
            logger.warning(f"Category query failed for budget creation: ID {data.category_id}")
            raise EntityNotFoundError("Category not found.")

        try:
            budget = Budget(
                user_id=user_id,
                category_id=data.category_id,
                monthly_limit=data.monthly_limit,
                warning_percentage=data.warning_percentage,
                month=data.month,
                year=data.year,
                currency=data.currency
            )
            created = self.repo.create(budget)
            self.db.commit()
            logger.info(f"Created budget ID {created.id} for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create budget for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to create budget. Duplicate entries for a category in a single month are rejected.")

    def update_budget(self, budget_id: Any, user_id: Any, data: BudgetUpdate) -> Budget:
        """Modify budget threshold details and commit safely."""
        budget = self.get_budget(budget_id, user_id)
        update_dict = data.model_dump(exclude_unset=True)

        if "category_id" in update_dict and update_dict["category_id"]:
            cat = self.category_repo.get(update_dict["category_id"])
            if not cat or (cat.user_id is not None and cat.user_id != user_id):
                raise EntityNotFoundError("Category not found.")

        try:
            for key, value in update_dict.items():
                if key == "currency" and value is not None:
                    value = value.strip().upper()
                setattr(budget, key, value)
            updated = self.repo.update(budget)
            self.db.commit()
            logger.info(f"Updated budget ID {budget_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update budget ID {budget_id}: {str(e)}")
            raise BusinessRuleError("Failed to update budget.")

    def delete_budget(self, budget_id: Any, user_id: Any) -> None:
        """Remove a budget policy and commit safely."""
        budget = self.get_budget(budget_id, user_id)
        try:
            self.repo.remove(budget.id)
            self.db.commit()
            logger.info(f"Deleted budget ID {budget_id} for user ID {user_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete budget ID {budget_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete budget.")
