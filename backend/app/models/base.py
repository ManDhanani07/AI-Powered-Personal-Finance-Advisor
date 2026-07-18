# Import the declarative base
from app.database.database import Base

# Import all models to ensure they register on the Base.metadata
from app.models.user import User, RefreshToken
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal, GoalContribution
from app.models.prediction import ExpensePrediction, AICategorizationFeedback
from app.models.recommendation import Recommendation
from app.models.chat_history import ChatHistory

__all__ = [
    "Base",
    "User",
    "RefreshToken",
    "Account",
    "Category",
    "Transaction",
    "Budget",
    "Goal",
    "GoalContribution",
    "ExpensePrediction",
    "AICategorizationFeedback",
    "Recommendation",
    "ChatHistory",
]
