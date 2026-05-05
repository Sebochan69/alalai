from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.core.constants import REPORT_STATUSES
from app.db.db import Complaint, User
from app.services.ai.ai_service import AIService

router = APIRouter()


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    reports = db.query(Complaint).all()
    ai = AIService()
    ai_analytics = ai.generate_analytics([
        {
            "id": report.id,
            "tag": report.tagging,
            "priority": report.priority,
            "location_area": report.location_area,
            "status": report.status,
            "created_at": str(report.created_at),
            "updated_at": str(report.updated_at),
            "summary": report.summary,
        }
        for report in reports
    ])

    return {
        **ai_analytics,
        "total_complaints": len(reports),
        "status_counts": {
            status: sum(1 for report in reports if report.status == status)
            for status in REPORT_STATUSES
        },
    }


@router.get("/map/reports")
def get_map_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = db.query(Complaint).filter(Complaint.lat.isnot(None), Complaint.long.isnot(None)).all()
    return [
        {
            "id": report.id,
            "address": report.location,
            "latitude": report.lat,
            "longitude": report.long,
            "tag": report.tagging,
            "priority": report.priority,
            "status": report.status,
            "summary": report.summary,
        }
        for report in reports
    ]
