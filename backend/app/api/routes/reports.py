import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_admin
from app.core.constants import REPORT_STATUSES
from app.core.config import settings
from app.db.db import Complaint, Report, User
from app.schemas.schemas import MonthlyReportOut, ReportOut, ReportStatusUpdate
from app.services.ai.ai_tagging import AITaggingService
from app.services.ai.ai_service import AIService
from app.services.monthly_report_service import generate_monthly_report, report_to_dict
from app.services.email_service import send_report_status_email
from app.services.notification_service import create_notification
from app.services.report_service import find_possible_duplicate

router = APIRouter()


def normalize_status(status: str | None) -> str:
    return (status or "").strip().lower().replace("_", "-").replace(" ", "-")


def complaint_to_report_out(complaint: Complaint) -> dict:
    return {
        "id": complaint.id,
        "address": complaint.location,
        "description": complaint.description,
        "location_area": complaint.location_area,
        "latitude": complaint.lat,
        "longitude": complaint.long,
        "tag": complaint.tagging,
        "priority": complaint.priority,
        "ai_summary": complaint.summary,
        "dispatch_reason": complaint.dispatch_reason,
        "ai_processed_complaint": complaint.ai_processed_complaint,
        "possible_duplicate_report_id": complaint.possible_duplicate_complaint_id,
        "status": normalize_status(complaint.status),
        "admin_comment": complaint.admin_comment,
        "created_at": complaint.created_at,
    }


@router.post("/", response_model=ReportOut)
async def file_report(
    background_tasks: BackgroundTasks,
    address: str = Form(...),
    description: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (current_user.role or "").lower() != "citizen":
        raise HTTPException(
            status_code=403, detail="Only citizens can file reports")

    ai = AIService()
    tagging = AITaggingService()
    tag_result_model = await tagging.auto_tag_complaint(
        description=description, location=address)
    tag_result = {
        "tag": tag_result_model.tagging,
        "priority": tag_result_model.priority,
        "summary": tag_result_model.summary,
        "location_area": None,
    }

    duplicate_id = find_possible_duplicate(
        db=db,
        description=description,
        address=address,
        location_area=tag_result.get("location_area"),
    )

    admins = db.query(User).filter(User.role.ilike("admin")).all()
    assignment = ai.auto_assign_admin(
        location_area=tag_result.get("location_area"),
        admins=[
            {
                "id": admin.id,
                "full_name": admin.username,
                "assigned_locations": admin.location_assigned,
                "active_reports": db.query(Complaint).filter(
                    Complaint.assigned_id == admin.id,
                    Complaint.status.in_(
                        ["pending", "in-progress", "in progress", "for-review", "for review"]),
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

    report = Complaint(
        user_id=current_user.id,
        assigned_id=assignment.get("admin_id"),
        location=address,
        description=description,
        lat=latitude,
        long=longitude,
        tagging=tag_result.get("tag"),
        location_area=tag_result.get("location_area"),
        summary=tag_result.get("summary"),
        priority=tag_result.get("priority"),
        dispatch_reason=assignment.get("dispatch_reason"),
        ai_processed_complaint=json.dumps(
            ai_processed_complaint, ensure_ascii=False),
        possible_duplicate_complaint_id=duplicate_id,
        status="pending",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    background_tasks.add_task(
        send_report_status_email,
        current_user,
        report,
        report.status,
    )

    if report.assigned_id:
        create_notification(
            db=db,
            user_id=report.assigned_id,
            title="New assigned complaint",
            message=f"Report #{report.id}: {report.summary or report.description[:80]}",
        )

    return complaint_to_report_out(report)


@router.get("/mine", response_model=list[ReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaints = db.query(Complaint).filter(
        Complaint.user_id == current_user.id).order_by(Complaint.created_at.desc()).all()
    return [complaint_to_report_out(complaint) for complaint in complaints]


@router.get("/assigned", response_model=list[ReportOut])
def get_assigned_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    complaints = db.query(Complaint).filter(
        Complaint.assigned_id == current_user.id).order_by(Complaint.created_at.desc()).all()
    return [complaint_to_report_out(complaint) for complaint in complaints]


@router.get("/map")
def get_map_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = db.query(Complaint).filter(
        Complaint.lat.isnot(None), Complaint.long.isnot(None)).all()
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


@router.post("/monthly/{month}", response_model=MonthlyReportOut)
def create_monthly_report(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    try:
        report = generate_monthly_report(db, month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return report_to_dict(report)


@router.get("/monthly/{month}", response_model=MonthlyReportOut)
def get_monthly_report(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    report = db.query(Report).filter(Report.month == month).first()
    if not report:
        raise HTTPException(status_code=404, detail="Monthly report not found")

    return report_to_dict(report)


@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(Complaint).filter(Complaint.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

#     if payload.status not in REPORT_STATUSES:
#         raise HTTPException(status_code=400, detail="Invalid report status")

    current_status = normalize_status(report.status)
    next_status = normalize_status(payload.status)

    if (current_user.role or "").lower() == "citizen" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if (current_user.role or "").lower() == "citizen" and (current_status != "for-review" or next_status != "resolved"):
        raise HTTPException(
            status_code=403, detail="Citizens can only resolve reports that are for review")

    if (current_user.role or "").lower() == "admin":
        if report.assigned_id != current_user.id:
            raise HTTPException(
                status_code=403, detail="Only the assigned admin can update this report")
        if next_status == "resolved":
            raise HTTPException(
                status_code=403, detail="Only citizens can mark reports as resolved")

    report.status = next_status
    report.updated_at = datetime.utcnow()
    if next_status == "resolved":
        report.date_resolved = datetime.utcnow()
    if payload.admin_comment is not None:
        report.admin_comment = payload.admin_comment

    db.commit()
    db.refresh(report)

    if current_status != next_status:
        background_tasks.add_task(
            send_report_status_email,
            report.created_by,
            report,
            report.status,
        )

    if report.status == "for-review":
        create_notification(
            db=db,
            user_id=report.user_id,
            title="Complaint ready for review",
            message=f"Report #{report.id} is ready for your review.",
        )

    return complaint_to_report_out(report)
