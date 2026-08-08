"""
Enterprise Loguru Logging Setup with file rotation, stdout streaming, and custom formatting.
"""

import sys
from pathlib import Path
from loguru import logger
from app.core.config import settings

# Create logs directory if it does not exist
log_path = Path(settings.LOG_FILE_PATH)
log_path.parent.mkdir(parents=True, exist_ok=True)

# Remove default handlers
logger.remove()

# Console Logging Format
LOG_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
    "<level>{message}</level>"
)

# 1. Console Log Handler
logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format=LOG_FORMAT,
    colorize=True,
    backtrace=True,
    diagnose=True,
)

# 2. General File Log Handler with Rotation (10 MB per file, keep 30 days)
logger.add(
    str(log_path),
    level=settings.LOG_LEVEL,
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
)

# 3. Dedicated Error Log Handler
logger.add(
    str(log_path.parent / "error.log"),
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} - {message}",
    rotation="5 MB",
    retention="60 days",
    compression="zip",
    backtrace=True,
    diagnose=True,
    enqueue=True,
)

__all__ = ["logger"]
