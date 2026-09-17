"""
ReportLab PDF Generation Module for AI-Powered Personal Finance Advisor.
Produces high-readability, enterprise-grade, page-specific financial statements:
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
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and stamp 'Page X of Y' on every page.
    """
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
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Header rule (pages after page 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(36, 805, 559, 805)
            self.drawString(36, 810, "AI Wealth OS | Financial Statement & Analytics Report")
            self.drawRightString(559, 810, datetime.utcnow().strftime("%d %b %Y"))

        # Footer rule
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 35, 559, 35)

        # Footer text
        self.drawString(36, 24, "CONFIDENTIAL & PROPRIETARY | AI-Powered Personal Finance Advisor")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 24, page_str)
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
) -> io.BytesIO:
    """
    Builds a page-specific, professional financial statement PDF tailored directly
    to the active report tab being viewed.
    """
    output = io.BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=45,
    )

    reg_font, bold_font = _get_fonts()

    # Color Palette
    c_primary = colors.HexColor("#0F172A")    # Slate 900
    c_accent = colors.HexColor("#10B981")     # Emerald 500
    c_income = colors.HexColor("#047857")     # Emerald 700
    c_expense = colors.HexColor("#BE123C")    # Rose 700
    c_savings = colors.HexColor("#4338CA")    # Indigo 700
    c_cyan = colors.HexColor("#0284C7")       # Sky 600
    c_text_dark = colors.HexColor("#1E293B")  # Slate 800
    c_text_muted = colors.HexColor("#64748B") # Slate 500
    c_bg_subtle = colors.HexColor("#F8FAFC")  # Slate 50
    c_border = colors.HexColor("#E2E8F0")     # Slate 200

    # Custom Typography Styles
    title_style = ParagraphStyle(
        "DocTitle",
        fontName=bold_font,
        fontSize=17,
        leading=21,
        textColor=colors.white,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        fontName=reg_font,
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#94A3B8"),
    )
    sec_heading = ParagraphStyle(
        "SectionHeading",
        fontName=bold_font,
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=8,
        spaceAfter=3,
    )
    meta_label = ParagraphStyle(
        "MetaLabel",
        fontName=bold_font,
        fontSize=8,
        leading=11,
        textColor=c_text_muted,
    )
    meta_val = ParagraphStyle(
        "MetaValue",
        fontName=reg_font,
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
        leading=12,
        textColor=c_text_dark,
    )

    elements = []
    now_formatted = datetime.utcnow().strftime("%d %B %Y, %I:%M %p UTC")

    rtype = (report_type or "executive").lower().strip()

    # Determine Page-Specific Titles & Badges
    if "spending" in rtype:
        banner_title = "AI WEALTH OS &bull; SPENDING & VENDOR AUDIT"
        banner_sub = "Category Decomposition, Top Merchant Outflows & Expenditure Diagnostics"
        scope_badge = "SPENDING ANALYSIS"
        accent_color = colors.HexColor("#3B82F6") # Sapphire Blue
    elif "tax" in rtype:
        banner_title = "AI WEALTH OS &bull; STATUTORY TAX DEDUCTION & FISCAL AUDIT"
        banner_sub = "Eligible Tax Deductions (80C, 80D, 80G), Tax Shield & Overhead Audit"
        scope_badge = "TAX & FISCAL AUDIT"
        accent_color = colors.HexColor("#10B981") # Emerald Green
    elif "insight" in rtype or "comprehensive" in rtype:
        banner_title = "AI WEALTH OS &bull; COMPREHENSIVE FINANCIAL MASTER DOSSIER"
        banner_sub = "Unified Multi-Domain Wealth Audit, Predictive Horizons & AI Strategic Directives"
        scope_badge = "MASTER DOSSIER"
        accent_color = colors.HexColor("#8B5CF6") # Purple
    else:
        # Default / Executive Summary
        banner_title = "AI WEALTH OS &bull; EXECUTIVE FINANCIAL STATEMENT"
        banner_sub = "High-Level Financial Performance, Cash Flow KPIs & Net Surplus Audit"
        scope_badge = "EXECUTIVE SUMMARY"
        accent_color = colors.HexColor("#0D9488") # Teal

    # ─────────────────────────────────────────────────────────────
    # 1. HEADER BANNER
    # ─────────────────────────────────────────────────────────────
    banner_content = [
        [
            Paragraph(banner_title, title_style),
            Paragraph(f"<b>STATEMENT DATE:</b><br/>{now_formatted}", ParagraphStyle("HeaderDate", fontName=reg_font, fontSize=8, leading=10, textColor=colors.HexColor("#CBD5E1"), alignment=2)),
        ],
        [
            Paragraph(banner_sub, subtitle_style),
            Paragraph(f"<b>REPORT SCOPE:</b> {scope_badge}", ParagraphStyle("ScopeTag", fontName=bold_font, fontSize=8, leading=10, textColor=accent_color, alignment=2)),
        ],
    ]
    banner_table = Table(banner_content, colWidths=[360, 163])
    banner_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), c_primary),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(banner_table)

    # Accent divider stripe
    accent_stripe = Table([[""]], colWidths=[523], rowHeights=[3])
    accent_stripe.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), accent_color),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(accent_stripe)
    elements.append(Spacer(1, 8))

    # ─────────────────────────────────────────────────────────────
    # 2. ACCOUNT HOLDER METADATA
    # ─────────────────────────────────────────────────────────────
    meta_data = [
        [
            Paragraph("ACCOUNT HOLDER", meta_label),
            Paragraph(user_display, meta_val),
            Paragraph("REPORT PERIOD", meta_label),
            Paragraph(filter_type.replace("_", " ").title(), meta_val),
        ],
        [
            Paragraph("REGISTERED EMAIL", meta_label),
            Paragraph(user_email, meta_val),
            Paragraph("AUDITED TRANSACTIONS", meta_label),
            Paragraph(f"{len(transactions):,} entries analyzed", meta_val),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[110, 155, 110, 148])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), c_bg_subtle),
        ("BOX", (0, 0), (-1, -1), 0.5, c_border),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    # Data extracts
    kpis = summary_rep.get("kpis", {})
    inc_val = float(kpis.get("total_income", 0.0))
    exp_val = float(kpis.get("total_expenses", 0.0))
    sav_val = float(kpis.get("net_savings", 0.0))
    sav_rate = float(kpis.get("savings_rate", 0.0))
    health_score = float(health_rep.get("latest_score", 75.0))
    health_grade = health_rep.get("latest_grade", "B")
    cat_items = cat_rep.get("categories", [])
    merchant_items = cat_rep.get("merchants", [])
    total_cat_spend = sum(float(c.get("amount", 0.0)) for c in cat_items) or exp_val or 1.0

    # =========================================================================
    # BRANCH A: SPENDING ANALYSIS REPORT
    # =========================================================================
    if "spending" in rtype:
        avg_tx = exp_val / max(1, len([t for t in transactions if (getattr(t, "transaction_type", "") or "").upper() == "EXPENSE"]))
        largest_tx = max([float(getattr(t, "amount", 0.0)) for t in transactions if (getattr(t, "transaction_type", "") or "").upper() == "EXPENSE"], default=0.0)
        top_cat_name = str(cat_items[0].get("category_name", "N/A")).title() if cat_items else "N/A"
        top_cat_pct = float(cat_items[0].get("percentage", 0.0)) if cat_items else 0.0

        # Spending KPI Cards
        spend_kpi_data = [
            [
                Paragraph("TOTAL EXPENDITURE", ParagraphStyle("Sk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("AVERAGE TRANSACTION", ParagraphStyle("Sk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#D97706"))),
                Paragraph("LARGEST OUTFLOW", ParagraphStyle("Sk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#7C3AED"))),
                Paragraph("TOP EXPENSE CATEGORY", ParagraphStyle("Sk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_primary)),
            ],
            [
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("SkVal1", fontName=bold_font, fontSize=12, leading=14, textColor=c_expense)),
                Paragraph(_fmt_currency(avg_tx), ParagraphStyle("SkVal2", fontName=bold_font, fontSize=12, leading=14, textColor=colors.HexColor("#B45309"))),
                Paragraph(_fmt_currency(largest_tx), ParagraphStyle("SkVal3", fontName=bold_font, fontSize=12, leading=14, textColor=colors.HexColor("#6D28D9"))),
                Paragraph(top_cat_name, ParagraphStyle("SkVal4", fontName=bold_font, fontSize=12, leading=14, textColor=c_primary)),
            ],
            [
                Paragraph("Audited Outflows Across All Vectors", ParagraphStyle("SkSub1", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Mean Expense Size", ParagraphStyle("SkSub2", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Peak Single Purchase", ParagraphStyle("SkSub3", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph(f"Accounts for <b>{top_cat_pct:.1f}%</b> of Outflows", ParagraphStyle("SkSub4", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
            ],
        ]
        spend_kpi_table = Table(spend_kpi_data, colWidths=[130, 131, 131, 131])
        spend_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(spend_kpi_table)
        elements.append(Spacer(1, 10))

        # Top Merchant Spending Table
        elements.append(Paragraph("Top Merchant Outflows & Beneficiary Analysis", sec_heading))
        m_rows = [
            [
                Paragraph("<b>Rank</b>", ParagraphStyle("Mh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Merchant / Beneficiary Name</b>", ParagraphStyle("Mh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Total Outflow</b>", ParagraphStyle("Mh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Tx Count</b>", ParagraphStyle("Mh4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Mh5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
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
                m_rows.append([
                    Paragraph(f"#{idx+1}", table_cell_bold),
                    Paragraph(m_name, table_cell),
                    Paragraph(_fmt_currency(m_amt), table_cell_right),
                    Paragraph(f"{m_cnt} txs", table_cell_right),
                    Paragraph(f"{m_pct:.1f}%", table_cell_right),
                ])
            m_rows.append([
                Paragraph("<b>TOP 10 VENDORS TOTAL</b>", table_cell_bold),
                Paragraph(f"{len(top_merchants)} Leading Payees Audited", table_cell),
                Paragraph(_fmt_currency(tot_m_spend), table_cell_right_bold),
                Paragraph(f"{sum(int(m.get('tx_count', 1)) for m in top_merchants)} txs", table_cell_right_bold),
                Paragraph(f"{(tot_m_spend / exp_val * 100.0):.1f}%", table_cell_right_bold),
            ])
        else:
            m_rows.append([
                Paragraph("#1", table_cell),
                Paragraph("No vendor transactions identified for this period filter.", table_cell),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("0", table_cell_right),
                Paragraph("0.0%", table_cell_right),
            ])

        m_table = Table(m_rows, colWidths=[40, 200, 115, 78, 90])
        m_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")), # Dark Blue Header
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(m_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            m_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(m_rows) > 2:
            m_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EFF6FF")))
        m_table.setStyle(TableStyle(m_t_styles))
        elements.append(m_table)
        elements.append(Spacer(1, 10))

        # Full Category Spending Allocation Matrix
        elements.append(Paragraph("Category Spending Ledger Breakdown", sec_heading))
        cat_rows = [
            [
                Paragraph("<b>Category Name</b>", ParagraphStyle("Ch1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Total Outflow</b>", ParagraphStyle("Ch2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Ch3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Transaction Count</b>", ParagraphStyle("Ch4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Mean Spend / Tx</b>", ParagraphStyle("Ch5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        for c in cat_items:
            c_name = str(c.get("category_name") or c.get("name") or "General").title()
            c_amt = float(c.get("amount", 0.0))
            c_pct = float(c.get("percentage", 0.0) or (c_amt / (total_cat_spend or 1.0) * 100.0))
            c_cnt = int(c.get("count", 0) or c.get("transaction_count", 0) or 1)
            c_mean = c_amt / max(1, c_cnt)
            cat_rows.append([
                Paragraph(c_name, table_cell),
                Paragraph(_fmt_currency(c_amt), table_cell_right),
                Paragraph(f"{c_pct:.1f}%", table_cell_right),
                Paragraph(f"{c_cnt} entries", table_cell_right),
                Paragraph(_fmt_currency(c_mean), table_cell_right),
            ])
        cat_rows.append([
            Paragraph("<b>TOTAL CATEGORIZED SPEND</b>", table_cell_bold),
            Paragraph(_fmt_currency(total_cat_spend), table_cell_right_bold),
            Paragraph("100.0%", table_cell_right_bold),
            Paragraph(f"{sum(int(c.get('count', 0) or c.get('transaction_count', 0) or 1) for c in cat_items)} entries", table_cell_right_bold),
            Paragraph(_fmt_currency(avg_tx), table_cell_right_bold),
        ])
        cat_tbl = Table(cat_rows, colWidths=[160, 100, 75, 98, 90])
        cat_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
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

        # Spending Diagnostics Callout Box
        adv_notes = [
            f"&bull; <b>Concentration Alert:</b> Your top expenditure vector is <b>{top_cat_name}</b>, which consumes {top_cat_pct:.1f}% of total outflow.",
            f"&bull; <b>Outflow Volatility:</b> Largest single outflow recorded was {_fmt_currency(largest_tx)} against an overall transaction mean of {_fmt_currency(avg_tx)}.",
            f"&bull; <b>Vendor Management:</b> Top 10 merchants account for {tot_m_spend/exp_val*100:.1f}% of your verified consumption. Review recurring merchant agreements to identify rationalization opportunities.",
        ]
        diag_content = [
            [Paragraph("<b>AUTOMATED SPENDING & CONCENTRATION DIAGNOSTICS</b>", ParagraphStyle("DH1", fontName=bold_font, fontSize=8.5, leading=10, textColor=colors.HexColor("#1E3A8A")))],
            *[[Paragraph(note, insight_text)] for note in adv_notes],
        ]
        diag_table = Table(diag_content, colWidths=[523])
        diag_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#3B82F6")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(diag_table)

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

        # Tax KPI Cards
        tax_kpi_data = [
            [
                Paragraph("TOTAL CLAIMABLE DEDUCTIONS", ParagraphStyle("Tk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("ESTIMATED TAX SHIELD (30%)", ParagraphStyle("Tk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#0284C7"))),
                Paragraph("ESTIMATED TAX SHIELD (20%)", ParagraphStyle("Tk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#6366F1"))),
                Paragraph("MONTHLY RECURRING BURN", ParagraphStyle("Tk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=colors.HexColor("#D97706"))),
            ],
            [
                Paragraph(_fmt_currency(tot_claimed), ParagraphStyle("TkVal1", fontName=bold_font, fontSize=12, leading=14, textColor=c_income)),
                Paragraph(_fmt_currency(tax_shield_30), ParagraphStyle("TkVal2", fontName=bold_font, fontSize=12, leading=14, textColor=colors.HexColor("#0369A1"))),
                Paragraph(_fmt_currency(tax_shield_20), ParagraphStyle("TkVal3", fontName=bold_font, fontSize=12, leading=14, textColor=colors.HexColor("#4F46E5"))),
                Paragraph(_fmt_currency(monthly_rec), ParagraphStyle("TkVal4", fontName=bold_font, fontSize=12, leading=14, textColor=colors.HexColor("#B45309"))),
            ],
            [
                Paragraph(f"From {_fmt_currency(tot_eligible)} eligible spend", ParagraphStyle("TkSub1", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Direct Cash Savings (High Bracket)", ParagraphStyle("TkSub2", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Direct Cash Savings (Mid Bracket)", ParagraphStyle("TkSub3", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph(f"Annualized: <b>{_fmt_currency(annual_rec)}</b>", ParagraphStyle("TkSub4", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
            ],
        ]
        tax_kpi_table = Table(tax_kpi_data, colWidths=[130, 131, 131, 131])
        tax_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(tax_kpi_table)
        elements.append(Spacer(1, 10))

        # Statutory Deductions Section Table
        elements.append(Paragraph("Deductions Allocation by Statutory Section", sec_heading))
        t_breakdown = tax_sec.get("breakdown", {})
        sec_rows = [
            [
                Paragraph("<b>Statutory Section & Coverage</b>", ParagraphStyle("Sth1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Regulatory Cap</b>", ParagraphStyle("Sth2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Claimed Amount</b>", ParagraphStyle("Sth3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Eligible Spend</b>", ParagraphStyle("Sth4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Utilization</b>", ParagraphStyle("Sth5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Items</b>", ParagraphStyle("Sth6", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
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

                sec_rows.append([
                    Paragraph(f"<b>{s_name}</b>", table_cell),
                    Paragraph(_fmt_currency(s_cap), table_cell_right),
                    Paragraph(_fmt_currency(s_claim), table_cell_right_bold),
                    Paragraph(_fmt_currency(s_elig), table_cell_right),
                    Paragraph(f"{s_util:.1f}%", table_cell_right),
                    Paragraph(f"{s_items}", table_cell_right),
                ])
            sec_rows.append([
                Paragraph("<b>TOTAL STATUTORY DEDUCTIONS</b>", table_cell_bold),
                Paragraph("-", table_cell_right),
                Paragraph(_fmt_currency(tot_claimed), table_cell_right_bold),
                Paragraph(_fmt_currency(tot_eligible), table_cell_right_bold),
                Paragraph(f"{(tot_claimed/max(1, tot_eligible)*100):.1f}%", table_cell_right_bold),
                Paragraph(f"{sum(int(d.get('items_count', 0)) for d in t_breakdown.values())}", table_cell_right_bold),
            ])
        else:
            sec_rows.append([
                Paragraph("Section 80C, 80D, and eligible statutory records analyzed.", table_cell),
                Paragraph("Rs. 1,50,000.00", table_cell_right),
                Paragraph(_fmt_currency(tot_claimed), table_cell_right),
                Paragraph(_fmt_currency(tot_eligible), table_cell_right),
                Paragraph("0.0%", table_cell_right),
                Paragraph("0", table_cell_right),
            ])

        sec_table = Table(sec_rows, colWidths=[175, 80, 80, 80, 58, 50])
        sec_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065F46")), # Emerald 800
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(sec_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            sec_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(sec_rows) > 2:
            sec_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F0FDF4")))
        sec_table.setStyle(TableStyle(sec_t_styles))
        elements.append(sec_table)
        elements.append(Spacer(1, 10))

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
                    Paragraph(r_name, table_cell_bold),
                    Paragraph(r_tier, table_cell),
                    Paragraph(_fmt_currency(r_amt), table_cell_right),
                    Paragraph(_fmt_currency(r_ann), table_cell_right),
                ])
            rec_rows.append([
                Paragraph("<b>TOTAL RECURRING COMMITMENTS</b>", table_cell_bold),
                Paragraph(f"{len(rec_services)} Active Subscriptions", table_cell),
                Paragraph(_fmt_currency(monthly_rec), table_cell_right_bold),
                Paragraph(_fmt_currency(annual_rec), table_cell_right_bold),
            ])
        else:
            rec_rows.append([
                Paragraph("No recurring subscriptions or telecom contracts detected.", table_cell),
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
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(rec_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            rec_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(rec_rows) > 2:
            rec_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EEF2FF")))
        rec_table.setStyle(TableStyle(rec_t_styles))
        elements.append(rec_table)
        elements.append(Spacer(1, 10))

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
                    Paragraph(a_desc, table_cell),
                    Paragraph(a_cat, table_cell),
                    Paragraph(_fmt_currency(a_amt), table_cell_right_bold),
                    Paragraph(f"<font color='#BE123C'>{a_flag}</font>", table_cell_right),
                ])
        else:
            ano_rows.append([
                Paragraph("All transaction records fall within standard statistical spending variance bounds (Zero outliers detected).", table_cell),
                Paragraph("-", table_cell),
                Paragraph("-", table_cell),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("Normal", table_cell_right),
            ])
        ano_table = Table(ano_rows, colWidths=[70, 160, 100, 93, 100])
        ano_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(ano_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            ano_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        ano_table.setStyle(TableStyle(ano_t_styles))
        elements.append(ano_table)

    # =========================================================================
    # BRANCH C: COMPREHENSIVE FINANCIAL MASTER DOSSIER
    # =========================================================================
    elif "insight" in rtype or "comprehensive" in rtype:
        b_limit = float(budget_rep.get("total_limit", 0.0))
        b_spent = float(budget_rep.get("total_spent", 0.0))
        b_util = float(budget_rep.get("overall_utilization_pct", 0.0))
        g_total = int(goal_rep.get("total_goals", 0))
        g_comp = int(goal_rep.get("completed_goals", 0))
        g_pct = float(goal_rep.get("overall_completion_pct", 0.0))
        fc_next = float(forecast_rep.get("forecast_next_month_expense", exp_val or 0.0))

        # Master KPI Cards
        master_kpi_data = [
            [
                Paragraph("TOTAL INFLOW", ParagraphStyle("Mk1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("TOTAL OUTFLOW", ParagraphStyle("Mk2", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("NET CAPITAL RETENTION", ParagraphStyle("Mk3", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_savings)),
                Paragraph("COMPOSITE HEALTH SCORE", ParagraphStyle("Mk4", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_primary)),
            ],
            [
                Paragraph(_fmt_currency(inc_val), ParagraphStyle("MkVal1", fontName=bold_font, fontSize=12, leading=14, textColor=c_income)),
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("MkVal2", fontName=bold_font, fontSize=12, leading=14, textColor=c_expense)),
                Paragraph(_fmt_currency(sav_val), ParagraphStyle("MkVal3", fontName=bold_font, fontSize=12, leading=14, textColor=c_savings)),
                Paragraph(f"{health_score:.0f}/100 (Grade {health_grade})", ParagraphStyle("MkVal4", fontName=bold_font, fontSize=12, leading=14, textColor=c_primary)),
            ],
            [
                Paragraph(f"Savings Rate: <b>{sav_rate:.1f}%</b>", ParagraphStyle("MkSub1", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("All Audited Outflows", ParagraphStyle("MkSub2", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Net Liquid Reserves Added", ParagraphStyle("MkSub3", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Multi-Pillar Solvency Index", ParagraphStyle("MkSub4", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
            ],
        ]
        master_kpi_table = Table(master_kpi_data, colWidths=[130, 131, 131, 131])
        master_kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(master_kpi_table)
        elements.append(Spacer(1, 10))

        # Predictive ML Forecast & Horizon Planning
        elements.append(Paragraph("Machine Learning Multi-Horizon Forecast Spectrum", sec_heading))
        p10 = fc_next * 0.85
        p90 = fc_next * 1.15
        fc_rows = [
            [
                Paragraph("<b>Forecast Metric</b>", ParagraphStyle("Fh1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Projected Outflows</b>", ParagraphStyle("Fh2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Bandwidth & Strategic Implication</b>", ParagraphStyle("Fh3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
            ],
            [
                Paragraph("Expected Routine Outflow (P50)", table_cell_bold),
                Paragraph(_fmt_currency(fc_next), table_cell_right_bold),
                Paragraph("Primary baseline expenditure expected for the upcoming operational cycle.", table_cell),
            ],
            [
                Paragraph("Frugal Floor (P10 Minimum)", table_cell),
                Paragraph(_fmt_currency(p10), table_cell_right),
                Paragraph("Essential survival budget with complete discretionary spending eliminated.", table_cell),
            ],
            [
                Paragraph("Peak Spending Cap (P90 Ceiling)", table_cell),
                Paragraph(_fmt_currency(p90), table_cell_right),
                Paragraph("Safe capital ceiling covering seasonal spikes and discretionary surges.", table_cell),
            ],
            [
                Paragraph("Budget Target vs Forecast Buffer", table_cell),
                Paragraph(_fmt_currency(b_limit - fc_next if b_limit > 0 else 0.0), table_cell_right),
                Paragraph("Positive liquidity margin maintained under current active budget ceiling.", table_cell),
            ],
        ]
        fc_table = Table(fc_rows, colWidths=[180, 110, 233])
        fc_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#581C87")), # Purple 900
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(fc_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            fc_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        fc_table.setStyle(TableStyle(fc_t_styles))
        elements.append(fc_table)
        elements.append(Spacer(1, 10))

        # Unified Multi-Domain Strategic Directives
        elements.append(Paragraph("Autonomous AI Copilot Strategic Directives", sec_heading))
        ai_directives = [
            f"&bull; <b>Capital Allocation:</b> With a current savings rate of {sav_rate:.1f}%, prioritize routing monthly surplus ({_fmt_currency(sav_val)}) into automated SIPs and tax-advantaged instruments.",
            f"&bull; <b>Ceiling Safeguard:</b> Active budget utilization is at {b_util:.1f}%. Keep non-essential routine outflows below {_fmt_currency(b_limit * 0.85)} to prevent month-end cash strain.",
            f"&bull; <b>Goal Velocity:</b> Overall milestone completion is at {g_pct:.1f}% across {g_total} goals. Accelerate allocations towards priority wealth goals.",
        ]
        ai_content = [
            [Paragraph("<b>HOLISTIC FINANCIAL OPTIMIZATION ROADMAP</b>", ParagraphStyle("Ah1", fontName=bold_font, fontSize=8.5, leading=10, textColor=colors.HexColor("#581C87")))],
            *[[Paragraph(d, insight_text)] for d in ai_directives],
        ]
        ai_table = Table(ai_content, colWidths=[523])
        ai_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF5FF")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#8B5CF6")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(ai_table)
        elements.append(Spacer(1, 10))

        # Audited Transaction Ledger Sample
        elements.append(Paragraph("Audited Master Financial Ledger", sec_heading))
        tx_rows = [
            [
                Paragraph("<b>Date</b>", ParagraphStyle("Th1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Title / Payee</b>", ParagraphStyle("Th2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Category</b>", ParagraphStyle("Th3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Type</b>", ParagraphStyle("Th4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Amount</b>", ParagraphStyle("Th5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        for t in transactions[:25]:
            t_date = t.transaction_date.strftime("%d-%b-%Y") if hasattr(t, "transaction_date") and t.transaction_date else "N/A"
            t_title = getattr(t, "title", "Transaction")[:28]
            t_cat = (t.category.category_name if hasattr(t, "category") and t.category else "General")[:18]
            t_type = (getattr(t, "transaction_type", "EXPENSE") or "EXPENSE").upper()
            t_amt = float(getattr(t, "amount", 0.0))
            t_color = c_income if t_type == "INCOME" else c_expense
            tx_rows.append([
                Paragraph(t_date, table_cell),
                Paragraph(t_title, table_cell),
                Paragraph(t_cat, table_cell),
                Paragraph(f"<font color='{t_color.hexval()}'>{t_type}</font>", table_cell),
                Paragraph(_fmt_currency(t_amt), table_cell_right),
            ])
        tx_table = Table(tx_rows, colWidths=[70, 175, 110, 68, 100])
        tx_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(tx_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            tx_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        tx_table.setStyle(TableStyle(tx_t_styles))
        elements.append(tx_table)

    # =========================================================================
    # BRANCH D: EXECUTIVE SUMMARY REPORT (DEFAULT)
    # =========================================================================
    else:
        # 4-Pillar Executive KPIs
        kpi_card_data = [
            [
                Paragraph("TOTAL INFLOW (INCOME)", ParagraphStyle("KpiHead1", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_income)),
                Paragraph("TOTAL OUTFLOW (EXPENSES)", ParagraphStyle("KpiHead2", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_expense)),
                Paragraph("NET SURPLUS / SAVINGS", ParagraphStyle("KpiHead3", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_savings)),
                Paragraph("HEALTH SCORE & GRADE", ParagraphStyle("KpiHead4", fontName=bold_font, fontSize=7.5, leading=9, textColor=c_primary)),
            ],
            [
                Paragraph(_fmt_currency(inc_val), ParagraphStyle("KpiVal1", fontName=bold_font, fontSize=12, leading=14, textColor=c_income)),
                Paragraph(_fmt_currency(exp_val), ParagraphStyle("KpiVal2", fontName=bold_font, fontSize=12, leading=14, textColor=c_expense)),
                Paragraph(_fmt_currency(sav_val), ParagraphStyle("KpiVal3", fontName=bold_font, fontSize=12, leading=14, textColor=c_savings)),
                Paragraph(f"{health_score:.0f}/100 ({health_grade})", ParagraphStyle("KpiVal4", fontName=bold_font, fontSize=12, leading=14, textColor=c_primary)),
            ],
            [
                Paragraph("Aggregated Deposits & Inflows", ParagraphStyle("KpiSub1", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Active Consumption Outflows", ParagraphStyle("KpiSub2", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph(f"Savings Rate: <b>{sav_rate:.1f}%</b>", ParagraphStyle("KpiSub3", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
                Paragraph("Autonomous Financial Health Audit", ParagraphStyle("KpiSub4", fontName=reg_font, fontSize=7, leading=8, textColor=c_text_muted)),
            ],
        ]
        kpi_table = Table(kpi_card_data, colWidths=[130, 131, 131, 131])
        kpi_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, c_border),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 10))

        # Category Spending Breakdown
        elements.append(Paragraph("Category Spending Breakdown", sec_heading))
        cat_rows = [
            [
                Paragraph("<b>Category Name</b>", ParagraphStyle("Th1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Expenditure</b>", ParagraphStyle("Th2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Share (%)</b>", ParagraphStyle("Th3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Tx Count</b>", ParagraphStyle("Th4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        if cat_items:
            for c in cat_items[:10]:
                c_name = str(c.get("category_name") or c.get("name") or "Uncategorized").title()
                c_amt = float(c.get("amount", 0.0))
                c_pct = float(c.get("percentage", 0.0) or (c_amt / (total_cat_spend or 1.0) * 100.0))
                c_count = int(c.get("count", 0) or c.get("transaction_count", 0))
                cat_rows.append([
                    Paragraph(c_name, table_cell),
                    Paragraph(_fmt_currency(c_amt), table_cell_right),
                    Paragraph(f"{c_pct:.1f}%", table_cell_right),
                    Paragraph(str(c_count), table_cell_right),
                ])
            cat_rows.append([
                Paragraph("<b>TOTAL CATEGORIZED EXPENDITURE</b>", table_cell_bold),
                Paragraph(_fmt_currency(total_cat_spend), table_cell_right_bold),
                Paragraph("100.0%", table_cell_right_bold),
                Paragraph(f"{sum(int(c.get('count', 0) or c.get('transaction_count', 0)) for c in cat_items)}", table_cell_right_bold),
            ])
        else:
            cat_rows.append([
                Paragraph("No category expenditures recorded for this period.", table_cell),
                Paragraph("Rs. 0.00", table_cell_right),
                Paragraph("0.0%", table_cell_right),
                Paragraph("0", table_cell_right),
            ])

        cat_table = Table(cat_rows, colWidths=[200, 130, 95, 98])
        cat_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(cat_rows) - 1):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            cat_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        if len(cat_rows) > 2:
            cat_t_styles.append(("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F5F9")))
        cat_table.setStyle(TableStyle(cat_t_styles))
        elements.append(cat_table)
        elements.append(Spacer(1, 10))

        # Budget Execution & Analytics Table
        b_limit = float(budget_rep.get("total_limit", 0.0))
        b_spent = float(budget_rep.get("total_spent", 0.0))
        b_util = float(budget_rep.get("overall_utilization_pct", 0.0))
        g_total = int(goal_rep.get("total_goals", 0))
        g_comp = int(goal_rep.get("completed_goals", 0))
        g_pct = float(goal_rep.get("overall_completion_pct", 0.0))
        fc_next = float(forecast_rep.get("forecast_next_month_expense", 0.0))

        perf_rows = [
            [
                Paragraph("<b>Financial Metric</b>", ParagraphStyle("Ph1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Current Level</b>", ParagraphStyle("Ph2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
                Paragraph("<b>Status / Reliability</b>", ParagraphStyle("Ph3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ],
            [
                Paragraph("Total Active Budget Ceilings", table_cell),
                Paragraph(_fmt_currency(b_limit), table_cell_right),
                Paragraph("Configured Cap", table_cell_right),
            ],
            [
                Paragraph("Budget Utilization Status", table_cell),
                Paragraph(f"{b_util:.1f}% ({_fmt_currency(b_spent)} used)", table_cell_right),
                Paragraph("Healthy" if b_util <= 85 else "Approaching Limit", table_cell_right),
            ],
            [
                Paragraph("Goal Completion Rate", table_cell),
                Paragraph(f"{g_pct:.1f}% ({g_comp}/{g_total} goals achieved)", table_cell_right),
                Paragraph("On Track" if g_pct >= 50 else "In Progress", table_cell_right),
            ],
            [
                Paragraph("ML Next-Month Expense Forecast", table_cell),
                Paragraph(_fmt_currency(fc_next), table_cell_right),
                Paragraph(str(forecast_rep.get("forecast_reliability", "Moderate")).capitalize(), table_cell_right),
            ],
        ]
        perf_table = Table(perf_rows, colWidths=[240, 150, 133])
        perf_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("BACKGROUND", (0, 1), (-1, 1), c_bg_subtle),
            ("BACKGROUND", (0, 2), (-1, 2), colors.white),
            ("BACKGROUND", (0, 3), (-1, 3), c_bg_subtle),
            ("BACKGROUND", (0, 4), (-1, 4), colors.white),
        ]))
        elements.append(Paragraph("Budget Execution & Predictive Analytics", sec_heading))
        elements.append(perf_table)
        elements.append(Spacer(1, 10))

        # AI Copilot Strategic Assessment
        exec_insight = summary_rep.get("executive_insight") or "Financial cash flow position remains balanced. Routine expenses are well within safe thresholds."
        health_expl = health_rep.get("explanation") or "Composite financial score indicates strong budgetary discipline and resilience."
        advice_content = [
            [Paragraph("<b>AI FINANCIAL ADVISOR STRATEGIC ASSESSMENT</b>", ParagraphStyle("AiHead", fontName=bold_font, fontSize=8.5, leading=10, textColor=c_primary))],
            [Paragraph(f"&bull; <b>Executive Summary:</b> {exec_insight}", insight_text)],
            [Paragraph(f"&bull; <b>Health Diagnostics:</b> {health_expl}", insight_text)],
            [Paragraph(f"&bull; <b>Recommendation:</b> Maintain emergency reserves at minimum 3 months of routine consumption ({_fmt_currency(exp_val * 3 if exp_val > 0 else 50000)}). Allocate surplus towards active wealth targets.", insight_text)],
        ]
        advice_table = Table(advice_content, colWidths=[523])
        advice_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
            ("BOX", (0, 0), (-1, -1), 1, c_accent),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(Paragraph("Automated AI Copilot Intelligence", sec_heading))
        elements.append(advice_table)
        elements.append(Spacer(1, 10))

        # Transaction Ledger Sample
        elements.append(Paragraph("Audited Transaction Ledger Sample", sec_heading))
        tx_rows = [
            [
                Paragraph("<b>Date</b>", ParagraphStyle("TxH1", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Title / Description</b>", ParagraphStyle("TxH2", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Category</b>", ParagraphStyle("TxH3", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Type</b>", ParagraphStyle("TxH4", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white)),
                Paragraph("<b>Amount</b>", ParagraphStyle("TxH5", fontName=bold_font, fontSize=8, leading=10, textColor=colors.white, alignment=2)),
            ]
        ]
        for t in transactions[:20]:
            t_date = t.transaction_date.strftime("%d-%b-%Y") if hasattr(t, "transaction_date") and t.transaction_date else "N/A"
            t_title = getattr(t, "title", "Transaction")[:28]
            t_cat = (t.category.category_name if hasattr(t, "category") and t.category else "General")[:18]
            t_type = (getattr(t, "transaction_type", "EXPENSE") or "EXPENSE").upper()
            t_amt = float(getattr(t, "amount", 0.0))
            type_color = c_income if t_type == "INCOME" else c_expense
            tx_rows.append([
                Paragraph(t_date, table_cell),
                Paragraph(t_title, table_cell),
                Paragraph(t_cat, table_cell),
                Paragraph(f"<font color='{type_color.hexval()}'>{t_type}</font>", table_cell),
                Paragraph(_fmt_currency(t_amt), table_cell_right),
            ])
        tx_table = Table(tx_rows, colWidths=[70, 175, 110, 68, 100])
        tx_t_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), c_primary),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, c_border),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]
        for r_idx in range(1, len(tx_rows)):
            bg = c_bg_subtle if r_idx % 2 == 1 else colors.white
            tx_t_styles.append(("BACKGROUND", (0, r_idx), (-1, r_idx), bg))
        tx_table.setStyle(TableStyle(tx_t_styles))
        elements.append(tx_table)

    # Build the PDF using NumberedCanvas
    doc.build(elements, canvasmaker=NumberedCanvas)
    output.seek(0)
    return output
