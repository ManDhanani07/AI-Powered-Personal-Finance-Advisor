"""
Automatic Database Schema Initialization for Support Tickets & Problem Reports.
Ensures `support_tickets` table exists in PostgreSQL and seeds initial demonstration tickets if empty.
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger

INITIAL_TICKETS = [
    {
        "ticket_code": "TCK-104",
        "user_name": "Alex Chen",
        "user_email": "alex.chen@fintech.io",
        "subject": "CSV statement import skipped two transaction dates",
        "description": "When importing my HDFC bank CSV statement from August, two entries on Aug 14 and Aug 15 were omitted from the transaction list. Please advise.",
        "category": "Data Import",
        "priority": "High",
        "status": "In Progress",
        "assigned_admin": "mandhanani536@gmail.com",
        "admin_reply": "We have identified an edge case in date format parsing for midnight timestamps. Our engineering team is currently deploying a patch.",
        "replied_at_delta": 4,  # hours ago
        "created_at_delta": 6,  # hours ago
    },
    {
        "ticket_code": "TCK-103",
        "user_name": "Priya Sharma",
        "user_email": "priya.sharma@example.com",
        "subject": "AI Copilot advice confidence score explanation request",
        "description": "Could you provide more clarity on how the AI Copilot confidence score is weighted between current liquid cashflow and past month spending patterns?",
        "category": "AI Advisor",
        "priority": "Medium",
        "status": "Open",
        "assigned_admin": "Unassigned",
        "admin_reply": None,
        "replied_at_delta": None,
        "created_at_delta": 18,
    },
    {
        "ticket_code": "TCK-102",
        "user_name": "David Kim",
        "user_email": "david.k@example.com",
        "subject": "Password reset token email delay",
        "description": "I requested a password reset token on Thursday morning and received the email 25 minutes later after the token had expired.",
        "category": "Authentication",
        "priority": "Critical",
        "status": "Resolved",
        "assigned_admin": "mandhanani536@gmail.com",
        "admin_reply": "Issue investigated. Our background SMTP worker was encountering connection throttling with Gmail SMTP relay. Rate limits have been scaled and reset emails now arrive in under 5 seconds.",
        "replied_at_delta": 24,
        "created_at_delta": 36,
    },
    {
        "ticket_code": "TCK-101",
        "user_name": "Rachel Zhao",
        "user_email": "rachel.z@enterprise.com",
        "subject": "Budget threshold alert notification formatting",
        "description": "On mobile Safari, the 80% budget limit push alert badge text overflows the notification pill boundary.",
        "category": "UI / UX",
        "priority": "Low",
        "status": "Closed",
        "assigned_admin": "mandhanani536@gmail.com",
        "admin_reply": "Resolved in v4.2 update. Added flexible wrapping and adjusted text truncation for viewport widths below 375px.",
        "replied_at_delta": 72,
        "created_at_delta": 96,
    },
]


async def ensure_support_ticket_schema():
    """Ensure support_tickets table exists and seed initial tickets if empty."""
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async with engine.begin() as conn:
            logger.info("Verifying PostgreSQL support_tickets table schema...")

            # 1. Create support_tickets table
            await conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS support_tickets (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    ticket_code VARCHAR(50) UNIQUE NOT NULL,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    user_name VARCHAR(255) NOT NULL,
                    user_email VARCHAR(255) NOT NULL,
                    subject VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    category VARCHAR(100) DEFAULT 'Platform Issue' NOT NULL,
                    priority VARCHAR(50) DEFAULT 'Medium' NOT NULL,
                    status VARCHAR(50) DEFAULT 'Open' NOT NULL,
                    assigned_admin VARCHAR(255) DEFAULT 'Unassigned' NOT NULL,
                    admin_reply TEXT,
                    replied_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                );
                """
                )
            )
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets (created_at DESC);"))

            # 2. Check existing count
            res = await conn.execute(text("SELECT COUNT(*) FROM support_tickets;"))
            count = res.scalar() or 0

            if count == 0:
                logger.info("Seeding initial support tickets into support_tickets table...")
                now = datetime.now(timezone.utc)

                # Try to pick a real user_id if any users exist
                u_res = await conn.execute(text("SELECT id, first_name, last_name, email FROM users LIMIT 1;"))
                first_user = u_res.first()
                sample_user_id = str(first_user[0]) if first_user else None

                import uuid as uuid_pkg

                for item in INITIAL_TICKETS:
                    created_at = now - timedelta(hours=item["created_at_delta"])
                    replied_at = (now - timedelta(hours=item["replied_at_delta"])) if item["replied_at_delta"] else None

                    await conn.execute(
                        text(
                            """
                        INSERT INTO support_tickets (
                            id, ticket_code, user_id, user_name, user_email, subject, description,
                            category, priority, status, assigned_admin, admin_reply, replied_at, created_at, updated_at
                        ) VALUES (
                            :id, :ticket_code, :user_id, :user_name, :user_email, :subject, :description,
                            :category, :priority, :status, :assigned_admin, :admin_reply, :replied_at, :created_at, :updated_at
                        ) ON CONFLICT (ticket_code) DO NOTHING;
                        """
                        ),
                        {
                            "id": str(uuid_pkg.uuid4()),
                            "ticket_code": item["ticket_code"],
                            "user_id": sample_user_id,
                            "user_name": item["user_name"],
                            "user_email": item["user_email"],
                            "subject": item["subject"],
                            "description": item["description"],
                            "category": item["category"],
                            "priority": item["priority"],
                            "status": item["status"],
                            "assigned_admin": item["assigned_admin"],
                            "admin_reply": item["admin_reply"],
                            "replied_at": replied_at,
                            "created_at": created_at,
                            "updated_at": replied_at or created_at,
                        },
                    )

            logger.info("Support tickets schema and seed verification complete.")
        await engine.dispose()
    except Exception as e:
        logger.error(f"Error ensuring support_tickets schema: {e}")
