"""
Input Validation Helper utilities.
"""

import re


def is_valid_email(email: str) -> bool:
    if not isinstance(email, str):
        return False
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))


def is_valid_pan_card(pan: str) -> bool:
    if not isinstance(pan, str):
        return False
    pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    return bool(re.match(pattern, pan.upper().strip()))
