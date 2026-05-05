from app.db.db import SessionLocal, User, Role
import datetime

FICTIONAL_ADMINS = [
    {"name": "Elias Thorne", "email": "admin1@alalai.ai", "loc": ""},
    {"name": "Selena Vargas", "email": "admin2@alalai.ai", "loc": ""},
    {"name": "Marcus Chen", "email": "admin3@alalai.ai", "loc": ""},
    {"name": "Amina Okafor", "email": "admin4@alalai.ai", "loc": ""},
    {"name": "Julian Frost", "email": "admin5@alalai.ai", "loc": ""}
]

def seed_realistic_admins():
    db = SessionLocal()

    try:
        # 1. Ensure the Admin Role exists
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            admin_role = Role(name="Admin")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        # 2. Loop through our fictional list and create users
        for data in FICTIONAL_ADMINS:
            # Check if email already exists to avoid duplicates
            exists = db.query(User).filter(User.email_address == data["email"]).first()
            
            if not exists:
                # Generate a username based on the name (e.g., "elias_thorne")
                username = data["name"].lower().replace(" ", "_")
                
                new_user = User(
                    username=username,
                    email_address=data["email"],
                    hashed_password="!Password123", # Placeholder
                    location_assigned=data["loc"],
                    role_id=admin_role.id
                )
                db.add(new_user)
                print(f"Adding Admin: {data['name']} at {data['loc']}")

        db.commit()
        print("\n--- All fictional admins seeded successfully ---")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_realistic_admins()