from typing import Any, List
from fastapi import APIRouter, Body, HTTPException, Depends, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.db import Complaint, Comment
from app.services.tagging_service import TaggingService

router = APIRouter()

tagging_service = TaggingService()


@router.post("/", response_model=dict)
async def create_complaint(payload: dict = Body(..., example={
    "user_id": 1,
    "location": "Brgy. Central",
    "long": 120.982,
    "lat": 14.604,
    "description": "Large pothole near market",
    "media": "https://example.com/photo.jpg"
}), db: Session = Depends(get_db)) -> Any:
    """Accepts a complaint payload, runs AI tagging, and returns merged result.

    Example request payload:

   {
        "id": 123,
        "user_id": 45,
        "location": "Brgy. San Jose, Zone 3",
        "long": 120.9824,
        "lat": 14.6091,
        "status": "Pending",
        "description": "Large pothole on the main road near the market; vehicles swerve to avoid it, creating a safety hazard.",
        "media": "https://example.com/media/pothole_123.jpg",
    }

    """
    try:
        result = await tagging_service.process_incoming_complaint(payload)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/", response_model=List[dict])
def get_all_complaints(db: Session = Depends(get_db)) -> Any:
    """Return all stored complaints mapped to the expected payload shape."""
    reports = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    output = []
    for r in reports:
        # find latest comment for this complaint (if any)
        latest_comment = db.query(Comment).filter(
            Comment.complaint_id == r.id).order_by(Comment.created_at.desc()).first()
        comment_obj = None
        if latest_comment:
            author = getattr(latest_comment, "author", None)
            comment_obj = {
                "id": latest_comment.id,
                "content": latest_comment.content,
                "created_at": (latest_comment.created_at.isoformat() if latest_comment.created_at else None),
                "user_id": latest_comment.user_id,
                "author_email": (getattr(author, "email_address", None) if author else None),
                "author_role": (getattr(author, "role", None) if author else None),
            }

        # include assigned_to details when available
        assigned_to_obj = None
        if getattr(r, "assigned_to", None):
            at = r.assigned_to
            assigned_to_obj = {
                "id": at.id,
                "username": getattr(at, "username", None),
                "email": getattr(at, "email_address", None),
                "role": getattr(at, "role", None),
                "location_assigned": getattr(at, "location_assigned", None),
            }

        output.append(
            {
                "id": r.id,
                "user_id": r.user_id,
                "assigned_id": r.assigned_id,
                "assigned_to": assigned_to_obj,
                "location": r.location,
                "long": r.long,
                "lat": r.lat,
                "email": (r.created_by.email_address if getattr(r, "created_by", None) else None),
                "status": r.status,
                "description": r.description,
                "media": r.media,
                "comment": comment_obj,

                # AI Generated Fields
                "tagging": r.tagging,
                "priority": r.priority,
                "summary": r.summary,
            }
        )

    return output


@router.get("/{complaint_id}", response_model=dict)
def get_complaint(complaint_id: int = Path(..., example=123), db: Session = Depends(get_db)) -> Any:
    """Return a single complaint by id mapped to the expected payload shape."""
    r = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # find latest comment for this complaint (if any)
    latest_comment = db.query(Comment).filter(
        Comment.complaint_id == r.id).order_by(Comment.created_at.desc()).first()
    comment_obj = None

    if latest_comment:
        author = getattr(latest_comment, "author", None)
        comment_obj = {
            "id": latest_comment.id,
            "content": latest_comment.content,
            "created_at": (latest_comment.created_at.isoformat() if latest_comment.created_at else None),
            "user_id": latest_comment.user_id,
            "author_email": (getattr(author, "email_address", None) if author else None),
            "author_role": (getattr(author, "role", None) if author else None),
        }

    # include assigned_to details when available
    assigned_to_obj = None
    if getattr(r, "assigned_to", None):
        at = r.assigned_to
        assigned_to_obj = {
            "id": at.id,
            "username": getattr(at, "username", None),
            "email": getattr(at, "email_address", None),
            "role": getattr(at, "role", None),
            "location_assigned": getattr(at, "location_assigned", None),
        }

    return {
        "id": r.id,
        "user_id": r.user_id,
        "assigned_id": r.assigned_id,
        "assigned_to": assigned_to_obj,
        "location": r.location,
        "long": r.long,
        "lat": r.lat,
        "email": (r.created_by.email_address if getattr(r, "created_by", None) else None),
        "status": r.status,
        "description": r.description,
        "media": r.media,
        "comment": comment_obj,


        "tagging": r.tagging,
        "priority": r.priority,
        "summary": r.summary,
    }


@router.patch("/{complaint_id}", response_model=dict)
def patch_complaint(complaint_id: int = Path(..., example=123), payload: dict = Body(..., example={
    "location": "New location",
    "long": 120.983,
    "lat": 14.605,
    "status": "In Progress",
    "description": "Updated description",
    "media": "https://example.com/updated.jpg",
    "assigned_id": 2
}), db: Session = Depends(get_db)) -> Any:
    """Partially update a complaint (fields supported by the Complaint model).

    Example request payloads (any subset of these fields is accepted):

    {
        "location": "New location",
        "long": 120.983,
        "lat": 14.605,
        "status": "In Progress",
        "description": "Updated description",
        "media": "https://example.com/updated.jpg",
        "assigned_id": 2
    }
    """
    r = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Update known fields if present

    if "location" in payload:
        r.location = payload.get("location")
    if "long" in payload:
        r.long = payload.get("long")
    if "lat" in payload:
        r.lat = payload.get("lat")
    if "status" in payload:
        r.status = payload.get("status")
    if "description" in payload:
        r.description = payload.get("description")
    if "media" in payload:
        r.media = payload.get("media")
    # `priority`, `tagging`, and `summary` are not patchable via this endpoint.
    if "assigned_id" in payload:
        r.assigned_id = payload.get("assigned_id")

    db.commit()
    db.refresh(r)

    # find latest comment for this complaint (if any)
    latest_comment = db.query(Comment).filter(
        Comment.complaint_id == r.id).order_by(Comment.created_at.desc()).first()
    comment_obj = None

    if latest_comment:
        author = getattr(latest_comment, "author", None)
        comment_obj = {
            "id": latest_comment.id,
            "content": latest_comment.content,
            "created_at": (latest_comment.created_at.isoformat() if latest_comment.created_at else None),
            "user_id": latest_comment.user_id,
            "author_email": (getattr(author, "email_address", None) if author else None),
            "author_role": (getattr(author, "role", None) if author else None),
        }

    # include assigned_to details when available
    assigned_to_obj = None
    if getattr(r, "assigned_to", None):
        at = r.assigned_to
        assigned_to_obj = {
            "id": at.id,
            "username": getattr(at, "username", None),
            "email": getattr(at, "email_address", None),
            "role": getattr(at, "role", None),
            "location_assigned": getattr(at, "location_assigned", None),
        }

    return {
        "id": r.id,
        "user_id": r.user_id,
        "assigned_id": r.assigned_id,
        "assigned_to": assigned_to_obj,
        "location": r.location,
        "long": r.long,
        "lat": r.lat,
        "email": (r.created_by.email_address if getattr(r, "created_by", None) else None),
        "status": r.status,
        "description": r.description,
        "media": r.media,
        "comment": comment_obj,
        "tagging": r.tagging,
        "priority": r.priority,
        "summary": r.summary,
    }


@router.post("/{complaint_id}/comments", response_model=dict)
def create_comment(complaint_id: int = Path(..., example=123), payload: dict = Body(..., example={
    "content": "Please address this as soon as possible.",
    "user_id": 1
}), db: Session = Depends(get_db)) -> Any:
    """Create a comment for a complaint.

    Example request payload:

    {
        "content": "Please address this as soon as possible.",
        "user_id": 1
    }
    """
    # Ensure complaint exists
    r = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Complaint not found")

    content = payload.get("content")
    if not content:
        raise HTTPException(
            status_code=400, detail="Missing 'content' in payload")

    user_id = payload.get("user_id")

    comment = Comment(
        content=content, complaint_id=complaint_id, user_id=user_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content,
        "created_at": (comment.created_at.isoformat() if comment.created_at else None),
        "complaint_id": comment.complaint_id,
        "user_id": comment.user_id,
        "author_email": (getattr(comment.author, "email_address", None) if getattr(comment, "author", None) else None),
    }
