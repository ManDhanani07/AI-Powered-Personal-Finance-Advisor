"""
Seed all 387+ categorization rules from MERCHANT_CATEGORY_RULES into merchant_categorization_rules in PostgreSQL.
"""
import asyncio
import logging
from sqlalchemy import text
from app.database.session import AsyncSessionLocal
from app.services.transaction_service import MERCHANT_CATEGORY_RULES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_all_rules():
    async with AsyncSessionLocal() as session:
        # Check current rules
        existing = await session.execute(text("SELECT merchant_pattern FROM merchant_categorization_rules;"))
        existing_patterns = set(r[0].lower() for r in existing.fetchall())
        logger.info(f"Existing rules in DB: {len(existing_patterns)}")

        inserted_count = 0
        for keyword, category in MERCHANT_CATEGORY_RULES.items():
            kw_clean = keyword.strip()
            # If this keyword is already represented either directly or within a piped pattern
            found = False
            for ep in existing_patterns:
                aliases = [a.strip().lower() for a in ep.split("|")]
                if kw_clean.lower() in aliases:
                    found = True
                    break
            
            if not found:
                await session.execute(
                    text("""
                        INSERT INTO merchant_categorization_rules (merchant_pattern, category, match_type, is_active, created_at, updated_at)
                        VALUES (:pat, :cat, 'Pattern', TRUE, NOW(), NOW());
                    """),
                    {"pat": kw_clean, "cat": category}
                )
                existing_patterns.add(kw_clean.lower())
                inserted_count += 1

        await session.commit()
        
        total_res = await session.execute(text("SELECT count(*) FROM merchant_categorization_rules;"))
        total = total_res.scalar() or 0
        logger.info(f"Seeding complete! Added {inserted_count} new rules. Total rules in DB: {total}")

if __name__ == "__main__":
    asyncio.run(seed_all_rules())
