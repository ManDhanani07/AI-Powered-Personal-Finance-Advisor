"""
Forecast Service providing business logic for time-series ML projections and history logs.
Integrates Meta Prophet Engine with TransactionRepository and handles caching & history logging.
"""

import asyncio
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, date

from app.repositories.forecast_repository import ForecastRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.user_repository import UserRepository
from app.services.base import BaseService
from app.services.prophet_engine import ProphetEngine
from app.exceptions.custom_exceptions import BadRequestException, NotFoundException
from app.core.logging import logger


class ForecastService(BaseService[ForecastRepository]):
    def __init__(
        self,
        forecast_repository: ForecastRepository,
        transaction_repository: TransactionRepository,
        user_repository: UserRepository,
    ):
        super().__init__(forecast_repository)
        self.forecast_repository = forecast_repository
        self.tx = transaction_repository
        self.user_repository = user_repository

    async def get_forecast(
        self, user_id: UUID, metric_type: str = "EXPENSE", period_days: int = 90
    ) -> Dict[str, Any]:
        """
        Generate time-series Meta Prophet forecast for specific metric (EXPENSE, INCOME, SAVINGS, BALANCE).
        """
        if not await self.user_repository.exists(id=user_id):
            raise NotFoundException(f"User with ID {user_id} does not exist")

        period_days = min(max(period_days, 30), 365)
        metric_type = metric_type.upper().strip()

        # Fetch user's full transaction history ONCE
        paginated_txs = await self.tx.get_by_user(user_id=user_id, page=1, page_size=1000)
        transactions = paginated_txs.items

        # Run Meta Prophet Engine
        forecast_result = ProphetEngine.fit_and_forecast(
            transactions=transactions,
            metric_type=metric_type,
            period_days=period_days,
        )

        forecast_result["forecast_type"] = metric_type
        forecast_result["period_days"] = period_days

        # Cache forecast run in DB if sufficient data
        if forecast_result["sufficient_data"]:
            try:
                await self.forecast_repository.create({
                    "user_id": user_id,
                    "forecast_type": f"{metric_type}_PROPHET",
                    "forecast_period": f"{period_days}_DAYS",
                    "prediction_json": {
                        "accuracy_metrics": forecast_result["accuracy_metrics"],
                        "point_count": len(forecast_result["forecast_points"]),
                        "generated_at": datetime.utcnow().isoformat(),
                    },
                })
            except Exception as ex:
                logger.warning(f"Could not log forecast run to DB: {ex}")

        return forecast_result

    async def get_monthly_expense_forecast(self, user_id: UUID, period_days: int = 90) -> Dict[str, Any]:
        """Get Meta Prophet forecast for monthly expenses."""
        return await self.get_forecast(user_id, metric_type="EXPENSE", period_days=period_days)

    async def get_monthly_income_forecast(self, user_id: UUID, period_days: int = 90) -> Dict[str, Any]:
        """Get Meta Prophet forecast for monthly income."""
        return await self.get_forecast(user_id, metric_type="INCOME", period_days=period_days)

    async def get_savings_forecast(self, user_id: UUID, period_days: int = 90) -> Dict[str, Any]:
        """Get Meta Prophet forecast for savings."""
        return await self.get_forecast(user_id, metric_type="SAVINGS", period_days=period_days)

    async def get_account_balance_forecast(self, user_id: UUID, period_days: int = 90) -> Dict[str, Any]:
        """Get Meta Prophet forecast for account balance trajectory."""
        return await self.get_forecast(user_id, metric_type="BALANCE", period_days=period_days)

    async def get_forecast_summary(self, user_id: UUID, period_days: int = 90) -> Dict[str, Any]:
        """
        Consolidate all 4 Meta Prophet forecast models (expense, income, savings, balance)
        using a single transaction query.
        """
        if not await self.user_repository.exists(id=user_id):
            raise NotFoundException(f"User with ID {user_id} does not exist")

        period_days = min(max(period_days, 30), 365)

        # Fetch transaction history ONCE to prevent asyncpg session contention
        paginated_txs = await self.tx.get_by_user(user_id=user_id, page=1, page_size=1000)
        transactions = paginated_txs.items

        # Fit models for all 4 metrics
        expense_res = ProphetEngine.fit_and_forecast(transactions, "EXPENSE", period_days)
        income_res = ProphetEngine.fit_and_forecast(transactions, "INCOME", period_days)
        savings_res = ProphetEngine.fit_and_forecast(transactions, "SAVINGS", period_days)
        balance_res = ProphetEngine.fit_and_forecast(transactions, "BALANCE", period_days)

        sufficient_data = expense_res["sufficient_data"]
        message = expense_res["message"]
        accuracy_metrics = expense_res.get("accuracy_metrics")

        # Combine smart warnings from all 4 models
        combined_warnings = []
        for res in [expense_res, income_res, savings_res, balance_res]:
            combined_warnings.extend(res.get("smart_warnings", []))
        unique_warnings = list({w["id"]: w for w in combined_warnings}.values())

        # Build consolidated insights from all 4 independent model results
        if sufficient_data:
            insights = ProphetEngine.build_consolidated_insights(
                expense_res=expense_res,
                income_res=income_res,
                savings_res=savings_res,
                balance_res=balance_res,
                period_days=period_days,
            )
        else:
            insights = {
                "expected_monthly_expense": 0,
                "expected_monthly_income": 0,
                "expected_savings": 0,
                "expected_balance": 0,
                "expense_trend_pct": 0,
                "income_trend_pct": 0,
                "savings_trend_pct": 0,
                "growth_trend_pct": 0,
                "forecast_horizon_days": period_days,
            }

        return {
            "period_days": period_days,
            "sufficient_data": sufficient_data,
            "message": message,
            "accuracy_metrics": accuracy_metrics,
            "expense_forecast": expense_res.get("forecast_points", []),
            "income_forecast": income_res.get("forecast_points", []),
            "savings_forecast": savings_res.get("forecast_points", []),
            "balance_forecast": balance_res.get("forecast_points", []),
            "insights": insights,
            "smart_warnings": unique_warnings,
        }
