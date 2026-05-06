from sqlalchemy.orm import Session
from datetime import datetime
from passlib.context import CryptContext
from app.db.db import SessionLocal, engine, User, Complaint, Comment, Base


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        demo_users_data = [
            {
                "username": "citizen_sebo",
                "email": "smilebigsun@yahoo.com",
                "password": get_password_hash("sebo123"),
                "location": "Project 6, Quezon City",
                "role": "Citizen"
            },
            {
                "username": "admin_diane",
                "email": "dianecoding@gmail.com",
                "password": get_password_hash("diane123"),
                "location": "Project 6, Quezon City",
                "role": "Admin"
            },
            {
                "username": "citizen_yughie",
                "email": "yughiep@gmail.com",
                "password": get_password_hash("yughie123"),
                "location": "Project 6, Quezon City",
                "role": "Citizen"
            },
            {
                "username": "admin_dan",
                "email": "pelasod@gmail.com",
                "password": get_password_hash("dan123"),
                "location": "Project 6, Quezon City",
                "role": "Admin"
            }
        ]

        created_users_map = {}

        for u_data in demo_users_data:
            existing_user = db.query(User).filter(User.email_address == u_data["email"]).first()
            
            if not existing_user:
                user = User(
                    username=u_data["username"],
                    email_address=u_data["email"],
                    hashed_password=u_data["password"],
                    location_assigned=u_data["location"],
                    role=u_data["role"]
                )
                db.add(user)
                db.flush() # Para makuha ang ID bago mag-commit
                created_users_map[u_data["username"]] = user
            else:
                print(f"User {u_data['email']} already exists. Skipping...")
                created_users_map[u_data["username"]] = existing_user

        db.commit()
        print(f"Successfully synced {len(demo_users_data)} demo users.")

        # --- SAMPLE COMPLAINT LOGIC ---
        sample_desc = "Broken street light at the corner of Project 6."
        existing_complaint = db.query(Complaint).filter(Complaint.description == sample_desc).first()

        if not existing_complaint:
            # Gagamitin natin si Sebo bilang sender at si Diane bilang assigned Admin
            sebo = created_users_map.get("citizen_sebo")
            diane = created_users_map.get("admin_diane")

            if sebo and diane:
                new_complaint = Complaint(
                    location="Project 6, Quezon City",
                    long=121.03,
                    lat=14.66,
                    status="Pending",
                    description=sample_desc,
                    priority="High",
                    tagging="Electrical/Public Lighting",
                    user_id=sebo.id,
                    assigned_id=diane.id
                )
                db.add(new_complaint)
                db.flush()

                # Initial comment mula kay Diane
                new_comment = Comment(
                    content="Hello Sebo, we have received your report. A team will be dispatched to Project 6 tomorrow.",
                    complaint_id=new_complaint.id,
                    user_id=diane.id
                )
                db.add(new_comment)
                db.commit()
                print(f"Sample complaint and comment created for {sebo.username} assigned to {diane.username}")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
