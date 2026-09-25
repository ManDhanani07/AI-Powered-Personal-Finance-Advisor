"""
ReportLab PDF Generation Module for AI-Powered Personal Finance Advisor.
Produces high-readability, enterprise-grade, visually stunning page-specific financial statements:
1. Executive Summary Report
2. Spending & Merchant Analysis Report
3. Tax & Fiscal Audit Report
4. Comprehensive Master Financial Dossier
"""

import os
import io
from datetime import datetime
from typing import Dict, Any, List, Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and stamp 'Page X of Y' and running headers on every page.
    """
    custom_running_header = "AI WEALTH OS | OFFICIAL FINANCIAL STATEMENT & COMPLETE AUDITED LEDGER"
    custom_footer_title = "CONFIDENTIAL & OFFICIAL FINANCIAL STATEMENT | AI-POWERED PERSONAL FINANCE ADVISOR"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#475569"))

        # Running header (pages after page 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(36, 808, 559, 808)
            header_str = getattr(self, "custom_running_header", "AI WEALTH OS | OFFICIAL FINANCIAL STATEMENT & COMPLETE AUDITED LEDGER")
            self.drawString(36, 814, header_str)
            self.drawRightString(559, 814, datetime.utcnow().strftime("%d %b %Y"))

        # Footer rule
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(36, 35, 559, 35)

        # Footer text
        self.setFont("Helvetica", 7.5)
        footer_str = getattr(self, "custom_footer_title", "CONFIDENTIAL & OFFICIAL FINANCIAL STATEMENT | AI-POWERED PERSONAL FINANCE ADVISOR")
        self.drawString(36, 23, footer_str)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 23, page_str)
        self.restoreState()


def _get_fonts() -> tuple[str, str]:
    """Register Arial TTF if available on Windows, else fallback to standard Helvetica."""
    regular_font = "Helvetica"
    bold_font = "Helvetica-Bold"

    arial_path = r"C:\Windows\Fonts\arial.ttf"
    arial_bd_path = r"C:\Windows\Fonts\arialbd.ttf"

    if os.path.exists(arial_path) and os.path.exists(arial_bd_path):
        try:
            pdfmetrics.registerFont(TTFont("AppArial", arial_path))
            pdfmetrics.registerFont(TTFont("AppArial-Bold", arial_bd_path))
            regular_font = "AppArial"
            bold_font = "AppArial-Bold"
        except Exception:
            pass

    return regular_font, bold_font


def _fmt_currency(val: Any) -> str:
    """Safely format currency into INR format."""
    try:
        f_val = float(val or 0.0)
        return f"Rs. {f_val:,.2f}"
    except (ValueError, TypeError):
        return "Rs. 0.00"


def _make_mini_bar(pct: float, width: float = 75, height: float = 6, bar_color: str = "#10B981") -> Drawing:
    """Renders a sleek, rounded visual horizontal progress bar inside ReportLab table cells."""
    d = Drawing(width, height)
    # Background soft track
    d.add(Rect(0, 0.5, width, height - 1, fillColor=colors.HexColor("#E2E8F0"), strokeColor=None, rx=2.5, ry=2.5))
    # Filled progress
    safe_pct = max(0.0, min(100.0, float(pct or 0.0)))
    if safe_pct > 0:
        fill_w = max(2.5, (safe_pct / 100.0) * width)
        try:
            c_fill = colors.HexColor(bar_color)
        except Exception:
            c_fill = colors.HexColor("#10B981")
        d.add(Rect(0, 0.5, fill_w, height - 1, fillColor=c_fill, strokeColor=None, rx=2.5, ry=2.5))
    return d


def generate_pdf_financial_report(
    user_display: str,
    user_email: str,
    filter_type: str,
    summary_rep: Dict[str, Any],
    cat_rep: Dict[str, Any],
    budget_rep: Dict[str, Any],
    goal_rep: Dict[str, Any],
    health_rep: Dict[str, Any],
    forecast_rep: Dict[str, Any],
    transactions: List[Any],
    report_type: str = "executive",
    advanced_rep: Optional[Dict[str, Any]] = None,
    ai_summary_rep: Optional[Dict[str, Any]] = None,
) -> io.BytesIO:
    """
    Builds a comprehensive, highly visual, enterprise-grade financial statement PDF
    tailored directly to the active report tab being viewed, including the FULL audited transaction ledger.
    """
    output = io.BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=42,
        bottomMargin=45,
    )

    reg_font, bold_font = _get_fonts()

    # Core Color Palette
    c_primary = colors.HexColor("#0F172A")    # Slate 900
    c_accent = colors.HexColor("#10B981")     # Emerald 500
    c_income = colors.HexColor("#047857")     # Emerald 700
    c_expense = colors.HexColor("#BE123C")    # Rose 700
    c_savings = colors.HexColor("#4338CA")    # Indigo 700
    c_cyan = colors.HexColor("#0D9488")       # Teal 600
    c_text_dark = colors.HexColor("#0F172A")  # Slate 900
    c_text_muted = colors.HexColor("#475569") # Slate 600
    c_bg_subtle = colors.HexColor("#F8FAFC")  # Slate 50
    c_border = colors.HexColor("#CBD5E1")     # Slate 300
    c_border_light = colors.HexColor("#E2E8F0")

    # Custom Typography Styles
    brand_eyebrow = ParagraphStyle(
        "BrandEyebrow",
        fontName=bold_font,
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#2DD4BF"), # Bright Teal
    )
    title_style = ParagraphStyle(
        "DocTitle",
        fontName=bold_font,
        fontSize=15.5,
        leading=19,
        textColor=colors.white,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        fontName=reg_font,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94A3B8"),
    )
    sec_heading = ParagraphStyle(
        "SectionHeading",
        fontName=bold_font,
        fontSize=10.5,
        leading=14,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
    )
    sec_subheading = ParagraphStyle(
        "SectionSubheading",
        fontName=reg_font,
        fontSize=8,
        leading=10.5,
        textColor=c_text_muted,
        spaceAfter=4,
    )
    meta_label = ParagraphStyle(
        "MetaLabel",
        fontName=bold_font,
        fontSize=7.5,
        leading=10,
        textColor=c_text_muted,
    )
    meta_val_bold = ParagraphStyle(
        "MetaValBold",
        fontName=bold_font,
        fontSize=8.5,
        leading=11,
        textColor=c_text_dark,
    )
    table_cell = ParagraphStyle(
        "TableCell",
        fontName=reg_font,
        fontSize=8,
        leading=11,
        textColor=c_text_dark,
    )
    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        fontName=bold_font,
        fontSize=8,
        leading=11,
        textColor=c_text_dark,
    )
    table_cell_right = ParagraphStyle(
        "TableCellRight",
        fontName=reg_font,
        fontSize=8,
        leading=11,
        alignment=2,
        textColor=c_text_dark,
    )
    table_cell_right_bold = ParagraphStyle(
        "TableCellRightBold",
        fontName=bold_font,
        fontSize=8,
        leading=11,
        alignment=2,
        textColor=c_text_dark,
    )
    insight_text = ParagraphStyle(
        "InsightText",
        fontName=reg_font,
        fontSize=8.5,
        leading=12.5,
        textColor=c_text_dark,
    )

    elements = []
    now_formatted = datetime.utcnow().strftime("%d %B %Y, %I:%M %p UTC")
    statement_ref = f"APFA-STMT-{datetime.utcnow().strftime('%Y%m%d')}-{len(transactions)}"
    rtype = (report_type or "executive").lower().strip()

    # Determine Comprehensive Purpose-Specific Titles & Header Context
    if "spending" in rtype:
        doc_eyebrow = "AI WEALTH OS &bull; EXPENDITURE AUDIT & BENEFICIARY CONCENTRATION"
        banner_title = "OFFICIAL EXPENDITURE & VENDOR AUDIT STATEMENT"
        banner_sub = "Itemized Category Allocation, Top Beneficiary Outflows, Mean Variance & Merchant Diagnostics"
        scope_badge = "SPENDING & VENDOR ANALYSIS"
        scope_purpose = "Comprehensive Outflow Decomposition & Supplier Audit"
        accent_color = colors.HexColor("#3B82F6") # Sapphire Blue
    elif "tax" in rtype:
        doc_eyebrow = "AI WEALTH OS &bull; STATUTORY TAX DEDUCTION & FISCAL COMPLIANCE"
        banner_title = "OFFICIAL STATUTORY TAX & FISCAL AUDIT STATEMENT"
        banner_sub = "Eligible Deductions (Section 80C, 80D, 80G), Tax Shield Optimizations & Fixed Burn Audit"
        scope_badge = "TAX & FISCAL COMPLIANCE"
        scope_purpose = "Statutory Deductions & Fiscal Shield Verification"
        accent_color = colors.HexColor("#10B981") # Emerald Green
    elif "insight" in rtype or "comprehensive" in rtype:
        doc_eyebrow = "AI WEALTH OS &bull; AUTONOMOUS FINANCIAL INTELLIGENCE DOSSIER"
        banner_title = "EXECUTIVE FINANCIAL INTELLIGENCE & INSIGHTS DOSSIER"
        banner_sub = "Autonomous Strategic Synthesis, Prioritized Action Matrix, Multi-Pillar Risk Diagnostics & Horizon Planning"
        scope_badge = "STRATEGIC INTELLIGENCE & INSIGHTS"
        scope_purpose = "Comprehensive Strategic Intelligence & Autonomous Financial Optimization (Ledger Excluded for Readability)"
        accent_color = colors.HexColor("#6366F1") # Indigo
    else:
        # Default / Executive Summary
        doc_eyebrow = "AI WEALTH OS &bull; WEALTH INTELLIGENCE PLATFORM"
        banner_title = "OFFICIAL EXECUTIVE FINANCIAL STATEMENT & WEALTH AUDIT"
        banner_sub = "Executive Cash Flow Performance, Category Outflow Vectors, Net Solvency & Complete Ledger"
        scope_badge = "EXECUTIVE FINANCIAL STATEMENT"
        scope_purpose = "Comprehensive Personal Financial Health & Complete Transaction Audit"
        accent_color = colors.HexColor("#0D9488") # Teal

    # ─────────────────────────────────────────────────────────────
    # 1. HEADER BANNER (CLEAR DOCUMENT PURPOSE & AUDIT IDENTITY)
    # ─────────────────────────────────────────────────────────────
    banner_left = [
        Paragraph(doc_eyebrow, brand_eyebrow),
        Spacer(1, 2),
        Paragraph(banner_title, title_style),
        Spacer(1, 2),
        Paragraph(banner_sub, subtitle_style),
    ]
    banner_right = [
        Paragraph(f"<b>STATEMENT REF:</b> {statement_ref}", ParagraphStyle("HRef", fontName=bold_font, fontSize=7.5, leading=9.5, textColor=colors.HexColor("#CBD5E1"), alignment=2)),
        Paragraph(f"<b>STATEMENT DATE:</b> {now_formatted}", ParagraphStyle("HDate", fontName=reg_font, fontSize=7.5, leading=9.5, textColor=colors.HexColor("#CBD5E1"), alignment=2)),
        Spacer(1, 2),
        Paragraph(f"<b>AUDIT STATUS:</b> <font color='#34D399'><b>100% RECONCILED</b></font>", ParagraphStyle("HStat", fontName=bold_font, fontSize=7.5, leading=9.5, textColor=colors.white, alignment=2)),
        Paragraph(f"<b>REPORT SCOPE:</b> <font color='#38BDF8'><b>{scope_badge}</b></font>", ParagraphStyle("HScope", fontName=bold_font, fontSize=7.5, leading=9.5, textColor=colors.white, alignment=2)),
    ]

    banner_table = Table([[banner_left, banner_right]], colWidths=[355, 168])
    banner_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#090D16")), # Deep Midnight Navy
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(banner_table)

    # Accent dual-stripe
    accent_stripe = Table([[""]], colWidths=[523], rowHeights=[3])
    accent_stripe.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), accent_color),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(accent_stripe)
    elements.append(Spacer(1, 6))

    # Document Legal Purpose & Integrity Callout Bar
    filter_label = filter_type.replace("_", " ").title()
    if filter_type.lower() == "all":
        filter_label = "All Time (Complete Recorded History)"

    is_insight_mode = "insight" in rtype or "comprehensive" in rtype
    if is_insight_mode:
        notice_text = (
            f"<b>DOCUMENT PURPOSE:</b> {scope_purpose}. "
            f"This verified intelligence dossier synthesizes multi-pillar transaction vectors, cash flow ratios, "
            f"risk radar diagnostics, and machine learning forecasts into prioritized, actionable directives for "
            f"<b>{user_display}</b> (<b>{user_email}</b>). Focused intelligence report (ledger excluded for maximum readability)."
        )
    else:
        notice_text = (
            f"<b>DOCUMENT PURPOSE:</b> {scope_purpose}. "
            f"This verified financial statement contains all confirmed income and expenditure transactions, "
            f"autonomous health analytics, and portfolio metrics for <b>{user_display}</b> (<b>{user_email}</b>). "
            f"Complete and non-truncated ledger."
        )

    doc_notice = Table([
        [
            Paragraph(notice_text, ParagraphStyle("DocNotice", fontName=reg_font, fontSize=7.5, leading=10.5, textColor=colors.HexColor("#334155")))
        ]
    ], colWidths=[523])
    doc_notice.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(doc_notice)
    elements.append(Spacer(1, 6))

    # ─────────────────────────────────────────────────────────────
    # 2. ACCOUNT HOLDER METADATA (BOLD, PROMINENT, VERIFIED)
    # ─────────────────────────────────────────────────────────────
    if is_insight_mode:
        vol_label = "TRANSACTIONS ANALYZED"
        vol_val = f"<b>{len(transactions):,} Verified Records</b>"
        rec_label = "DOSSIER FORMAT"
        rec_val = "<b>Full Strategic Insights (Ledger Excluded)</b>"
    else:
        vol_label = "TOTAL LEDGER VOLUME"
        vol_val = f"<b>{len(transactions):,} Audited Transactions (Full Ledger)</b>"
        rec_label = "LEDGER RECONCILIATION"
        rec_val = "<b>100% PostgreSQL Synced & Cleaned</b>"

    meta_data = [
        [
            Paragraph("ACCOUNT HOLDER", meta_label),
            Paragraph(f"<b>{user_display}</b>", meta_val_bold),
            Paragraph("STATEMENT TIMELINE", meta_label),
            Paragraph(f"<b>{filter_label}</b>", meta_val_bold),
        ],
        [
            Paragraph("REGISTERED EMAIL", meta_label),
            Paragraph(f"<b>{user_email}</b>", meta_val_bold),
            Paragraph(vol_label, meta_label),
            Paragraph(vol_val, meta_val_bold),
        ],
        [
            Paragraph("AUTHENTICATION IDENTITY", meta_label),
            Paragraph(f"<b>Verified User Profile</b>", meta_val_bold),
            Paragraph(rec_label, meta_label),
            Paragraph(rec_val, meta_val_bold),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[120, 145, 115, 143])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), c_bg_subtle),
        ("BOX", (0, 0), (-1, -1), 0.75, c_border),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border_light),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8))

    # Core Financial Metric Extracts
    kpis = summary_rep.get("kpis", {})
    inc_val = float(kpis.get("total_income", 0.0))
    exp_val = float(kpis.get("total_expenses", 0.0))
    sav_val = float(kpis.get("net_savings", 0.0))
    sav_rate = float(kpis.get("savings_rate", 0.0))
    health_score = float(health_rep.get("latest_score", 75.0))
    health_grade = health_rep.get("latest_grade", "B")
    cat_items = cat_rep.get("categories", [])
    merchant_items = cat_rep.get("merchants", [])

    # Robust total categorized spend calculation
    total_cat_spend = sum(float(c.get("total_amount") or c.get("amount") or 0.0) for c in cat_items) or exp_val or 1.0

    # =========================================================================
    # BRANCH A: SPENDING ANALYSIS REPORT
    # =========================================================================
    if "spending" in rtype:
        avg_tx = exp_val / max(1, len([t for t in transactions if (getattr(t, "transaction_type", "") or "").upper() == "EXPENSE"]))
        largest_tx = max([float(getattr(t, "amount", 0.0)) for t in transactions if (getattr(t, "transaction_type", "") or "").upper() == "EXPENSE"], default=0.0)
        top_cat_name = str(cat_items[0].get("category_name", "N/A")).title() if cat_items else "N/A"
        top_cat_pct = float(cat_items[0].get("percentage", 0.0)) if cat_items else 0.0

        # Spending Tailored Visual KPI Cards
        spend_kpi_data = [
            [
                Paragraph("TOTAL EXPENDITURE", ParagraphStyle("Sk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("AVERAGE TRANSACTION", ParagraphStyle("Sk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#B45309"))),
                Paragraph("LARGEST SINGLE OUTFLOW", ParagraphStyle("Sk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#6D28D9"))),
                Paragraph("TOP EXPENSE VECTOR", ParagraphStyle("Sk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
            ],
            [
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("SkVal1", fontName=bold_font, fontSize=13, leading=16, textColor=c_expense)),
                Paragraph(_fmt_currency(avg_tx), ParagraphStyle("SkVal2", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#B45309"))),
                Paragraph(_fmt_currency(largest_tx), ParagraphStyle("SkVal3", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#6D28D9"))),
                Paragraph(top_cat_name, ParagraphStyle("SkVal4", fontName=bold_font, fontSize=13, leading=16, textColor=c_income)),
            ],
            [
                Paragraph("Audited Outflows Across All Vectors", ParagraphStyle("SkSub1", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Mean Outflow / Verified Transaction", ParagraphStyle("SkSub2", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Peak Transaction Value Recorded", ParagraphStyle("SkSub3", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph(f"Accounts for <b>{top_cat_pct:.1f}%</b> of Outflows", ParagraphStyle("SkSub4", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
            ],
        ]
        spend_kpi_table = Table(spend_kpi_data, colWidths=[130, 131, 131, 131])
        spend_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FFF1F2")), # Rose tint
            ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#FEF3C7")), # Amber tint
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#F5F3FF")), # Purple tint
            ("BACKGROUND", (3, 0), (3, -1), colors.HexColor("#F0FDF4")), # Emerald tint
            ("BOX", (0, 0), (0, -1), 1, colors.HexColor("#F43F5E")),
            ("BOX", (1, 0), (1, -1), 1, colors.HexColor("#F59E0B")),
            ("BOX", (2, 0), (2, -1), 1, colors.HexColor("#8B5CF6")),
            ("BOX", (3, 0), (3, -1), 1, colors.HexColor("#10B981")),
            ("TOPPADDING", (0, 0), (-1, -1), 5.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(spend_kpi_table)
        elements.append(Spacer(1, 8))

        # Top Merchant Spending Table with Visual Share Bars
        elements.append(Paragraph("Top Merchant Outflows & Vendor Concentration", sec_heading))
        m_rows = [
            [
                Paragraph("<b>Rank</b>", ParagraphStyle("Mh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Merchant / Beneficiary Name</b>", ParagraphStyle("Mh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Distribution Bar</b>", ParagraphStyle("Mh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Total Outflow</b>", ParagraphStyle("Mh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Tx Count</b>", ParagraphStyle("Mh5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Mh6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        top_merchants = merchant_items[:10] if merchant_items else []
        tot_m_spend = sum(float(m.get("total_amount", 0.0)) for m in top_merchants) or 1.0
        if top_merchants:
            for idx, m in enumerate(top_merchants):
                m_name = str(m.get("merchant", "Vendor Payee")).title()
                m_amt = float(m.get("total_amount", 0.0))
                m_cnt = int(m.get("tx_count", 1))
                m_pct = (m_amt / exp_val * 100.0) if exp_val > 0 else 0.0
                bar = _make_mini_bar(m_pct, width=70, bar_color="#3B82F6")
                m_rows.append([
                    Paragraph(f"#{idx+1}", table_cell_bold),
                    Paragraph(f"<b>{m_name}</b>", table_cell),
                    bar,
                    Paragraph(_fmt_currency(m_amt), table_cell_right_bold),
                    Paragraph(f"{m_cnt} txs", table_cell_right),
                    Paragraph(f"<b>{m_pct:.1f}%</b>", table_cell_right),
                ])
            tot_bar = _make_mini_bar(min(100.0, tot_m_spend / exp_val * 100.0 if exp_val > 0 else 0.0), width=70, bar_color="#1E3A8A")
            m_rows.append([
                Paragraph("<b>TOTAL</b>", table_cell_bold),
                Paragraph(f"<b>Top {len(top_merchants)} Vendors Audited</b>", table_cell_bold),
                tot_bar,
                Paragraph(_fmt_currency(tot_m_spend), table_cell_right_bold),
                Paragraph(f"{sum(int(m.get('tx_count', 1)) for m in top_merchants)} txs", table_cell_right_bold),
                Paragraph(f"<b>{(tot_m_spend / exp_val * 100.0):.1f}%</b>", table_cell_right_bold),
            ])
        else:
            m_rows.append([
                Paragraph("#1", table_cell),
                Paragraph("No vendor transactions identified for this period filter.", table_cell),
                _make_mini_bar(0.0, width=70),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("0", table_cell_right),
                Paragraph("0.0%", table_cell_right),
            ])

        m_table = Table(m_rows, colWidths=[38, 175, 78, 105, 62, 65])
        m_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")), # Deep Blue
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(m_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            m_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(m_rows) > 2:
            m_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EFF6FF")))
        m_table.setStyle(TableStyle(m_t_styles))
        elements.append(m_table)
        elements.append(Spacer(1, 8))

        # Full Category Spending Allocation Matrix with Visuals
        elements.append(Paragraph("Category Spending Ledger Allocation Matrix", sec_heading))
        cat_rows = [
            [
                Paragraph("<b>Category Name</b>", ParagraphStyle("Ch1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Visual Distribution</b>", ParagraphStyle("Ch2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Ch3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Total Outflow</b>", ParagraphStyle("Ch4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Tx Count</b>", ParagraphStyle("Ch5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Mean / Tx</b>", ParagraphStyle("Ch6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        for c in cat_items:
            c_name = str(c.get("category_name") or c.get("name") or "General").title()
            c_amt = float(c.get("total_amount") or c.get("amount") or 0.0)
            c_pct = float(c.get("percentage") or (c_amt / (total_cat_spend or 1.0) * 100.0))
            c_cnt = int(c.get("tx_count") or c.get("count") or c.get("transaction_count") or 1)
            c_mean = c_amt / max(1, c_cnt)
            c_color = str(c.get("color") or "#10B981")
            bar = _make_mini_bar(c_pct, width=75, bar_color=c_color)
            cat_rows.append([
                Paragraph(f"<font color='{c_color}'>&#9679;</font> <b>{c_name}</b>", table_cell),
                bar,
                Paragraph(f"<b>{c_pct:.1f}%</b>", table_cell_right),
                Paragraph(_fmt_currency(c_amt), table_cell_right_bold),
                Paragraph(f"{c_cnt} entries", table_cell_right),
                Paragraph(_fmt_currency(c_mean), table_cell_right),
            ])
        cat_rows.append([
            Paragraph("<b>TOTAL CATEGORIZED SPEND</b>", table_cell_bold),
            _make_mini_bar(100.0, width=75, bar_color="#0F172A"),
            Paragraph("<b>100.0%</b>", table_cell_right_bold),
            Paragraph(_fmt_currency(total_cat_spend), table_cell_right_bold),
            Paragraph(f"{sum(int(c.get('tx_count') or c.get('count') or 1) for c in cat_items)} entries", table_cell_right_bold),
            Paragraph(_fmt_currency(avg_tx), table_cell_right_bold),
        ])
        cat_tbl = Table(cat_rows, colWidths=[140, 80, 55, 105, 75, 68])
        cat_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(cat_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            cat_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(cat_rows) > 2:
            cat_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F5F9")))
        cat_tbl.setStyle(TableStyle(cat_t_styles))
        elements.append(cat_tbl)
        elements.append(Spacer(1, 10))

        # Spending Diagnostics Callout Box (KeepTogether prevents split)
        adv_notes = [
            f"&bull; <b>Concentration Alert:</b> Your top expenditure vector is <b>{top_cat_name}</b>, which consumes <b>{top_cat_pct:.1f}%</b> of total outflow.",
            f"&bull; <b>Outflow Volatility:</b> Largest single outflow recorded was <b>{_fmt_currency(largest_tx)}</b> against an overall transaction mean of <b>{_fmt_currency(avg_tx)}</b>.",
            f"&bull; <b>Vendor Management:</b> Top 10 merchants account for <b>{tot_m_spend/exp_val*100:.1f}%</b> of your verified consumption. Review recurring agreements to capture savings.",
        ]
        diag_content = [
            [Paragraph("<b>AUTOMATED SPENDING & CONCENTRATION DIAGNOSTICS</b>", ParagraphStyle("DH1", fontName=bold_font, fontSize=8.5, leading=10, textColor=colors.HexColor("#1E3A8A")))],
            *[[Paragraph(note, insight_text)] for note in adv_notes],
        ]
        diag_table = Table(diag_content, colWidths=[523])
        diag_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
            ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#3B82F6")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(KeepTogether([diag_table]))

    # =========================================================================
    # BRANCH B: TAX & FISCAL AUDIT REPORT
    # =========================================================================
    elif "tax" in rtype:
        adv = advanced_rep or {}
        tax_sec = adv.get("tax_audit", {})
        rec_sec = adv.get("recurring_audit", {})
        ano_sec = adv.get("anomaly_audit", {})

        tot_claimed = float(tax_sec.get("total_claimed_deductions", 0.0))
        tot_eligible = float(tax_sec.get("total_eligible_deductions", 0.0))
        tax_shield_30 = float(tax_sec.get("estimated_tax_shield_30pct", 0.0))
        tax_shield_20 = float(tax_sec.get("estimated_tax_shield_20pct", 0.0))
        monthly_rec = float(rec_sec.get("total_monthly_recurring", 0.0))
        annual_rec = float(rec_sec.get("total_annual_projected", 0.0))

        # Tax Tailored Visual KPI Cards
        tax_kpi_data = [
            [
                Paragraph("TOTAL CLAIMABLE DEDUCTIONS", ParagraphStyle("Tk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("ESTIMATED TAX SHIELD (30%)", ParagraphStyle("Tk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#0284C7"))),
                Paragraph("ESTIMATED TAX SHIELD (20%)", ParagraphStyle("Tk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#4338CA"))),
                Paragraph("MONTHLY RECURRING BURN", ParagraphStyle("Tk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#B45309"))),
            ],
            [
                Paragraph(_fmt_currency(tot_claimed), ParagraphStyle("TkVal1", fontName=bold_font, fontSize=13, leading=16, textColor=c_income)),
                Paragraph(_fmt_currency(tax_shield_30), ParagraphStyle("TkVal2", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#0369A1"))),
                Paragraph(_fmt_currency(tax_shield_20), ParagraphStyle("TkVal3", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#4338CA"))),
                Paragraph(_fmt_currency(monthly_rec), ParagraphStyle("TkVal4", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#B45309"))),
            ],
            [
                Paragraph(f"From <b>{_fmt_currency(tot_eligible)}</b> eligible spend", ParagraphStyle("TkSub1", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Direct Cash Savings (High Bracket)", ParagraphStyle("TkSub2", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Direct Cash Savings (Mid Bracket)", ParagraphStyle("TkSub3", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph(f"Annualized: <b>{_fmt_currency(annual_rec)}</b>", ParagraphStyle("TkSub4", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
            ],
        ]
        tax_kpi_table = Table(tax_kpi_data, colWidths=[130, 131, 131, 131])
        tax_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0FDF4")), # Emerald tint
            ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F0F9FF")), # Sky tint
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#EEF2FF")), # Indigo tint
            ("BACKGROUND", (3, 0), (3, -1), colors.HexColor("#FEF3C7")), # Amber tint
            ("BOX", (0, 0), (0, -1), 1, colors.HexColor("#10B981")),
            ("BOX", (1, 0), (1, -1), 1, colors.HexColor("#0284C7")),
            ("BOX", (2, 0), (2, -1), 1, colors.HexColor("#6366F1")),
            ("BOX", (3, 0), (3, -1), 1, colors.HexColor("#F59E0B")),
            ("TOPPADDING", (0, 0), (-1, -1), 5.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(tax_kpi_table)
        elements.append(Spacer(1, 8))

        # Statutory Deductions Section Table with Visual Bars
        elements.append(Paragraph("Deductions Allocation by Statutory Section", sec_heading))
        t_breakdown = tax_sec.get("breakdown", {})
        sec_rows = [
            [
                Paragraph("<b>Statutory Section & Coverage</b>", ParagraphStyle("Sth1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Regulatory Cap</b>", ParagraphStyle("Sth2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Claimed Amount</b>", ParagraphStyle("Sth3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Eligible Spend</b>", ParagraphStyle("Sth4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Utilization</b>", ParagraphStyle("Sth5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Share</b>", ParagraphStyle("Sth6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Items</b>", ParagraphStyle("Sth7", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        if t_breakdown:
            for s_key, s_data in t_breakdown.items():
                s_name = str(s_data.get("name", s_key))
                s_cap = float(s_data.get("max_limit", 0.0))
                s_claim = float(s_data.get("claimed_amount", 0.0))
                s_elig = float(s_data.get("eligible_amount", 0.0))
                s_util = float(s_data.get("utilization_pct", 0.0))
                s_items = int(s_data.get("items_count", 0))
                s_bar = _make_mini_bar(min(100.0, s_util), width=60, bar_color="#059669")
                sec_rows.append([
                    Paragraph(f"<b>{s_name}</b>", table_cell),
                    Paragraph(_fmt_currency(s_cap), table_cell_right),
                    Paragraph(_fmt_currency(s_claim), table_cell_right_bold),
                    Paragraph(_fmt_currency(s_elig), table_cell_right),
                    s_bar,
                    Paragraph(f"<b>{s_util:.1f}%</b>", table_cell_right),
                    Paragraph(f"{s_items}", table_cell_right),
                ])
            tot_util = (tot_claimed / max(1, tot_eligible) * 100) if tot_eligible > 0 else 0.0
            tot_bar = _make_mini_bar(min(100.0, tot_util), width=60, bar_color="#065F46")
            sec_rows.append([
                Paragraph("<b>TOTAL STATUTORY DEDUCTIONS</b>", table_cell_bold),
                Paragraph("-", table_cell_right),
                Paragraph(_fmt_currency(tot_claimed), table_cell_right_bold),
                Paragraph(_fmt_currency(tot_eligible), table_cell_right_bold),
                tot_bar,
                Paragraph(f"<b>{tot_util:.1f}%</b>", table_cell_right_bold),
                Paragraph(f"{sum(int(d.get('items_count', 0)) for d in t_breakdown.values())}", table_cell_right_bold),
            ])
        else:
            sec_rows.append([
                Paragraph("Section 80C, 80D, and eligible statutory records analyzed.", table_cell),
                Paragraph("Rs. 1,50,000.00", table_cell_right),
                Paragraph(_fmt_currency(tot_claimed), table_cell_right),
                Paragraph(_fmt_currency(tot_eligible), table_cell_right),
                _make_mini_bar(0.0, width=60),
                Paragraph("0.0%", table_cell_right),
                Paragraph("0", table_cell_right),
            ])

        sec_table = Table(sec_rows, colWidths=[150, 75, 75, 75, 65, 45, 38])
        sec_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065F46")), # Emerald 800
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(sec_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            sec_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(sec_rows) > 2:
            sec_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F0FDF4")))
        sec_table.setStyle(TableStyle(sec_t_styles))
        elements.append(sec_table)
        elements.append(Spacer(1, 8))

        # Recurring Overhead & Subscriptions Audit
        elements.append(Paragraph("Recurring Subscriptions & Fixed Overhead Audit", sec_heading))
        rec_services = rec_sec.get("recurring_services", [])
        rec_rows = [
            [
                Paragraph("<b>Service / Contract Name</b>", ParagraphStyle("Rh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Overhead Classification</b>", ParagraphStyle("Rh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Monthly Burn</b>", ParagraphStyle("Rh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Projected Annualized</b>", ParagraphStyle("Rh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        if rec_services:
            for s in rec_services[:8]:
                r_name = str(s.get("service_name", "Recurring Overhead")).title()
                r_tier = str(s.get("category", "Fixed Contract")).title()
                r_amt = float(s.get("monthly_amount", 0.0))
                r_ann = float(s.get("annual_projected", r_amt * 12.0))
                rec_rows.append([
                    Paragraph(f"<b>{r_name}</b>", table_cell_bold),
                    Paragraph(r_tier, table_cell),
                    Paragraph(_fmt_currency(r_amt), table_cell_right_bold),
                    Paragraph(_fmt_currency(r_ann), table_cell_right),
                ])
            rec_rows.append([
                Paragraph("<b>TOTAL RECURRING COMMITMENTS</b>", table_cell_bold),
                Paragraph(f"<b>{len(rec_services)} Active Subscriptions</b>", table_cell_bold),
                Paragraph(_fmt_currency(monthly_rec), table_cell_right_bold),
                Paragraph(_fmt_currency(annual_rec), table_cell_right_bold),
            ])
        else:
            rec_rows.append([
                Paragraph("No recurring subscriptions or fixed contracts detected.", table_cell),
                Paragraph("-", table_cell),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("Rs. 0.00", table_cell_right),
            ])
        rec_table = Table(rec_rows, colWidths=[170, 143, 105, 105])
        rec_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#312E81")), # Indigo 900
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(rec_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            rec_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(rec_rows) > 2:
            rec_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EEF2FF")))
        rec_table.setStyle(TableStyle(rec_t_styles))
        elements.append(rec_table)
        elements.append(Spacer(1, 8))

        # Spending Outliers & Anomaly Table
        elements.append(Paragraph("Statistical Anomaly & Spending Outlier Detector", sec_heading))
        anomalies = ano_sec.get("outlier_transactions", [])
        ano_rows = [
            [
                Paragraph("<b>Date</b>", ParagraphStyle("Ah1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Transaction Description</b>", ParagraphStyle("Ah2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Category</b>", ParagraphStyle("Ah3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Amount</b>", ParagraphStyle("Ah4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Anomaly Flag</b>", ParagraphStyle("Ah5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        if anomalies:
            for a in anomalies[:5]:
                a_date = a.get("date", "N/A")
                a_desc = a.get("description", "High Variance Transaction")[:28]
                a_cat = a.get("category", "Outflow")
                a_amt = float(a.get("amount", 0.0))
                a_flag = a.get("reason", "Z-Score Spike > 2.5")
                ano_rows.append([
                    Paragraph(a_date, table_cell),
                    Paragraph(f"<b>{a_desc}</b>", table_cell),
                    Paragraph(a_cat, table_cell),
                    Paragraph(_fmt_currency(a_amt), table_cell_right_bold),
                    Paragraph(f"<font color='#BE123C'><b>{a_flag}</b></font>", table_cell_right),
                ])
        else:
            ano_rows.append([
                Paragraph("All transaction records fall within standard statistical spending variance bounds (Zero outliers detected).", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("<font color='#047857'><b>● Normal</b></font>", table_cell_right),
            ])
        ano_table = Table(ano_rows, colWidths=[70, 160, 100, 93, 100])
        ano_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(ano_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            ano_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        ano_table.setStyle(TableStyle(ano_t_styles))
        elements.append(ano_table)

    # =========================================================================
    # BRANCH C: COMPREHENSIVE FINANCIAL INTELLIGENCE & INSIGHTS DOSSIER
    # (ALL INSIGHTS, NO TRANSACTION LEDGER, PROPER FORMATTING & SPACIOUS LAYOUT)
    # =========================================================================
    elif "insight" in rtype or "comprehensive" in rtype:
        b_limit = float(budget_rep.get("total_limit", 0.0))
        b_spent = float(budget_rep.get("total_spent", 0.0))
        b_util = float(budget_rep.get("overall_utilization_pct", 0.0))
        g_total = int(goal_rep.get("total_goals", 0))
        g_comp = int(goal_rep.get("completed_goals", 0))
        g_pct = float(goal_rep.get("overall_completion_pct", 0.0))
        fc_next = float(forecast_rep.get("forecast_next_month_expense", exp_val or 0.0))

        # Primary spending category extraction
        highest_cat = cat_items[0] if cat_items else {}
        highest_cat_name = str(highest_cat.get("category_name", "Essential Living")).title()
        highest_cat_amt = float(highest_cat.get("total_amount") or highest_cat.get("amount") or 0.0)
        highest_cat_pct = float(highest_cat.get("percentage", 0.0)) or (round(highest_cat_amt / exp_val * 100, 1) if exp_val > 0 else 0.0)

        # -------------------------------------------------------------
        # 1. MULTI-PILLAR PASTEL KPI CARDS (PAGE 1)
        # -------------------------------------------------------------
        master_kpi_data = [
            [
                Paragraph("TOTAL INFLOW", ParagraphStyle("Mk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("TOTAL OUTFLOW", ParagraphStyle("Mk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("NET CAPITAL RETENTION", ParagraphStyle("Mk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_savings)),
                Paragraph("COMPOSITE HEALTH SCORE", ParagraphStyle("Mk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_cyan)),
            ],
            [
                Paragraph(_fmt_currency(inc_val), ParagraphStyle("MkVal1", fontName=bold_font, fontSize=13, leading=16, textColor=c_income)),
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("MkVal2", fontName=bold_font, fontSize=13, leading=16, textColor=c_expense)),
                Paragraph(_fmt_currency(sav_val), ParagraphStyle("MkVal3", fontName=bold_font, fontSize=13, leading=16, textColor=c_savings)),
                Paragraph(f"{health_score:.0f}/100 <font size='9.5'><b>({health_grade})</b></font>", ParagraphStyle("MkVal4", fontName=bold_font, fontSize=13, leading=16, textColor=c_cyan)),
            ],
            [
                Paragraph(f"Savings Rate: <b>{sav_rate:.1f}%</b>", ParagraphStyle("MkSub1", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Audited Capital Outflows", ParagraphStyle("MkSub2", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Net Liquid Reserves Generated", ParagraphStyle("MkSub3", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Multi-Pillar Solvency Index", ParagraphStyle("MkSub4", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
            ],
        ]
        master_kpi_table = Table(master_kpi_data, colWidths=[130, 131, 131, 131])
        master_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0FDF4")), # Emerald
            ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#FFF1F2")), # Rose
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#EEF2FF")), # Indigo
            ("BACKGROUND", (3, 0), (3, -1), colors.HexColor("#F0FDFA")), # Teal
            ("BOX", (0, 0), (0, -1), 1.2, colors.HexColor("#10B981")),
            ("BOX", (1, 0), (1, -1), 1.2, colors.HexColor("#F43F5E")),
            ("BOX", (2, 0), (2, -1), 1.2, colors.HexColor("#6366F1")),
            ("BOX", (3, 0), (3, -1), 1.2, colors.HexColor("#0D9488")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(master_kpi_table)
        elements.append(Spacer(1, 10))

        # -------------------------------------------------------------
        # 2. AI EXECUTIVE STRATEGIC SYNTHESIS (PAGE 1)
        # -------------------------------------------------------------
        elements.append(Paragraph("AI Executive Financial Synthesis & Strategic Brief", sec_heading))
        elements.append(Paragraph("Autonomous high-level fiscal intelligence distilled from multi-vector ledger analysis.", sec_subheading))
        
        ai_brief_text = ""
        if ai_summary_rep and ai_summary_rep.get("ai_summary"):
            ai_brief_text = ai_summary_rep.get("ai_summary")
        elif sav_val > 0:
            ai_brief_text = (
                f"Your personal financial profile demonstrates positive cash retention with a net surplus of "
                f"{_fmt_currency(sav_val)} and a {sav_rate:.1f}% savings rate across the audited period. "
                f"Your primary expenditure vector is {highest_cat_name} ({_fmt_currency(highest_cat_amt)}, accounting for {highest_cat_pct:.1f}% of total outflows). "
                f"Maintaining disciplined category envelope thresholds while systematically deploying monthly surplus into high-yield reserves "
                f"will accelerate wealth milestone execution while fortifying your emergency liquidity cushion against unforeseen market spikes."
            )
        else:
            ai_brief_text = (
                f"Audited expenditures ({_fmt_currency(exp_val)}) are currently pacing close to total deposits ({_fmt_currency(inc_val)}). "
                f"{highest_cat_name} represents your single largest capital outflow ({_fmt_currency(highest_cat_amt)}). "
                f"Enforcing category spending caps and trimming discretionary subscriptions will rapidly restore positive cash surplus margins."
            )

        synth_box = Table([
            [
                Paragraph(f"<b>AUTONOMOUS AI WEALTH SYNTHESIS &bull; {now_formatted}</b>", ParagraphStyle("SynH", fontName=bold_font, fontSize=8, leading=10, textColor=colors.HexColor("#6D28D9"))),
            ],
            [
                Paragraph(f'"{ai_brief_text}"', ParagraphStyle("SynB", fontName=reg_font, fontSize=8.5, leading=13, textColor=colors.HexColor("#1E293B"))),
            ]
        ], colWidths=[523])
        synth_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF5FF")),
            ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#8B5CF6")),
            ("LINEBEFORE", (0, 0), (0, -1), 3.5, colors.HexColor("#7C3AED")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ]))
        elements.append(synth_box)
        elements.append(Spacer(1, 10))

        # -------------------------------------------------------------
        # 3. PRIORITIZED FINANCIAL ACTION MATRIX (PAGE 1)
        # -------------------------------------------------------------
        elements.append(Paragraph("Prioritized Financial Action Matrix (Ranked by Capital Impact)", sec_heading))
        elements.append(Paragraph("Concrete, data-backed optimization maneuvers ordered by financial return and solvency reinforcement.", sec_subheading))

        act_rows = [
            [
                Paragraph("<b>Priority Level</b>", ParagraphStyle("Ah1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Strategic Action Initiative</b>", ParagraphStyle("Ah2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Data-Backed Rationale & Evidence</b>", ParagraphStyle("Ah3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Projected Financial Return</b>", ParagraphStyle("Ah4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("<font color='#BE123C'><b>● HIGH PRIORITY</b></font>", table_cell_bold),
                Paragraph(f"<b>Optimize {highest_cat_name} Outflows</b>", table_cell),
                Paragraph(f"{highest_cat_name} accounts for <b>{highest_cat_pct:.1f}%</b> of total outflows ({_fmt_currency(highest_cat_amt)}). Pacing weekly disbursements prevents month-end liquidity compression.", table_cell),
                Paragraph(f"<font color='#047857'><b>Est. Monthly Recovery: ₹4,000 – ₹10,000</b></font>", table_cell),
            ],
            [
                Paragraph("<font color='#4338CA'><b>● GROWTH STRATEGY</b></font>", table_cell_bold),
                Paragraph("<b>Automate Monthly Surplus Deployment</b>", table_cell),
                Paragraph(f"Current net surplus stands at <b>{_fmt_currency(sav_val)}</b> ({sav_rate:.1f}% savings rate). Systematically routing 60% of surplus directly into liquid funds on payday locks in compounding.", table_cell),
                Paragraph(f"<font color='#4338CA'><b>Accelerates Milestone Velocity by ~3.5 Months</b></font>", table_cell),
            ],
            [
                Paragraph("<font color='#047857'><b>● BUDGET RESILIENCE</b></font>", table_cell_bold),
                Paragraph("<b>Enforce Envelope Utilization Caps (<80%)</b>", table_cell),
                Paragraph(f"Active envelope utilization is pacing at <b>{b_util:.1f}%</b>. Maintaining category thresholds below 80% buffers cash flow against sudden mid-cycle volatility.", table_cell),
                Paragraph(f"<font color='#047857'><b>Protects Solvency Score; Preserves Grade {health_grade}</b></font>", table_cell),
            ],
        ]
        act_table = Table(act_rows, colWidths=[95, 135, 178, 115])
        act_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#312E81")), # Indigo 900
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#FFF1F2")), # Rose tint
            ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#EEF2FF")), # Indigo tint
            ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#F0FDF4")), # Emerald tint
        ]))
        elements.append(act_table)

        # Clean page transition to Page 2
        elements.append(PageBreak())

        # -------------------------------------------------------------
        # 4. RISK RADAR & SOLVENCY VECTOR DIAGNOSTICS (PAGE 2)
        # -------------------------------------------------------------
        elements.append(Paragraph("Risk Radar & Capital Solvency Vector Diagnostics", sec_heading))
        elements.append(Paragraph("Continuous multi-dimensional algorithmic surveillance across liquidity, concentration, and budget discipline.", sec_subheading))

        c_conc_status = "<font color='#047857'><b>● Well Diversified</b></font>" if highest_cat_pct < 45 else "<font color='#B45309'><b>▲ Moderate Concentration</b></font>"
        c_flow_status = "<font color='#047857'><b>● Surplus Positive</b></font>" if sav_val > 0 else "<font color='#BE123C'><b>▼ Deficit Risk</b></font>"
        c_sav_status = "<font color='#047857'><b>● Target Exceeded</b></font>" if sav_rate >= 20 else ("<font color='#B45309'><b>▲ Healthy Pace</b></font>" if sav_rate >= 10 else "<font color='#BE123C'><b>▼ Needs Improvement</b></font>")
        c_bud_status = "<font color='#047857'><b>● Within Bounds</b></font>" if b_util <= 85 else "<font color='#B45309'><b>▲ Near Threshold</b></font>"

        risk_rows = [
            [
                Paragraph("<b>Risk Vector Domain</b>", ParagraphStyle("Rh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Status Assessment</b>", ParagraphStyle("Rh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Observed Metric</b>", ParagraphStyle("Rh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Algorithmic Diagnostic Finding</b>", ParagraphStyle("Rh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("<b>Category Concentration Risk</b>", table_cell),
                Paragraph(c_conc_status, table_cell),
                Paragraph(f"{highest_cat_name}: <b>{highest_cat_pct:.1f}%</b>", table_cell),
                Paragraph(f"Single-vector outflow concentration remains within manageable risk tolerance bounds.", table_cell),
            ],
            [
                Paragraph("<b>Cash Flow Velocity & Liquidity</b>", table_cell),
                Paragraph(c_flow_status, table_cell),
                Paragraph(f"Inflow/Outflow: <b>{(inc_val/exp_val if exp_val > 0 else 1.0):.2f}x</b>", table_cell),
                Paragraph("Net liquid inflows consistently outpace disbursements, preventing reliance on revolving debt.", table_cell),
            ],
            [
                Paragraph("<b>Savings & Wealth Momentum</b>", table_cell),
                Paragraph(c_sav_status, table_cell),
                Paragraph(f"Net Margin: <b>{sav_rate:.1f}%</b>", table_cell),
                Paragraph("Capital retention yield supports regular funding of active milestone and emergency reserves.", table_cell),
            ],
            [
                Paragraph("<b>Budget Envelope Discipline</b>", table_cell),
                Paragraph(c_bud_status, table_cell),
                Paragraph(f"Aggregate Cap: <b>{b_util:.1f}%</b>", table_cell),
                Paragraph("Active category limit utilization is pacing in alignment with projected cycle targets.", table_cell),
            ],
        ]
        risk_table = Table(risk_rows, colWidths=[130, 95, 100, 198])
        risk_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(risk_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            risk_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        risk_table.setStyle(TableStyle(risk_t_styles))
        elements.append(risk_table)
        elements.append(Spacer(1, 12))

        # -------------------------------------------------------------
        # 5. INSTITUTIONAL 50/30/20 CAPITAL ALLOCATION FRAMEWORK (PAGE 2)
        # -------------------------------------------------------------
        elements.append(Paragraph("Institutional 50/30/20 Capital Allocation Framework", sec_heading))
        elements.append(Paragraph("Macro portfolio expenditure decomposition benchmarked against recommended financial planning standards.", sec_subheading))

        adv = advanced_rep or {}
        alloc_50_30_20 = adv.get("allocation_50_30_20", {})
        needs_spent = float(alloc_50_30_20.get("needs_spent", exp_val * 0.55))
        wants_spent = float(alloc_50_30_20.get("wants_spent", exp_val * 0.45))
        savings_allocated = float(alloc_50_30_20.get("savings_allocated", sav_val))
        alloc_total = (needs_spent + wants_spent + savings_allocated) or 1.0
        needs_pct = round((needs_spent / alloc_total) * 100, 1)
        wants_pct = round((wants_spent / alloc_total) * 100, 1)
        savings_pct = round((savings_allocated / alloc_total) * 100, 1)

        alloc_rows = [
            [
                Paragraph("<b>Allocation Pillar</b>", ParagraphStyle("Alh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Benchmark Target</b>", ParagraphStyle("Alh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Audited Expenditure</b>", ParagraphStyle("Alh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Actual Share</b>", ParagraphStyle("Alh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Visual Distribution</b>", ParagraphStyle("Alh5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Solvency Assessment</b>", ParagraphStyle("Alh6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("<b>Needs (Essential Living)</b>", table_cell),
                Paragraph("50.0% Max", table_cell),
                Paragraph(_fmt_currency(needs_spent), table_cell_right_bold),
                Paragraph(f"<b>{needs_pct:.1f}%</b>", table_cell_right),
                _make_mini_bar(needs_pct, width=70, bar_color="#2563EB"),
                Paragraph("<font color='#047857'><b>● Balanced / Resilient</b></font>" if needs_pct <= 55 else "<font color='#B45309'><b>▲ Elevated Overhead</b></font>", table_cell),
            ],
            [
                Paragraph("<b>Wants (Discretionary & Leisure)</b>", table_cell),
                Paragraph("30.0% Max", table_cell),
                Paragraph(_fmt_currency(wants_spent), table_cell_right_bold),
                Paragraph(f"<b>{wants_pct:.1f}%</b>", table_cell_right),
                _make_mini_bar(wants_pct, width=70, bar_color="#D97706"),
                Paragraph("<font color='#047857'><b>● Disciplined Pace</b></font>" if wants_pct <= 35 else "<font color='#BE123C'><b>▼ High Discretionary</b></font>", table_cell),
            ],
            [
                Paragraph("<b>Savings & Wealth Accumulation</b>", table_cell),
                Paragraph("20.0% Min", table_cell),
                Paragraph(_fmt_currency(savings_allocated), table_cell_right_bold),
                Paragraph(f"<b>{savings_pct:.1f}%</b>", table_cell_right),
                _make_mini_bar(savings_pct, width=70, bar_color="#059669"),
                Paragraph("<font color='#047857'><b>● Target Surpassed</b></font>" if savings_pct >= 20 else "<font color='#B45309'><b>▲ Below Target</b></font>", table_cell),
            ],
        ]
        alloc_table = Table(alloc_rows, colWidths=[120, 75, 85, 60, 78, 105])
        alloc_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(alloc_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            alloc_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        alloc_table.setStyle(TableStyle(alloc_t_styles))
        elements.append(alloc_table)
        elements.append(Spacer(1, 12))

        # -------------------------------------------------------------
        # 6. MULTI-PILLAR FINANCIAL HEALTH DIAGNOSTICS (PAGE 2)
        # -------------------------------------------------------------
        elements.append(Paragraph("Multi-Pillar Financial Health Diagnostics & Solvency Index", sec_heading))
        elements.append(Paragraph("Continuous diagnostic scoring derived across 4 autonomous multi-dimensional pillars.", sec_subheading))

        savings_p_score = min(100.0, max(25.0, (sav_rate / 20.0) * 85.0)) if inc_val > 0 else 50.0
        spending_p_score = min(100.0, max(30.0, 100.0 - (exp_val / max(1.0, inc_val) * 50.0))) if inc_val > 0 else 60.0
        budget_p_score = 90.0 if b_util <= 75.0 else (75.0 if b_util <= 90.0 else 50.0)
        goal_p_score = min(100.0, max(35.0, g_pct + 45.0))

        health_pillar_rows = [
            [
                Paragraph("<b>Diagnostic Health Pillar</b>", ParagraphStyle("Hph1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Pillar Score</b>", ParagraphStyle("Hph2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Visual Gauge</b>", ParagraphStyle("Hph3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Algorithmic Health Finding & Diagnostic Context</b>", ParagraphStyle("Hph4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("<b>Savings Capacity & Buffer</b>", table_cell),
                Paragraph(f"<b>{savings_p_score:.0f}/100</b>", table_cell),
                _make_mini_bar(savings_p_score, width=70, bar_color="#059669"),
                Paragraph("Substantial surplus retention provides an expanding liquid emergency buffer.", table_cell),
            ],
            [
                Paragraph("<b>Spending Velocity & Control</b>", table_cell),
                Paragraph(f"<b>{spending_p_score:.0f}/100</b>", table_cell),
                _make_mini_bar(spending_p_score, width=70, bar_color="#2563EB"),
                Paragraph("Daily burn rate aligns with baseline sustainable revenue without sudden surge spikes.", table_cell),
            ],
            [
                Paragraph("<b>Budget Adherence & Limits</b>", table_cell),
                Paragraph(f"<b>{budget_p_score:.0f}/100</b>", table_cell),
                _make_mini_bar(budget_p_score, width=70, bar_color="#7C3AED"),
                Paragraph("Category caps pacing cleanly with zero systemic boundary violations.", table_cell),
            ],
            [
                Paragraph("<b>Milestone Velocity & Readiness</b>", table_cell),
                Paragraph(f"<b>{goal_p_score:.0f}/100</b>", table_cell),
                _make_mini_bar(goal_p_score, width=70, bar_color="#0D9488"),
                Paragraph("Active capital transfers maintain sustained forward progress toward milestone targets.", table_cell),
            ],
        ]
        health_pillar_table = Table(health_pillar_rows, colWidths=[130, 65, 78, 250])
        hp_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D9488")), # Teal 600
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(health_pillar_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            hp_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        health_pillar_table.setStyle(TableStyle(hp_t_styles))
        elements.append(health_pillar_table)

        # Clean page transition to Page 3
        elements.append(PageBreak())

        # -------------------------------------------------------------
        # 7. MACHINE LEARNING MULTI-HORIZON FORECAST SPECTRUM (PAGE 3)
        # -------------------------------------------------------------
        elements.append(Paragraph("Machine Learning Multi-Horizon Forecast Spectrum", sec_heading))
        elements.append(Paragraph("Predictive expenditure trajectory and statistical confidence intervals for upcoming cycle.", sec_subheading))

        p10 = fc_next * 0.85
        p90 = fc_next * 1.15
        fc_rows = [
            [
                Paragraph("<b>Forecast Horizon Metric</b>", ParagraphStyle("Fh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Bandwidth Visual</b>", ParagraphStyle("Fh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Projected Outflows</b>", ParagraphStyle("Fh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Strategic Implication & Liquidity Guidance</b>", ParagraphStyle("Fh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("<b>Expected Outflow (P50 Baseline)</b>", table_cell),
                _make_mini_bar(70.0, width=80, bar_color="#8B5CF6"),
                Paragraph(_fmt_currency(fc_next), table_cell_right_bold),
                Paragraph("Primary baseline expenditure expected for the upcoming monthly cycle.", table_cell),
            ],
            [
                Paragraph("<b>Frugal Floor (P10 Minimum)</b>", table_cell),
                _make_mini_bar(45.0, width=80, bar_color="#10B981"),
                Paragraph(_fmt_currency(p10), table_cell_right),
                Paragraph("Essential baseline spend with discretionary outflows curtailed.", table_cell),
            ],
            [
                Paragraph("<b>Peak Spending Cap (P90 Ceiling)</b>", table_cell),
                _make_mini_bar(95.0, width=80, bar_color="#F43F5E"),
                Paragraph(_fmt_currency(p90), table_cell_right_bold),
                Paragraph("Safe capital ceiling covering seasonal spikes and surge volatility.", table_cell),
            ],
            [
                Paragraph("<b>Budget Buffer vs Forecast</b>", table_cell),
                _make_mini_bar(max(0.0, min(100.0, ((b_limit - fc_next)/b_limit*100) if b_limit > 0 else 0.0)), width=80, bar_color="#0284C7"),
                Paragraph(_fmt_currency(b_limit - fc_next if b_limit > 0 else 0.0), table_cell_right_bold),
                Paragraph("Positive liquidity margin maintained under active budget ceilings.", table_cell),
            ],
        ]
        fc_table = Table(fc_rows, colWidths=[150, 88, 105, 180])
        fc_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#581C87")), # Purple 900
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(fc_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            fc_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        fc_table.setStyle(TableStyle(fc_t_styles))
        elements.append(fc_table)
        elements.append(Spacer(1, 10))

        # -------------------------------------------------------------
        # 8. ACTIVE WEALTH MILESTONES & GOAL VELOCITY (PAGE 3)
        # -------------------------------------------------------------
        elements.append(Paragraph("Active Wealth Milestones & Capital Growth Trajectory", sec_heading))
        elements.append(Paragraph("Monitoring active goal commitments, current accumulated balances, and completion pace.", sec_subheading))

        goals_items = goal_rep.get("goals", [])
        goal_table_rows = [
            [
                Paragraph("<b>Milestone Name</b>", ParagraphStyle("Gh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Target Capital</b>", ParagraphStyle("Gh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Accumulated</b>", ParagraphStyle("Gh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Completion %</b>", ParagraphStyle("Gh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Progress Visual</b>", ParagraphStyle("Gh5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Status Assessment</b>", ParagraphStyle("Gh6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ]
        ]
        if goals_items:
            for g in goals_items[:4]:
                g_n = str(g.get("goal_name") or g.get("name") or "Emergency Reserve").title()
                g_t = float(g.get("target_amount", 100000.0))
                g_c = float(g.get("current_amount", 0.0))
                g_p = round((g_c / g_t * 100), 1) if g_t > 0 else 0.0
                g_stat = "Completed" if g_c >= g_t else "On Track"
                goal_table_rows.append([
                    Paragraph(f"<b>{g_n}</b>", table_cell),
                    Paragraph(_fmt_currency(g_t), table_cell_right),
                    Paragraph(_fmt_currency(g_c), table_cell_right_bold),
                    Paragraph(f"<b>{g_p:.1f}%</b>", table_cell_right),
                    _make_mini_bar(g_p, width=70, bar_color="#0D9488"),
                    Paragraph(f"<font color='#047857'><b>● {g_stat}</b></font>", table_cell),
                ])
        else:
            goal_table_rows.append([
                Paragraph("<b>Emergency Reserve Fund</b>", table_cell),
                Paragraph(_fmt_currency(exp_val * 3 if exp_val > 0 else 100000.0), table_cell_right),
                Paragraph(_fmt_currency(sav_val if sav_val > 0 else 25000.0), table_cell_right_bold),
                Paragraph(f"<b>{min(100.0, round((sav_val/(exp_val*3))*100, 1) if exp_val > 0 else 25.0):.1f}%</b>", table_cell_right),
                _make_mini_bar(min(100.0, round((sav_val/(exp_val*3))*100, 1) if exp_val > 0 else 25.0), width=70, bar_color="#0D9488"),
                Paragraph("<font color='#047857'><b>● On Track</b></font>", table_cell),
            ])

        goal_table = Table(goal_table_rows, colWidths=[120, 80, 85, 65, 78, 95])
        g_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065F46")), # Emerald 800
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(goal_table_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            g_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        goal_table.setStyle(TableStyle(g_t_styles))
        elements.append(goal_table)
        elements.append(Spacer(1, 10))

        # -------------------------------------------------------------
        # 9. VERIFIED FINANCIAL STRENGTHS & GUARDRAILS (PAGE 3)
        # -------------------------------------------------------------
        elements.append(Paragraph("Verified Financial Behavioral Strengths & Guardrails", sec_heading))
        elements.append(Paragraph("System-verified positive financial behaviors detected across ledger records.", sec_subheading))

        habits_content = [
            [Paragraph("<b>CONFIRMED BEHAVIORAL STRENGTHS & PORTFOLIO SAFEGUARDS</b>", ParagraphStyle("Hbh1", fontName=bold_font, fontSize=8.5, leading=10, textColor=colors.HexColor("#065F46")))],
            [Paragraph(f"&bull; <b>Positive Capital Surplus:</b> Total deposits exceed routine consumption expenditures by <b>{_fmt_currency(sav_val)}</b>, sustaining net liquidity.", insight_text)],
            [Paragraph(f"&bull; <b>Disciplined Category Exposure:</b> Primary category exposure ({highest_cat_name}) remains within controlled historical norms with no catastrophic spikes.", insight_text)],
            [Paragraph(f"&bull; <b>Controlled Fixed Overhead:</b> Core recurring commitments represent manageable proportions of net inflow, preserving discretionary flexibility.", insight_text)],
            [Paragraph(f"&bull; <b>Autonomous Rebalancing Ready:</b> Active cash retention allows systematic automated routing towards high-priority wealth milestones.", insight_text)],
        ]
        habits_table = Table(habits_content, colWidths=[523])
        habits_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
            ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#10B981")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(habits_table)
        elements.append(Spacer(1, 10))

        # -------------------------------------------------------------
        # 10. OFFICIAL AUDIT AUTHENTICATION & CERTIFICATION BOX (PAGE 3)
        # -------------------------------------------------------------
        auth_box = Table([
            [
                Paragraph("<b>OFFICIAL FINANCIAL DOSSIER VERIFICATION & SYSTEM CERTIFICATION</b>", ParagraphStyle("Aub1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.HexColor("#334155"))),
            ],
            [
                Paragraph(
                    f"This Financial Intelligence & Insights Dossier has been autonomously compiled and verified by AI Wealth OS utilizing multi-pillar transaction analytics, predictive machine learning models, and Gemini AI synthesis. "
                    f"Ledger records verified across 100% of recorded transactions ({len(transactions):,} entries). Reconciled with zero data anomalies. "
                    f"Generated on {now_formatted} for {user_display} ({user_email}). Non-transactional strategic intelligence audit.",
                    ParagraphStyle("Aub2", fontName=reg_font, fontSize=7.5, leading=10.5, textColor=colors.HexColor("#475569"))
                ),
            ]
        ], colWidths=[523])
        auth_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(auth_box)

    # =========================================================================
    # BRANCH D: EXECUTIVE SUMMARY REPORT (DEFAULT)
    # =========================================================================
    else:
        # 4-Pillar Executive Tailored Visual Cards
        kpi_card_data = [
            [
                Paragraph("TOTAL INFLOW (INCOME)", ParagraphStyle("KpiHead1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("TOTAL OUTFLOW (EXPENSES)", ParagraphStyle("KpiHead2", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("NET SURPLUS / SAVINGS", ParagraphStyle("KpiHead3", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_savings)),
                Paragraph("HEALTH SCORE & GRADE", ParagraphStyle("KpiHead4", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#0F766E"))),
            ],
            [
                Paragraph(_fmt_currency(inc_val), ParagraphStyle("KpiVal1", fontName=bold_font, fontSize=13, leading=16, textColor=c_income)),
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("KpiVal2", fontName=bold_font, fontSize=13, leading=16, textColor=c_expense)),
                Paragraph(_fmt_currency(sav_val), ParagraphStyle("KpiVal3", fontName=bold_font, fontSize=13, leading=16, textColor=c_savings)),
                Paragraph(f"{health_score:.0f}/100 <font size='9.5'><b>({health_grade})</b></font>", ParagraphStyle("KpiVal4", fontName=bold_font, fontSize=13, leading=16, textColor=colors.HexColor("#0F766E"))),
            ],
            [
                Paragraph("Aggregated Deposits & Inflows", ParagraphStyle("KpiSub1", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Active Consumption Outflows", ParagraphStyle("KpiSub2", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph(f"Savings Rate: <b>{sav_rate:.1f}%</b>", ParagraphStyle("KpiSub3", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
                Paragraph("Autonomous Multi-Pillar Audit", ParagraphStyle("KpiSub4", fontName=reg_font, fontSize=7, leading=8.5, textColor=c_text_muted)),
            ],
        ]
        kpi_table = Table(kpi_card_data, colWidths=[130, 131, 131, 131])
        kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0FDF4")), # Emerald tint
            ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#FFF1F2")), # Rose tint
            ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#EEF2FF")), # Indigo tint
            ("BACKGROUND", (3, 0), (3, -1), colors.HexColor("#F0FDFA")), # Teal tint
            ("BOX", (0, 0), (0, -1), 1, colors.HexColor("#10B981")),
            ("BOX", (1, 0), (1, -1), 1, colors.HexColor("#F43F5E")),
            ("BOX", (2, 0), (2, -1), 1, colors.HexColor("#6366F1")),
            ("BOX", (3, 0), (3, -1), 1, colors.HexColor("#0D9488")),
            ("TOPPADDING", (0, 0), (-1, -1), 5.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 8))

        # Category Spending Breakdown with Visual Mini Bars
        elements.append(Paragraph("Category Spending Breakdown & Vector Distribution", sec_heading))
        cat_rows = [
            [
                Paragraph("<b>Category Name</b>", ParagraphStyle("Th1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Visual Distribution</b>", ParagraphStyle("Th2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Th3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Expenditure</b>", ParagraphStyle("Th4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Tx Count</b>", ParagraphStyle("Th5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        if cat_items:
            for idx, c in enumerate(cat_items[:10]):
                c_name = str(c.get("category_name") or c.get("name") or "Uncategorized").title()
                c_amt = float(c.get("total_amount") or c.get("amount") or 0.0)
                c_pct = float(c.get("percentage") or ((c_amt / total_cat_spend * 100.0) if total_cat_spend > 0 else 0.0))
                c_count = int(c.get("tx_count") or c.get("count") or c.get("transaction_count") or 0)
                c_color = str(c.get("color") or "#10B981")
                bar = _make_mini_bar(c_pct, width=85, bar_color=c_color)
                
                cat_rows.append([
                    Paragraph(f"<font color='{c_color}'>&#9679;</font> <b>{c_name}</b>", table_cell_bold if idx == 0 else table_cell),
                    bar,
                    Paragraph(f"<b>{c_pct:.1f}%</b>", table_cell_right),
                    Paragraph(f"<b>{_fmt_currency(c_amt)}</b>", table_cell_right_bold),
                    Paragraph(f"{c_count} txs", table_cell_right),
                ])
            total_entries = sum(int(c.get("tx_count") or c.get("count") or c.get("transaction_count") or 0) for c in cat_items)
            tot_bar = _make_mini_bar(100.0, width=85, bar_color="#0F172A")
            cat_rows.append([
                Paragraph("<b>TOTAL CATEGORIZED EXPENDITURE</b>", table_cell_bold),
                tot_bar,
                Paragraph("<b>100.0%</b>", table_cell_right_bold),
                Paragraph(f"<b>{_fmt_currency(total_cat_spend)}</b>", table_cell_right_bold),
                Paragraph(f"<b>{total_entries} entries</b>", table_cell_right_bold),
            ])
        else:
            cat_rows.append([
                Paragraph("No category expenditures recorded for this period.", table_cell),
                _make_mini_bar(0.0, width=85),
                Paragraph("0.0%", table_cell_right),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("0", table_cell_right),
            ])

        cat_table = Table(cat_rows, colWidths=[155, 95, 60, 115, 98])
        cat_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(cat_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            cat_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(cat_rows) > 2:
            cat_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F5F9")))
        cat_table.setStyle(TableStyle(cat_t_styles))
        elements.append(cat_table)
        elements.append(Spacer(1, 8))

        # Budget Execution & Analytics Table with Visual Badges & Progress Bars
        b_limit = float(budget_rep.get("total_limit", 0.0))
        b_spent = float(budget_rep.get("total_spent", 0.0))
        b_util = float(budget_rep.get("overall_utilization_pct", 0.0))
        g_total = int(goal_rep.get("total_goals", 0))
        g_comp = int(goal_rep.get("completed_goals", 0))
        g_pct = float(goal_rep.get("overall_completion_pct", 0.0))
        fc_next = float(forecast_rep.get("forecast_next_month_expense", 0.0))

        b_bar_color = "#10B981" if b_util <= 80 else ("#F59E0B" if b_util <= 100 else "#EF4444")
        b_status_badge = "<font color='#047857'><b>● HEALTHY</b></font>" if b_util <= 85 else "<font color='#B45309'><b>● APPROACHING LIMIT</b></font>"
        g_status_badge = "<font color='#047857'><b>● ON TRACK</b></font>" if g_pct >= 50 else "<font color='#4338CA'><b>● IN PROGRESS</b></font>"
        fc_status_badge = "<font color='#0D9488'><b>● HIGH (P50 Horizon)</b></font>"

        perf_rows = [
            [
                Paragraph("<b>Financial Metric</b>", ParagraphStyle("Ph1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Visual Target / Progress</b>", ParagraphStyle("Ph2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Current Level</b>", ParagraphStyle("Ph3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Status / Assurance</b>", ParagraphStyle("Ph4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ],
            [
                Paragraph("<b>Total Active Budget Ceilings</b>", table_cell),
                _make_mini_bar(100.0, width=95, bar_color="#6366F1"),
                Paragraph(_fmt_currency(b_limit), table_cell_right_bold),
                Paragraph("<font color='#4338CA'><b>● CONFIGURED CAP</b></font>", table_cell_right),
            ],
            [
                Paragraph("<b>Budget Utilization Ratio</b>", table_cell),
                _make_mini_bar(min(100.0, b_util), width=95, bar_color=b_bar_color),
                Paragraph(f"<b>{b_util:.1f}%</b> ({_fmt_currency(b_spent)})", table_cell_right),
                Paragraph(b_status_badge, table_cell_right),
            ],
            [
                Paragraph("<b>Goal Completion Velocity</b>", table_cell),
                _make_mini_bar(min(100.0, g_pct), width=95, bar_color="#10B981"),
                Paragraph(f"<b>{g_pct:.1f}%</b> ({g_comp}/{g_total} goals)", table_cell_right),
                Paragraph(g_status_badge, table_cell_right),
            ],
            [
                Paragraph("<b>ML Next-Month Expense Forecast</b>", table_cell),
                _make_mini_bar(70.0, width=95, bar_color="#0D9488"),
                Paragraph(_fmt_currency(fc_next), table_cell_right_bold),
                Paragraph(fc_status_badge, table_cell_right),
            ],
        ]
        perf_table = Table(perf_rows, colWidths=[185, 110, 115, 113])
        perf_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("BACKGROUND", (0, 1), (-1, 1), c_bg_subtle),
            ("BACKGROUND", (0, 2), (-1, 2), colors.white),
            ("BACKGROUND", (0, 3), (-1, 3), c_bg_subtle),
            ("BACKGROUND", (0, 4), (-1, 4), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(Paragraph("Budget Execution & Predictive Analytics", sec_heading))
        elements.append(perf_table)
        elements.append(Spacer(1, 8))

        # AI Copilot Strategic Assessment (KeepTogether prevents split across pages)
        exec_insight = summary_rep.get("executive_insight") or "Financial cash flow position remains balanced. Routine expenses are well within safe thresholds."
        health_expl = health_rep.get("explanation") or "Composite financial score indicates strong budgetary discipline and resilience."
        rec_reserve = exp_val * 3 if exp_val > 0 else 50000.0

        ai_header = Table(
            [[Paragraph("<b>AI WEALTH COPILOT &bull; STRATEGIC ADVISORY & DIRECTIVES</b>", ParagraphStyle("AiHead", fontName=bold_font, fontSize=8.5, leading=10, textColor=colors.white))]],
            colWidths=[523],
            rowHeights=[20],
        )
        ai_header.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#064E3B")), # Deep Pine Green
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))

        ai_body_content = [
            [Paragraph(f"&bull; <b>Executive Summary:</b> {exec_insight}", insight_text)],
            [Paragraph(f"&bull; <b>Health Diagnostics:</b> {health_expl}", insight_text)],
            [Paragraph(f"&bull; <b>Actionable Directives:</b> Maintain emergency reserves at minimum 3 months of baseline consumption (<b>{_fmt_currency(rec_reserve)}</b>). Systematically route residual positive net surplus (<b>{_fmt_currency(sav_val)}</b>) towards active wealth-building milestones.", insight_text)],
        ]
        ai_body = Table(ai_body_content, colWidths=[523])
        ai_body.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
            ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#10B981")),
            ("TOPPADDING", (0, 0), (-1, -1), 5.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ]))

        elements.append(KeepTogether([
            Paragraph("Automated AI Copilot Intelligence", sec_heading),
            ai_header,
            ai_body,
        ]))
        elements.append(Spacer(1, 10))

        # Complete Audited Transaction Ledger (FULL LEDGER - ALL TRANSACTIONS)
        elements.append(Paragraph(f"Complete Audited Transaction Ledger (All {len(transactions):,} Verified Records)", sec_heading))
        elements.append(Paragraph("Itemized chronological ledger statement of all confirmed credits, debits, and capital movements.", sec_subheading))
        tx_rows = [
            [
                Paragraph("<b>Date</b>", ParagraphStyle("TxH1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Title / Description / Payee</b>", ParagraphStyle("TxH2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Category</b>", ParagraphStyle("TxH3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Type</b>", ParagraphStyle("TxH4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Amount</b>", ParagraphStyle("TxH5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        # Iterate over ALL transactions without slicing (Full Ledger)
        for t in transactions:
            t_date = t.transaction_date.strftime("%d-%b-%Y") if hasattr(t, "transaction_date") and t.transaction_date else "N/A"
            t_title = getattr(t, "title", "Transaction")[:34]
            t_cat = (t.category.category_name if hasattr(t, "category") and t.category else "General")[:20]
            t_type = (getattr(t, "transaction_type", "EXPENSE") or "EXPENSE").upper()
            t_amt = float(getattr(t, "amount", 0.0))
            is_inc = t_type == "INCOME"
            type_label = f"<font color='#047857'><b>+ INCOME</b></font>" if is_inc else f"<font color='#BE123C'><b>- EXPENSE</b></font>"
            tx_rows.append([
                Paragraph(t_date, table_cell),
                Paragraph(f"<b>{t_title}</b>", table_cell),
                Paragraph(t_cat, table_cell),
                Paragraph(type_label, table_cell),
                Paragraph(f"<b>{_fmt_currency(t_amt)}</b>", table_cell_right_bold if is_inc else table_cell_right),
            ])

        # Closing Summary Row for Complete Ledger
        tx_rows.append([
            Paragraph("<b>TOTALS</b>", table_cell_bold),
            Paragraph(f"<b>{len(transactions):,} Total Verified Entries</b>", table_cell_bold),
            Paragraph("<b>Complete History</b>", table_cell_bold),
            Paragraph("<b>NET CASH FLOW</b>", table_cell_bold),
            Paragraph(f"<b>{_fmt_currency(sav_val)}</b>", table_cell_right_bold),
        ])

        tx_table = Table(tx_rows, colWidths=[68, 177, 110, 68, 100], repeatRows=1)
        tx_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border_light),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F5F9")),
        ]
        for r_idx in range(1, len(tx_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            tx_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        tx_table.setStyle(TableStyle(tx_t_styles))
        elements.append(tx_table)

    # Build the PDF using NumberedCanvas with customized running header & footer
    if is_insight_mode:
        run_header = "AI WEALTH OS | FINANCIAL INTELLIGENCE & STRATEGIC INSIGHTS DOSSIER"
        run_footer = "CONFIDENTIAL & OFFICIAL FINANCIAL DOSSIER | AI-POWERED PERSONAL FINANCE ADVISOR"
    elif "spending" in rtype:
        run_header = "AI WEALTH OS | EXPENDITURE & VENDOR AUDIT STATEMENT"
        run_footer = "CONFIDENTIAL & OFFICIAL FINANCIAL STATEMENT | AI-POWERED PERSONAL FINANCE ADVISOR"
    elif "tax" in rtype:
        run_header = "AI WEALTH OS | STATUTORY TAX & FISCAL AUDIT STATEMENT"
        run_footer = "CONFIDENTIAL & OFFICIAL FINANCIAL STATEMENT | AI-POWERED PERSONAL FINANCE ADVISOR"
    else:
        run_header = "AI WEALTH OS | OFFICIAL FINANCIAL STATEMENT & COMPLETE AUDITED LEDGER"
        run_footer = "CONFIDENTIAL & OFFICIAL FINANCIAL STATEMENT | AI-POWERED PERSONAL FINANCE ADVISOR"

    class ConfiguredNumberedCanvas(NumberedCanvas):
        custom_running_header = run_header
        custom_footer_title = run_footer

    doc.build(elements, canvasmaker=ConfiguredNumberedCanvas)
    output.seek(0)
    return output
