"""
UUID Generation & Validation Helpers.
"""

import uuid
from typing import Optional


def generate_uuid() -> uuid.UUID:
    """Generate a new random UUID v4."""
    return uuid.uuid4()


def is_valid_uuid(val: str) -> bool:
    """Validate whether string is a valid UUID."""
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, AttributeError):
        return False
