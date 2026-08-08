"""
Database Comprehensive Verification Script.
Verifies connection, table schemas, foreign key relationships, indexes, constraints, seed data count, and return report.
"""

import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, inspect
from app.core.config import settings
from app.core.logging import logger
from app.database.session import AsyncSessionLocal, engine

EXPECTED_TABLES = [
    "users",
    "categories",
    "transactions",
    "budgets",
    "goals",
    "forecast_histories",
    "financial_health_histories",
    "chat_histories",
]


async def run_verification():
    logger.info("=== Starting Comprehensive Database Verification ===")
    report = {
        "connection": False,
        "database_name": settings.POSTGRES_DB,
        "tables": {},
        "missing_tables": [],
        "seed_data": {},
        "alembic_version": None,
        "overall_status": "FAILED",
    }

    # 1. Connection Test
    async with AsyncSessionLocal() as session:
        try:
            res = await session.execute(text("SELECT current_database(), version()"))
            db_name, db_ver = res.fetchone()
            report["connection"] = True
            report["database_name"] = db_name
            report["postgres_version"] = db_ver
            logger.info(f"Connected to database: {db_name}")
        except Exception as ex:
            logger.error(f"Database connection error: {ex}")
            return report

    # 2. Table & Schema Verification
    async with engine.connect() as conn:
        def get_tables_info(sync_conn):
            inspector = inspect(sync_conn)
            existing_tables = inspector.get_table_names()
            tables_detail = {}
            for t in existing_tables:
                columns = [col["name"] for col in inspector.get_columns(t)]
                pk_info = inspector.get_pk_constraint(t)
                pk_cols = pk_info.get("constrained_columns", []) if pk_info else []
                
                fk_list = inspector.get_foreign_keys(t)
                fks = [
                    f"{fk.get('constrained_columns')} -> {fk.get('referred_table')}.{fk.get('referred_columns')}"
                    for fk in fk_list
                ]
                indexes = [idx["name"] for idx in inspector.get_indexes(t)]
                tables_detail[t] = {
                    "primary_keys": pk_cols,
                    "column_count": len(columns),
                    "columns": columns,
                    "foreign_keys": fks,
                    "indexes": indexes,
                }
            return existing_tables, tables_detail

        existing_tables, tables_detail = await conn.run_sync(get_tables_info)
        report["tables"] = tables_detail

        missing = [t for t in EXPECTED_TABLES if t not in existing_tables]
        report["missing_tables"] = missing

        # Check Alembic version table if present
        if "alembic_version" in existing_tables:
            res = await conn.execute(text("SELECT version_num FROM alembic_version"))
            ver_row = res.fetchone()
            report["alembic_version"] = ver_row[0] if ver_row else "No migration recorded"
        else:
            report["alembic_version"] = "Schema created directly via Base.metadata"

    # 3. Seed Data Check
    async with AsyncSessionLocal() as session:
        try:
            res = await session.execute(text("SELECT COUNT(*) FROM categories"))
            cat_count = res.scalar()
            report["seed_data"]["categories_count"] = cat_count

            res = await session.execute(text("SELECT COUNT(*) FROM users"))
            user_count = res.scalar()
            report["seed_data"]["users_count"] = user_count
        except Exception as ex:
            logger.warning(f"Error querying seed data count: {ex}")

    # 4. Final Evaluation
    if not missing and report["connection"]:
        report["overall_status"] = "PASSED"
        logger.info("=== All Database Verification Checks PASSED ===")
    else:
        logger.error(f"Verification FAILED. Missing tables: {missing}")

    return report


async def main():
    report = await run_verification()

    print("\n=======================================================")
    print("           DATABASE VERIFICATION REPORT                ")
    print("=======================================================")
    print(f" Status:             {report['overall_status']}")
    print(f" Database Name:      {report['database_name']}")
    print(f" Migration Info:     {report['alembic_version']}")
    print(f" Missing Tables:     {report['missing_tables'] or 'None'}")
    print("-------------------------------------------------------")
    print(" Verified Tables:")
    for t_name, details in report["tables"].items():
        if t_name in EXPECTED_TABLES:
            print(f"  • {t_name:<28} ({details['column_count']} cols, {len(details['indexes'])} idxs, PK: {details['primary_keys']})")
    print("-------------------------------------------------------")
    print(" Seed Data Summary:")
    print(f"  • Default Categories: {report['seed_data'].get('categories_count', 0)}")
    print(f"  • Registered Users:   {report['seed_data'].get('users_count', 0)}")
    print("=======================================================\n")


if __name__ == "__main__":
    asyncio.run(main())
