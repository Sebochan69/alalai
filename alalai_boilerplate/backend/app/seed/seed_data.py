from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.models import User, BarangayInfo


def seed():
    db = SessionLocal()

    if not db.query(User).filter(User.email == "admin.a@alalai.test").first():
        db.add_all([
            User(
                full_name="Admin Zone A",
                email="admin.a@alalai.test",
                hashed_password=hash_password("password123"),
                role="admin",
                assigned_locations="A,Zone 1,Purok 1",
            ),
            User(
                full_name="Admin Zone B",
                email="admin.b@alalai.test",
                hashed_password=hash_password("password123"),
                role="admin",
                assigned_locations="B,Zone 2,Purok 2",
            ),
            User(
                full_name="Demo Citizen",
                email="citizen@alalai.test",
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
