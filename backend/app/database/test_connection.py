import sys
from pathlib import Path

# Add project root (backend/) to sys.path
sys.path.append(str(Path(__file__).resolve().parents[2]))

from sqlalchemy import text
from app.database.database import engine

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    print("Database Connected Successfully!")
except Exception as e:
    print(e)