"""
Formatting Utilities for Currency (INR), Dates, Numbers, and API Responses.
"""

from typing import Any, Optional, Dict
from datetime import datetime


def format_currency_inr(amount: float) -> str:
    """Format float into Indian Rupee currency format (e.g. ₹1,50,000.00)."""
    try:
        val = float(amount)
        s, *d = f"{val:.2f}".split(".")
        r = ",".join([s[-3:]] + [s[:-3][max(-len(s) + 3 - i * 2 - 2, -len(s) + 3 - i * 2):-len(s) + 3 - i * 2] for i in range((len(s) - 3 + 1) // 2)])
        formatted = r.strip(",") + ("." + d[0] if d else "")
        return f"₹{formatted}"
    except (ValueError, TypeError):
        return "₹0.00"


def format_number(value: float, decimal_places: int = 2) -> str:
    """Format float into standard decimal representation."""
    try:
        return f"{float(value):.{decimal_places}f}"
    except (ValueError, TypeError):
        return "0.00"


def format_datetime(dt: Optional[datetime], fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime into standard string representation."""
    if not dt:
        return ""
    return dt.strftime(fmt)


def format_api_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    success: bool = True,
    meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Helper to format API responses into standardized dictionaries."""
    return {
        "success": success,
        "message": message,
        "data": data,
        "meta": meta,
    }
