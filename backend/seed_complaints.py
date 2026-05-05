from sqlalchemy.orm import Session
import random

from app.db.db import SessionLocal, engine, User, Complaint, Comment, Base


def seed_data():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # Get existing admin
        admin_user = db.query(User).filter(User.role == "Admin").first()

        if not admin_user:
            print("No admin found. Please create an admin user first.")
            return

        # Get existing citizens
        citizens = db.query(User).filter(User.role == "Citizen").all()

        if not citizens:
            print("No citizens found. Please create citizen users first.")
            return

        statuses = ["Pending", "In Progress", "For Review", "Closed"]

        complaints_data = [
            {
                "location": "123 Main St",
                "long": 121.05,
                "lat": 14.58,
                "description": "Large pothole blocking the lane.",
                "priority": "High",
                "tagging": "Road Maintenance",
            },
            {
                "location": "45 Mabini Ave",
                "long": 121.04,
                "lat": 14.57,
                "description": "Streetlight not working for three nights.",
                "priority": "Medium",
                "tagging": "Electrical",
            },
            {
                "location": "88 Rizal St",
                "long": 121.06,
                "lat": 14.59,
                "description": "Garbage pile not collected.",
                "priority": "Low",
                "tagging": "Waste Management",
            },
            {
                "location": "12 Bonifacio Road",
                "long": 121.03,
                "lat": 14.56,
                "description": "Flooding near drainage canal.",
                "priority": "High",
                "tagging": "Drainage",
            },
            {
                "location": "77 Luna Street",
                "long": 121.07,
                "lat": 14.60,
                "description": "Damaged sidewalk causing trip hazard.",
                "priority": "Medium",
                "tagging": "Sidewalk Repair",
            },
            {
                "location": "19 Aguinaldo Highway",
                "long": 121.08,
                "lat": 14.61,
                "description": "Illegal parking blocking traffic flow.",
                "priority": "Medium",
                "tagging": "Traffic Enforcement",
            },
            {
                "location": "32 Katipunan Ave",
                "long": 121.09,
                "lat": 14.62,
                "description": "Open manhole cover near pedestrian area.",
                "priority": "High",
                "tagging": "Public Safety",
            },
            {
                "location": "54 Quezon Blvd",
                "long": 121.02,
                "lat": 14.55,
                "description": "Tree branch blocking road signage.",
                "priority": "Low",
                "tagging": "Obstruction",
            },
            {
                "location": "101 Sampaguita St",
                "long": 121.01,
                "lat": 14.54,
                "description": "Noise complaint from construction activity.",
                "priority": "Low",
                "tagging": "Noise Complaint",
            },
            {
                "location": "66 Narra Road",
                "long": 121.10,
                "lat": 14.63,
                "description": "Broken traffic signal at intersection.",
                "priority": "High",
                "tagging": "Traffic Signal",
            },
        ]

        for index, data in enumerate(complaints_data):
            citizen_user = citizens[index % len(citizens)]

            new_complaint = Complaint(
                location=data["location"],
                long=data["long"],
                lat=data["lat"],
                status=random.choice(statuses),
                description=data["description"],
                priority=data["priority"],
                tagging=data["tagging"],
                user_id=citizen_user.id,
                assigned_id=admin_user.id
            )

            db.add(new_complaint)
            db.commit()
            db.refresh(new_complaint)

            print(
                f"Complaint created by {citizen_user.username} "
                f"and assigned to {admin_user.username} "
                f"with status {new_complaint.status}"
            )

            new_comment = Comment(
                content="Complaint received and is now under initial review.",
                complaint_id=new_complaint.id,
                user_id=admin_user.id
            )

            db.add(new_comment)
            db.commit()

        print("10 complaints added successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()