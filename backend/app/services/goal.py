from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Any
from app.repositories.goal import GoalRepository
from app.repositories.transaction import TransactionRepository
from app.schemas.goal import GoalCreate, GoalUpdate, GoalContributionCreate
from app.models.goal import Goal, GoalContribution
from app.core.exceptions import EntityNotFoundError, BusinessRuleError
from app.core.logging import logger

class GoalService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = GoalRepository(db)
        self.tx_repo = TransactionRepository(db)

    def list_goals(self, user_id: Any) -> List[Goal]:
        """Fetch all financial goals defined by a user."""
        return self.repo.get_by_user(user_id)

    def get_goal(self, goal_id: Any, user_id: Any) -> Goal:
        """Fetch a specific goal, validating user permissions."""
        goal = self.repo.get(goal_id)
        if not goal or goal.user_id != user_id:
            logger.warning(f"Unauthorized goal query: ID {goal_id} for user ID {user_id}")
            raise EntityNotFoundError("Financial goal not found.")
        return goal

    def create_goal(self, user_id: Any, data: GoalCreate) -> Goal:
        """Create a new savings target goal and commit safely."""
        try:
            goal = Goal(
                user_id=user_id,
                name=data.name.strip(),
                target_amount=data.target_amount,
                target_date=data.target_date,
                status=data.status
            )
            created = self.repo.create(goal)
            self.db.commit()
            logger.info(f"Created goal ID {created.id} ({created.name}) for user ID {user_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create goal for user ID {user_id}: {str(e)}")
            raise BusinessRuleError("Failed to create goal.")

    def update_goal(self, goal_id: Any, user_id: Any, data: GoalUpdate) -> Goal:
        """Update goal parameters and commit safely."""
        goal = self.get_goal(goal_id, user_id)
        try:
            update_dict = data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(goal, key, value)
            updated = self.repo.update(goal)
            self.db.commit()
            logger.info(f"Updated goal ID {goal_id} for user ID {user_id}")
            return updated
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update goal ID {goal_id}: {str(e)}")
            raise BusinessRuleError("Failed to update goal.")

    def delete_goal(self, goal_id: Any, user_id: Any) -> None:
        """Delete a financial goal and commit safely."""
        goal = self.get_goal(goal_id, user_id)
        try:
            self.repo.remove(goal.id)
            self.db.commit()
            logger.info(f"Deleted goal ID {goal_id} for user ID {user_id}")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete goal ID {goal_id}: {str(e)}")
            raise BusinessRuleError("Failed to delete goal.")

    def add_goal_contribution(self, goal_id: Any, user_id: Any, data: GoalContributionCreate) -> GoalContribution:
        """Log a savings contribution and commit safely."""
        goal = self.get_goal(goal_id, user_id)
        
        # Verify transaction pointer if linked
        if data.transaction_id:
            tx = self.tx_repo.get(data.transaction_id)
            if not tx or tx.user_id != user_id:
                raise EntityNotFoundError("Linked transaction not found.")

        try:
            contribution = GoalContribution(
                goal_id=goal.id,
                transaction_id=data.transaction_id,
                amount=data.amount
            )
            created = self.repo.create_contribution(contribution)
            self.db.commit()
            logger.info(f"Created contribution ID {created.id} (amount: {created.amount}) for goal ID {goal_id}")
            return created
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to add goal contribution for goal ID {goal_id}: {str(e)}")
            raise BusinessRuleError("Failed to add goal contribution.")
