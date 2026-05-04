import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.core.constants import REPORT_STATUSES
from app.core.config import settings
from app.models.models import Report, User
from app.schemas.schemas import ReportOut, ReportStatusUpdate
from app.services.ai.ai_service import AIService
from app.services.notification_service import create_notification
from app.services.report_service import count_user_reports, find_possible_duplicate

router = APIRouter()


@router.post("/", response_model=ReportOut)
async def file_report(
    address: str = Form(...),
    description: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can file reports")

    if count_user_reports(db, current_user.id) >= settings.MAX_REPORTS_PER_USER:
        raise HTTPException(status_code=400, detail=f"Maximum of {settings.MAX_REPORTS_PER_USER} reports reached")

    ai = AIService()
    tag_result = ai.auto_tag_complaint(description=description, address=address)

    duplicate_id = find_possible_duplicate(
        db=db,
        description=description,
        address=address,
        location_area=tag_result.get("location_area"),
    )

    admins = db.query(User).filter(User.role == "admin").all()
    assignment = ai.auto_assign_admin(
        location_area=tag_result.get("location_area"),
        admins=[
            {
                "id": admin.id,
                "full_name": admin.full_name,
                "assigned_locations": admin.assigned_locations,
                "active_reports": db.query(Report).filter(
                    Report.assigned_admin_id == admin.id,
                    Report.status.in_(["pending", "in progress", "for review"]),
                ).count(),
            }
            for admin in admins
        ],
    )
    ai_processed_complaint = {
        "tagging": tag_result,
        "assignment": assignment,
        "possible_duplicate_report_id": duplicate_id,
    }

    report = Report(
        citizen_id=current_user.id,
        assigned_admin_id=assignment.get("admin_id"),
        address=address,
        description=description,
        latitude=latitude,
        longitude=longitude,
        tag=tag_result.get("tag"),
        location_area=tag_result.get("location_area"),
        ai_summary=tag_result.get("summary"),
        priority=tag_result.get("priority"),
        dispatch_reason=assignment.get("dispatch_reason"),
        ai_processed_complaint=json.dumps(ai_processed_complaint, ensure_ascii=False),
        possible_duplicate_report_id=duplicate_id,
        status="pending",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    if report.assigned_admin_id:
        create_notification(
            db=db,
            user_id=report.assigned_admin_id,
            title="New assigned complaint",
            message=f"Report #{report.id}: {report.ai_summary or report.description[:80]}",
        )

    return report


@router.get("/mine", response_model=list[ReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Report).filter(Report.citizen_id == current_user.id).order_by(Report.created_at.desc()).all()


@router.get("/assigned", response_model=list[ReportOut])
def get_assigned_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(Report).filter(Report.assigned_admin_id == current_user.id).order_by(Report.created_at.desc()).all()


@router.get("/map")
def get_map_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = db.query(Report).filter(Report.latitude.isnot(None), Report.longitude.isnot(None)).all()
    return [
        {
            "id": report.id,
            "address": report.address,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "tag": report.tag,
            "priority": report.priority,
            "status": report.status,
            "summary": report.ai_summary,
        }
        for report in reports
    ]


@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if payload.status not in REPORT_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid report status")

    if current_user.role == "citizen" and report.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if current_user.role == "citizen" and (report.status != "for review" or payload.status != "resolved"):
        raise HTTPException(status_code=403, detail="Citizens can only resolve reports that are for review")

    if current_user.role == "admin":
        if report.assigned_admin_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the assigned admin can update this report")
        if payload.status == "resolved":
            raise HTTPException(status_code=403, detail="Only citizens can mark reports as resolved")

    report.status = payload.status
    report.updated_at = datetime.utcnow()
    if payload.admin_comment is not None:
        report.admin_comment = payload.admin_comment

    db.commit()
    db.refresh(report)

    if report.status == "for review":
        create_notification(
            db=db,
            user_id=report.citizen_id,
            title="Complaint ready for review",
            message=f"Report #{report.id} is ready for your review.",
        )

    return report
