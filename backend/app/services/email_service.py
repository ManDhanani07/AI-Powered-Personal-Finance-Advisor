"""
Professional Non-Blocking Async Email Dispatcher for AI Personal Finance Advisor.
Handles SMTP Welcome Emails, Google OAuth notifications, and Security Alerts.
"""

import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings
from app.core.logging import logger


class EmailService:
    def __init__(self):
        self.sender_email = getattr(settings, "SMTP_USERNAME", "fintech0707@gmail.com")
        self.sender_name = "AI Personal Finance Advisor"
        self.smtp_server = getattr(settings, "SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = getattr(settings, "SMTP_PORT", 587)
        self.smtp_password = getattr(settings, "SMTP_PASSWORD", "")

    def _send_sync(self, recipient_email: str, subject: str, html_content: str) -> bool:
        """Synchronous SMTP worker executed in a non-blocking background thread pool."""
        try:
            if self.smtp_password:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{self.sender_name} <{self.sender_email}>"
                msg["To"] = recipient_email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=12) as server:
                    server.starttls()
                    server.login(self.sender_email, self.smtp_password)
                    server.sendmail(self.sender_email, recipient_email, msg.as_string())
                
                logger.info(f"[EmailService] Real SMTP email sent from {self.sender_email} to {recipient_email}")
            else:
                logger.info(f"[EmailService] [DEV DISPATCH SIMULATION] Sent welcome email from {self.sender_email} to {recipient_email}")
            
            return True
        except smtplib.SMTPAuthenticationError as auth_ex:
            logger.warning(
                f"[EmailService] Gmail SMTP Authentication Error (535): Google requires a 16-character 'App Password' "
                f"(generated from https://myaccount.google.com/apppasswords) for SMTP_PASSWORD instead of your standard login password."
            )
            return False
        except Exception as ex:
            logger.error(f"[EmailService] Error dispatching email to {recipient_email}: {ex}")
            return False

    async def send_welcome_email(self, recipient_email: str, first_name: str) -> bool:
        """
        Asynchronously send welcome email without blocking the FastAPI event loop.
        """
        subject = f"Welcome to AI Personal Finance Advisor, {first_name}! 🚀"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 30px auto; background: #1e293b; border-radius: 20px; overflow: hidden; border: 1px solid #334155; shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }}
            .header {{ background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 35px 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
            .content {{ padding: 35px 30px; line-height: 1.6; color: #cbd5e1; font-size: 14px; }}
            .greeting {{ font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 15px; }}
            .badge {{ display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 12px; margin-bottom: 20px; }}
            .card {{ background: #0f172a; border-radius: 14px; padding: 20px; border: 1px solid #334155; margin: 20px 0; }}
            .card-title {{ font-weight: 700; color: #38bdf8; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; tracking: 1px; }}
            .button {{ display: inline-block; background: #6366f1; color: #ffffff; font-weight: 700; padding: 14px 28px; text-decoration: none; border-radius: 12px; margin-top: 25px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4); }}
            .footer {{ background: #0f172a; padding: 20px 30px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AI Personal Finance Advisor</h1>
            </div>
            <div class="content">
              <div class="greeting">Welcome aboard, {first_name}!</div>
              <div class="badge">✓ Account Successfully Activated</div>
              <p>Your AI Wealth OS Workspace is now fully active. You now have access to continuous real-time ledger tracking, AI recommendations powered by Google Gemini, Meta Prophet cash flow forecasting, and automated budget anomaly alerts.</p>

              <div class="card">
                <div class="card-title">🔐 Account Security Overview</div>
                <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                  • <strong>Email Registered:</strong> {recipient_email}<br>
                  • <strong>Sender ID:</strong> {self.sender_email}<br>
                  • <strong>Security Protocol:</strong> 256-Bit Bank Grade Encryption<br>
                  • <strong>Status:</strong> Verified & Active
                </p>
              </div>

              <p>If you have any questions or need assistance setting up your custom budgets, our financial copilot is available 24/7 in your dashboard.</p>

              <div style="text-align: center;">
                <a href="http://localhost:3000/dashboard" class="button">Launch Wealth OS Workspace &rarr;</a>
              </div>
            </div>
            <div class="footer">
              &copy; 2026 AI-Powered Personal Finance Advisor Platform. Sent from {self.sender_email}.
            </div>
          </div>
        </body>
        </html>
        """

        return await asyncio.to_thread(self._send_sync, recipient_email, subject, html_content)

    async def send_verification_otp(self, recipient_email: str, first_name: str, otp: str) -> bool:
        """
        Send 6-Digit Email Verification OTP for new signups or email confirmation.
        """
        subject = "Verify your AI Finance Advisor account"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 540px; margin: 30px auto; background: #121216; border-radius: 24px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }}
            .header {{ background: linear-gradient(135deg, #10b981 0%, #0d9488 50%, #06b6d4 100%); padding: 35px 30px; text-align: center; }}
            .header h1 {{ color: #09090b; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }}
            .header p {{ color: #042f2e; margin: 5px 0 0 0; font-size: 13px; font-weight: 700; }}
            .content {{ padding: 35px 30px; line-height: 1.6; color: #cbd5e1; font-size: 14px; }}
            .greeting {{ font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }}
            .otp-box {{ margin: 28px 0; background: #18181b; border: 2px dashed #10b981; border-radius: 16px; padding: 20px; text-align: center; }}
            .otp-label {{ font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #34d399; margin-bottom: 8px; }}
            .otp-code {{ font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #ffffff; margin: 6px 0; }}
            .badge-timer {{ display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 11px; margin-top: 6px; }}
            .security-note {{ background: #18181b; border-radius: 12px; padding: 15px; border: 1px solid #27272a; margin-top: 25px; font-size: 12px; color: #94a3b8; }}
            .footer {{ background: #09090b; padding: 20px 30px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #18181b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AI Personal Finance Advisor</h1>
              <p>Wealth Intelligence & Autonomous Financial Copilot</p>
            </div>
            <div class="content">
              <div class="greeting">Verify your email address</div>
              <p>Hi {first_name or 'there'},</p>
              <p>Thank you for signing up. Please use the 6-digit verification code below to activate your account and access your AI financial workspace:</p>

              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">{otp}</div>
                <div class="badge-timer">⏱️ This code expires in 10 minutes</div>
              </div>

              <div class="security-note">
                🔒 <strong>Security Warning:</strong> Never share this code with anyone. AI Finance Advisor staff will never ask for your verification code. If you did not create this account, you can safely ignore this email.
              </div>
            </div>
            <div class="footer">
              &copy; 2026 AI-Powered Personal Finance Advisor. Sent from {self.sender_email}.
            </div>
          </div>
        </body>
        </html>
        """
        return await asyncio.to_thread(self._send_sync, recipient_email, subject, html_content)

    async def send_password_reset_otp(self, recipient_email: str, first_name: str, otp: str) -> bool:
        """
        Send 6-Digit Password Reset OTP.
        """
        subject = "Password Reset Verification Code - AI Finance Advisor"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 540px; margin: 30px auto; background: #121216; border-radius: 24px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }}
            .header {{ background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%); padding: 35px 30px; text-align: center; }}
            .header h1 {{ color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }}
            .content {{ padding: 35px 30px; line-height: 1.6; color: #cbd5e1; font-size: 14px; }}
            .greeting {{ font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }}
            .otp-box {{ margin: 28px 0; background: #18181b; border: 2px dashed #818cf8; border-radius: 16px; padding: 20px; text-align: center; }}
            .otp-label {{ font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #a5b4fc; margin-bottom: 8px; }}
            .otp-code {{ font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #ffffff; margin: 6px 0; }}
            .badge-timer {{ display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 11px; margin-top: 6px; }}
            .security-note {{ background: #18181b; border-radius: 12px; padding: 15px; border: 1px solid #27272a; margin-top: 25px; font-size: 12px; color: #94a3b8; }}
            .footer {{ background: #09090b; padding: 20px 30px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #18181b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <div class="greeting">Reset your password</div>
              <p>Hi {first_name or 'there'},</p>
              <p>We received a request to reset your password. Use the 6-digit verification code below to authorize the password change:</p>

              <div class="otp-box">
                <div class="otp-label">Password Reset Code</div>
                <div class="otp-code">{otp}</div>
                <div class="badge-timer">⏱️ This code expires in 10 minutes</div>
              </div>

              <div class="security-note">
                🔐 <strong>Security Notice:</strong> If you did not request a password reset, your account is safe and you can ignore this email.
              </div>
            </div>
            <div class="footer">
              &copy; 2026 AI-Powered Personal Finance Advisor. Sent from {self.sender_email}.
            </div>
          </div>
        </body>
        </html>
        """
        return await asyncio.to_thread(self._send_sync, recipient_email, subject, html_content)


email_service = EmailService()
