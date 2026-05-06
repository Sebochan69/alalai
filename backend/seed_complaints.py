from app.db import db as legacy_db
from app.db.db import Complaint
from app.db.session import SessionLocal
from app.models.models import User
from app.core.security import hash_password


def seed_complaints():
    # ensure legacy tables exist
    legacy_db.Base.metadata.create_all(bind=legacy_db.engine)

    db = SessionLocal()

    # create a user compatible with app.models.models.User (existing schema)
    user = db.query(User).filter(User.email == "seed@alalai.test").first()
    if not user:
        user = User(
            full_name="Seed User",
            email="seed@alalai.test",
            hashed_password=hash_password("password123"),
            role="citizen",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # create sample complaints (only if not already present)
    existing = db.query(Complaint).filter(Complaint.description ==
                                          "Large pile of garbage blocking the alley and causing odor; attracts stray dogs.").first()
    if not existing:
        samples = [
            Complaint(
                location="Purok 4, Brgy. San Isidro, Main St.",
                long=120.9842,
                lat=14.5995,
                status="Pending",
                description="Large pile of garbage blocking the alley and causing odor; attracts stray dogs.",
                priority="High",
                media="https://example.com/uploads/garbage-pile.jpg",
                tagging="garbage",
                summary="Garbage pile blocking alley",
                user_id=user.id,
            ),
            Complaint(
                location="Market Road near Block B",
                long=120.9855,
                lat=14.6002,
                status="Pending",
                description="Streetlight not functioning for several nights.",
                priority="Medium",
                media=None,
                tagging="street_light",
                summary="Broken streetlight",
                user_id=user.id,
            ),
        ]

        db.add_all(samples)
        db.commit()

    db.close()
    print("Seeded complaints (if they did not already exist)")


if __name__ == "__main__":
    seed_complaints()
