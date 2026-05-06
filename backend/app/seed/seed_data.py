from app.core.security import hash_password
from app.db.db import SessionLocal, User, BarangayInfo


def seed():
    db = SessionLocal()

    if not db.query(User).filter(User.email_address == "admin.a@alalai.test").first():
        db.add_all([
            User(
                username="Admin Zone A",
                email_address="admin.a@alalai.test",
                hashed_password=hash_password("password123"),
                role="admin",
                location_assigned="A,Zone 1,Purok 1",
            ),
            User(
                username="Admin Zone B",
                email_address="admin.b@alalai.test",
                hashed_password=hash_password("password123"),
                role="admin",
                location_assigned="B,Zone 2,Purok 2",
            ),
            User(
                username="Demo Citizen",
                email_address="citizen@alalai.test",
                hashed_password=hash_password("password123"),
                role="citizen",
            ),
        ])

    if not db.query(BarangayInfo).first():
        db.add_all([
            BarangayInfo(category="hotline", title="Barangay Office", content="0917-000-0000"),
            BarangayInfo(category="service", title="Garbage Collection", content="Monday, Wednesday, Friday morning"),
        ])

    db.commit()
    db.close()
    print("Seed complete")


if __name__ == "__main__":
    seed()
