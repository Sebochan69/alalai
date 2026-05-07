import logging

from app.core.config import settings
from app.db.db import Complaint, User

logger = logging.getLogger(__name__)


STATUS_LABELS = {
    "pending": "Pending",
    "in-progress": "In Progress",
    "for-review": "For Review",
    "resolved": "Resolved",
}

STATUS_MESSAGES = {
    "pending": "We received your complaint and it is now pending review.",
    "in-progress": "Your complaint is now being handled by the barangay team.",
    "for-review": "The barangay team marked your complaint for review. Please check the app and confirm if the issue has been resolved.",
    "resolved": "Your complaint has been marked as resolved. Thank you for helping improve the barangay.",
}


def normalize_status(status: str | None) -> str:
    return (status or "").strip().lower().replace("_", "-").replace(" ", "-")


def mail_is_configured() -> bool:
    return all(
        [
            settings.MAIL_USERNAME,
            settings.MAIL_PASSWORD,
            settings.MAIL_FROM,
            settings.MAIL_SERVER,
            settings.MAIL_PORT,
        ]
    )


async def send_report_status_email(user: User, report: Complaint, status: str) -> None:
    if not mail_is_configured():
        logger.info("Skipping status email because mail settings are incomplete.")
        return

    recipient = getattr(user, "email_address", None)
    if not recipient:
        logger.info("Skipping status email because user has no email address.")
        return

    normalized_status = normalize_status(status)
    status_label = STATUS_LABELS.get(normalized_status, normalized_status.title())
    status_message = STATUS_MESSAGES.get(
        normalized_status,
        f"Your complaint status changed to {status_label}.",
    )

    try:
        from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

        logger.warning(
            "Sending status email via %s:%s starttls=%s ssl_tls=%s username=%s from=%s password_len=%s recipient=%s",
            settings.MAIL_SERVER,
            settings.MAIL_PORT,
            settings.MAIL_STARTTLS,
            settings.MAIL_SSL_TLS,
            settings.MAIL_USERNAME,
            settings.MAIL_FROM,
            len(settings.MAIL_PASSWORD),
            recipient,
        )

        conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME.strip(),
            MAIL_PASSWORD=settings.MAIL_PASSWORD.strip(),
            MAIL_FROM=settings.MAIL_FROM.strip(),
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER.strip(),
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=settings.MAIL_STARTTLS,
            MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            SUPPRESS_SEND=settings.MAIL_SUPPRESS_SEND,
        )

        body = (
            f"Hello {user.username or 'there'},\n\n"
            f"{status_message}\n\n"
            f"Report ID: {report.id}\n"
            f"Location: {report.location or 'N/A'}\n"
            f"Status: {status_label}\n\n"
            "You can log in to AlalAI to view the latest details.\n\n"
            "Thank you,\n"
            "AlalAI"
        )

        message = MessageSchema(
            subject=f"AlalAI Report #{report.id} is {status_label}",
            recipients=[recipient],
            body=body,
            subtype=MessageType.plain,
        )

        await FastMail(conf).send_message(message)
    except Exception:
        logger.exception("Failed to send report status email.")
