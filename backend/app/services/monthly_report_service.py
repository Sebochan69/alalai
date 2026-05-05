import json
from calendar import monthrange
from collections import Counter
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.constants import REPORT_STATUSES
from app.db.db import Complaint, Report
from app.services.ai.ai_service import AIService


def normalize_status(status: str | None) -> str:
    return (status or "").strip().lower()


def parse_month(month: str) -> tuple[datetime, datetime]:
    try:
        year, month_number = (int(part) for part in month.split("-", 1))
        last_day = monthrange(year, month_number)[1]
    except ValueError as exc:
        raise ValueError("Month must use YYYY-MM format") from exc

    start = datetime(year, month_number, 1)
    end = datetime(year, month_number, last_day, 23, 59, 59, 999999)
    return start, end


def get_complaints_for_month(db: Session, month: str) -> list[Complaint]:
    start, end = parse_month(month)
    return (
        db.query(Complaint)
        .filter(Complaint.created_at >= start, Complaint.created_at <= end)
        .order_by(Complaint.created_at.asc())
        .all()
    )


def build_monthly_metrics(month: str, complaints: list[Complaint]) -> dict[str, Any]:
    total = len(complaints)
    resolved = [complaint for complaint in complaints if normalize_status(complaint.status) == "resolved"]
    category_counts = Counter((complaint.tagging or "other") for complaint in complaints)
    status_counts = {
        status: sum(1 for complaint in complaints if normalize_status(complaint.status) == status)
        for status in REPORT_STATUSES
    }

    solution_days = [
        (complaint.date_resolved - complaint.created_at).total_seconds() / 86400
        for complaint in resolved
        if complaint.created_at and complaint.date_resolved
    ]
    avg_solution_days = round(sum(solution_days) / len(solution_days)) if solution_days else 0
    completion_rate = round((len(resolved) / total) * 100) if total else 0

    return {
        "month": month,
        "overall_complaint_count": total,
        "overall_completion_rate": completion_rate,
        "avg_solution_days": avg_solution_days,
        "status_counts": status_counts,
        "unresolved_count": total - len(resolved),
        "category_breakdown": dict(category_counts),
    }


def complaint_samples(complaints: list[Complaint]) -> list[dict[str, Any]]:
    return [
        {
            "id": complaint.id,
            "tag": complaint.tagging,
            "priority": complaint.priority,
            "status": complaint.status,
            "location_area": complaint.location_area,
            "summary": complaint.summary,
            "created_at": str(complaint.created_at),
            "date_resolved": str(complaint.date_resolved) if complaint.date_resolved else None,
        }
        for complaint in complaints
    ]


def generate_monthly_report(db: Session, month: str) -> Report:
    complaints = get_complaints_for_month(db, month)
    metrics = build_monthly_metrics(month, complaints)

    ai = AIService()
    insights = ai.generate_monthly_report(
        {
            **metrics,
            "complaints": complaint_samples(complaints),
        }
    )

    category_breakdown = insights.get("category_breakdown") or metrics["category_breakdown"]
    suggest_actions = insights.get("suggest_actions") or []
    forecast = insights.get("forecast") or "Not enough complaint data to forecast next month reliably."

    report = db.query(Report).filter(Report.month == month).first()
    if not report:
        report = Report(month=month)
        db.add(report)

    report.overall_complaint_count = metrics["overall_complaint_count"]
    report.overall_completion_rate = metrics["overall_completion_rate"]
    report.avg_solution_days = metrics["avg_solution_days"]
    report.forecast = forecast
    report.suggest_actions = json.dumps(suggest_actions, ensure_ascii=False)
    report.category_breakdown = json.dumps(category_breakdown, ensure_ascii=False)
    report.created_at = datetime.utcnow()

    db.commit()
    db.refresh(report)
    return report


def report_to_dict(report: Report) -> dict[str, Any]:
    return {
        "id": report.id,
        "month": report.month,
        "overall_complaint_count": report.overall_complaint_count,
        "overall_completion_rate": report.overall_completion_rate,
        "forecast": report.forecast,
        "suggest_actions": json.loads(report.suggest_actions or "[]"),
        "avg_solution_days": report.avg_solution_days,
        "category_breakdown": json.loads(report.category_breakdown or "{}"),
        "created_at": report.created_at,
    }
