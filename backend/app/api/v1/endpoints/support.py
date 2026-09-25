"""
Support & Issue Ticketing API Endpoints for Platform Users.
Enables users to report bugs, account/transaction issues, or feedback,
track their ticket resolution status, and view replies from administrators.
"""

from typing import Optional, List, Dict, Any
import uuid
import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, and_, text

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.support_ticket import SupportTicket
from app.core.logging import logger

router = APIRouter(prefix="/support", tags=["User Support & Issue Reporting"])


class CreateTicketRequest(BaseModel):
    subject: str = Field(..., min_length=3, max_length=255, description="Summary of the issue")
    description: str = Field(..., min_length=10, description="Detailed explanation of the issue or feedback")
    category: str = Field(default="Platform Issue", description="Category of the problem")
    priority: str = Field(default="Medium", description="Urgency: Low, Medium, High, Critical")


@router.get("/tickets")
async def get_my_tickets(
    status_filter: Optional[str] = Query("ALL"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all support tickets submitted by the authenticated user."""
    stmt = select(SupportTicket).where(
        or_(SupportTicket.user_id == current_user.id, SupportTicket.user_email == current_user.email)
    )

    if status_filter and status_filter.upper() != "ALL":
        stmt = stmt.where(func.upper(SupportTicket.status) == status_filter.upper())

    stmt = stmt.order_by(desc(SupportTicket.created_at))
    res = await db.execute(stmt)
    tickets = res.scalars().all()

    formatted = []
    for t in tickets:
        formatted.append({
            "id": str(t.id),
            "ticket_code": t.ticket_code,
            "subject": t.subject,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "assigned_admin": t.assigned_admin,
            "admin_reply": t.admin_reply,
            "replied_at": t.replied_at.strftime("%b %d, %Y, %I:%M %p") if t.replied_at else None,
            "created_at": t.created_at.strftime("%b %d, %Y, %I:%M %p") if t.created_at else "Recent",
            "updated_at": t.updated_at.strftime("%b %d, %Y, %I:%M %p") if t.updated_at else "Recent",
        })

    return {"tickets": formatted, "count": len(formatted)}


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def submit_ticket(
    payload: CreateTicketRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new customer care / platform problem report."""
    now = datetime.now(timezone.utc)

    # Generate next readable ticket code
    random_suffix = random.randint(100, 999)
    total_count = (await db.execute(select(func.count(SupportTicket.id)))).scalar() or 0
    ticket_code = f"TCK-{1000 + total_count + 1}-{random_suffix}"

    user_full_name = f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email.split("@")[0]

    ticket = SupportTicket(
        id=uuid.uuid4(),
        ticket_code=ticket_code,
        user_id=current_user.id,
        user_name=user_full_name,
        user_email=current_user.email,
        subject=payload.subject.strip(),
        description=payload.description.strip(),
        category=payload.category,
        priority=payload.priority,
        status="Open",
        assigned_admin="Support Team",
        admin_reply=None,
        replied_at=None,
        created_at=now,
        updated_at=now,
    )

    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    # Safe audit log matching PostgreSQL audit_logs table schema
    try:
        await db.execute(
            text(
                "INSERT INTO audit_logs (id, timestamp, user_email, action, resource, ip_address, status, details) "
                "VALUES (:id, :timestamp, :user_email, :action, :resource, :ip_address, :status, :details)"
            ),
            {
                "id": uuid.uuid4(),
                "timestamp": now,
                "user_email": current_user.email,
                "action": "SUPPORT_TICKET_CREATE",
                "resource": "SUPPORT",
                "ip_address": "127.0.0.1",
                "status": "Success",
                "details": f"Support ticket {ticket_code} submitted: {payload.subject[:80]}",
            },
        )
        await db.commit()
    except Exception as e:
        logger.warning(f"Failed to record audit log for support ticket: {e}")

    return {
        "message": "Problem report submitted successfully. Our engineering and support team will triage it shortly.",
        "ticket": {
            "id": str(ticket.id),
            "ticket_code": ticket.ticket_code,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "created_at": ticket.created_at.strftime("%b %d, %Y, %I:%M %p"),
        },
    }


@router.get("/tickets/{ticket_id}")
async def get_ticket_detail(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    id_cond = SupportTicket.ticket_code == ticket_id
    try:
        val_uuid = uuid.UUID(ticket_id)
        id_cond = or_(SupportTicket.id == val_uuid, SupportTicket.ticket_code == ticket_id)
    except (ValueError, AttributeError):
        pass

    stmt = select(SupportTicket).where(
        and_(
            id_cond,
            or_(SupportTicket.user_id == current_user.id, SupportTicket.user_email == current_user.email),
        )
    )
    res = await db.execute(stmt)
    ticket = res.scalars().first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found or access denied.")

    return {
        "ticket": {
            "id": str(ticket.id),
            "ticket_code": ticket.ticket_code,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "assigned_admin": ticket.assigned_admin,
            "admin_reply": ticket.admin_reply,
            "replied_at": ticket.replied_at.strftime("%b %d, %Y, %I:%M %p") if ticket.replied_at else None,
            "created_at": ticket.created_at.strftime("%b %d, %Y, %I:%M %p") if ticket.created_at else "Recent",
            "updated_at": ticket.updated_at.strftime("%b %d, %Y, %I:%M %p") if ticket.updated_at else "Recent",
        }
    }
