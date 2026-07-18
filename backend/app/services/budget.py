from sqlalchemy.orm import Session
from typing import List, Any
from datetime import date
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

        # Date validations
        if data.start_date > data.end_date:
            raise BusinessRuleError("Start date must occur on or before end date.")

        try:
            budget = Budget(
                user_id=user_id,
                category_id=data.category_id,
                amount_limit=data.amount_limit,
                period=data.period,
                start_date=data.start_date,
                end_date=data.end_date
            )
            created = self.repo.create(budget)
            self.db.commit()
            logger.info(f"Created budget ID {created.id} for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create budget for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to create budget.")

    def update_budget(self, budget_id: Any, user_id: Any, data: BudgetUpdate) -> Budget:
        """Modify budget threshold details and commit safely."""
        budget = self.get_budget(budget_id, user_id)
        update_dict = data.model_dump(exclude_unset=True)

        if "category_id" in update_dict and update_dict["category_id"]:
            cat = self.category_repo.get(update_dict["category_id"])
            if not cat or (cat.user_id is not None and cat.user_id != user_id):
                raise EntityNotFoundError("Category not found.")

        new_start = update_dict.get("start_date", budget.start_date)
        new_end = update_dict.get("end_date", budget.end_date)
        if new_start > new_end:
            raise BusinessRuleError("Start date must occur on or before end date.")

        try:
            for key, value in update_dict.items():
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
