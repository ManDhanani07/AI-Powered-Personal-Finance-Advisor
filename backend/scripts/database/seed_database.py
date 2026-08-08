"""
Database Seed Script.
Seeds default financial income, expense, and investment categories into PostgreSQL idempotently.
"""

import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.core.logging import logger
from app.database.session import AsyncSessionLocal
from app.models.category import Category

DEFAULT_CATEGORIES = [
  # Expense Categories
  {
    "category_name": "Food & Dining",
    "category_type": "EXPENSE",
    "icon": "Utensils",
    "color": "#EF4444",
    "description": "Restaurants, groceries, food delivery, cafes, and dining out",
    "is_default": True,
  },
  {
    "category_name": "Transportation",
    "category_type": "EXPENSE",
    "icon": "Car",
    "color": "#F59E0B",
    "description": "Fuel, public transit, cab fares, vehicle maintenance, and parking",
    "is_default": True,
  },
  {
    "category_name": "Shopping",
    "category_type": "EXPENSE",
    "icon": "ShoppingBag",
    "color": "#EC4899",
    "description": "Clothing, electronics, household items, personal care, and retail",
    "is_default": True,
  },
  {
    "category_name": "Healthcare",
    "category_type": "EXPENSE",
    "icon": "HeartPulse",
    "color": "#10B981",
    "description": "Medicines, doctor visits, hospital bills, and health checkups",
    "is_default": True,
  },
  {
    "category_name": "Utilities",
    "category_type": "EXPENSE",
    "icon": "Zap",
    "color": "#6366F1",
    "description": "Electricity, water, gas, broadband, mobile bills, and maintenance",
    "is_default": True,
  },
  {
    "category_name": "Entertainment",
    "category_type": "EXPENSE",
    "icon": "Film",
    "color": "#8B5CF6",
    "description": "Movies, streaming services, gaming, events, and hobbies",
    "is_default": True,
  },
  {
    "category_name": "Travel",
    "category_type": "EXPENSE",
    "icon": "Plane",
    "color": "#06B6D4",
    "description": "Flights, hotels, vacation packages, and trip expenses",
    "is_default": True,
  },
  {
    "category_name": "Education",
    "category_type": "EXPENSE",
    "icon": "GraduationCap",
    "color": "#3B82F6",
    "description": "Tuition fees, online courses, books, and educational software",
    "is_default": True,
  },
  {
    "category_name": "Rent",
    "category_type": "EXPENSE",
    "icon": "Home",
    "color": "#14B8A6",
    "description": "Monthly house or office space rental payments",
    "is_default": True,
  },
  {
    "category_name": "EMI",
    "category_type": "EXPENSE",
    "icon": "CreditCard",
    "color": "#64748B",
    "description": "Home loan, car loan, personal loan, and credit card EMIs",
    "is_default": True,
  },
  {
    "category_name": "Insurance",
    "category_type": "EXPENSE",
    "icon": "ShieldCheck",
    "color": "#0284C7",
    "description": "Health, life, motor, and property insurance premiums",
    "is_default": True,
  },
  {
    "category_name": "Tax",
    "category_type": "EXPENSE",
    "icon": "Receipt",
    "color": "#E11D48",
    "description": "Income tax, GST, property tax, and professional taxes",
    "is_default": True,
  },
  {
    "category_name": "Other",
    "category_type": "EXPENSE",
    "icon": "MoreHorizontal",
    "color": "#94A3B8",
    "description": "Miscellaneous and uncategorized expenses",
    "is_default": True,
  },

  # Income Categories
  {
    "category_name": "Salary",
    "category_type": "INCOME",
    "icon": "Briefcase",
    "color": "#22C55E",
    "description": "Monthly employment salary and wages",
    "is_default": True,
  },
  {
    "category_name": "Freelancing",
    "category_type": "INCOME",
    "icon": "Laptop",
    "color": "#06B6D4",
    "description": "Freelance projects, consulting fees, and gig work income",
    "is_default": True,
  },
  {
    "category_name": "Business",
    "category_type": "INCOME",
    "icon": "Building2",
    "color": "#3B82F6",
    "description": "Business profits, dividends, and commercial revenue",
    "is_default": True,
  },

  # Investment & Savings Categories
  {
    "category_name": "Investment",
    "category_type": "INVESTMENT",
    "icon": "TrendingUp",
    "color": "#84CC16",
    "description": "Mutual funds, stocks, fixed deposits, bonds, and crypto",
    "is_default": True,
  },
  {
    "category_name": "Savings",
    "category_type": "INVESTMENT",
    "icon": "PiggyBank",
    "color": "#10B981",
    "description": "Emergency funds, recurring deposits, and savings goal transfers",
    "is_default": True,
  },
]


async def seed_categories():
    """Idempotently seed default categories into database."""
    logger.info("=== Starting Category Database Seeding ===")
    async with AsyncSessionLocal() as session:
        try:
            added_count = 0
            skipped_count = 0

            for cat_data in DEFAULT_CATEGORIES:
                # Check if category already exists
                query = select(Category).where(
                    Category.category_name == cat_data["category_name"]
                )
                result = await session.execute(query)
                existing = result.scalar_one_or_none()

                if not existing:
                    category = Category(**cat_data)
                    session.add(category)
                    added_count += 1
                else:
                    skipped_count += 1

            await session.commit()
            logger.info(
                f"Seeding finished: {added_count} categories inserted, {skipped_count} skipped (already existed)."
            )
            return True
        except Exception as ex:
            await session.rollback()
            logger.error(f"Error seeding default categories: {ex}")
            return False


async def main():
    success = await seed_categories()
    if success:
        logger.info("=== Database Seeding Completed Successfully ===")
    else:
        logger.error("=== Database Seeding Failed ===")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
