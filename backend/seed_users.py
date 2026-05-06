from sqlalchemy.orm import Session
from datetime import datetime
# Import your engine and SessionLocal from your main db file
# Adjust the import path 'db' to match your actual file name
from app.db.db import SessionLocal, engine, User, Complaint, Comment, Base


def seed_data():
    # Ensure tables are created (though usually handled by alembic)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # 1. Create an Admin and a Citizen
        admin_user = User(
            username="admin_jane",
            email_address="jane@example.com",
            hashed_password="hashed_password_123",  # In a real app, use passlib/bcrypt
            location_assigned="Central District",
            role="Admin"
        )

        citizen_user = User(
            username="citizen_joe",
            email_address="joe@example.com",
            hashed_password="hashed_password_456",
            location_assigned="North Sector",
            role="Citizen"
        )

        db.add_all([admin_user, citizen_user])
        db.commit()  # Commit to get the IDs
        db.refresh(admin_user)
        db.refresh(citizen_user)

        print(f"Users created: {admin_user.username}, {citizen_user.username}")

        # 2. Create a Complaint submitted by the citizen
        new_complaint = Complaint(
            location="123 Main St",
            long=121.05,
            lat=14.58,
            status="Pending",
            description="Large pothole blocking the lane.",
            priority="High",
            tagging="Road Maintenance",
            user_id=citizen_user.id,
            assigned_id=admin_user.id  # Assigning it to our admin
        )

        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)

        print(
            f"Complaint created by {citizen_user.username} and assigned to {admin_user.username}")

        # 3. Add a Comment from the Admin to the Complaint
        new_comment = Comment(
            content="We have scheduled a crew to inspect this tomorrow.",
            complaint_id=new_complaint.id,
            user_id=admin_user.id
        )

        db.add(new_comment)
        db.commit()

        print("Initial comment added successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()