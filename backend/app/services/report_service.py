from sqlalchemy.orm import Session
from app.models.models import Report


def count_user_reports(db: Session, user_id: int) -> int:
    return db.query(Report).filter(Report.citizen_id == user_id).count()


def find_possible_duplicate(
    db: Session,
    description: str,
    address: str,
    location_area: str | None,
) -> int | None:
    """
    POC duplicate detection.

    Simple heuristic for hackathon:
    - same extracted location area, and
    - overlapping words in description/address

    Upgrade later:
    - embeddings similarity
    - geospatial distance
    - same active status only
    """
    active_reports = db.query(Report).filter(Report.status.in_(["pending", "in progress", "for review"])).all()

    incoming_text = f"{description} {address}".lower()
    incoming_words = set(incoming_text.split())

    for report in active_reports:
        if location_area and report.location_area and location_area.lower() != report.location_area.lower():
            continue

        existing_text = f"{report.description} {report.address}".lower()
        existing_words = set(existing_text.split())

        if not incoming_words or not existing_words:
            continue

        overlap = len(incoming_words & existing_words) / max(len(incoming_words), 1)
        if overlap >= 0.45:
            return report.id

    return None
