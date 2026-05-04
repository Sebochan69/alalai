from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime as datetime
from sqlalchemy.orm import relationship

# 1. Define the SQLite connection URL
DATABASE_URL = "sqlite:///./alalai.db"

# 2. Create the engine and session factory
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class for models
Base = declarative_base()

# 4. Define a Model (This becomes a Table)
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    # RELATIONSHIP: Access all users with this role via 'role_instance.users'
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email_address = Column(String, unique=True)
    hashed_password = Column(String)
    location_assigned = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # FOREIGN KEY: Points to Role table
    role_id = Column(Integer, ForeignKey("roles.id"))
    
    # RELATIONSHIPS:
    role = relationship("Role", back_populates="users")
    complaints = relationship("Complaint", back_populates="created_by")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String)
    long = Column(Float)
    lat = Column(Float)
    status = Column(String, default="Pending")
    description = Column(String)
    priority = Column(String)
    media = Column(String, nullable=True)

    # FOREIGN KEY: Points to the User who created the complaint
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # RELATIONSHIP: Access the user object via 'complaint_instance.created_by'
    created_by = relationship("User", back_populates="complaints")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, index=True) # e.g., "2026-05"
    overall_complaint_count = Column(Integer)
    overall_completion_rate = Column(Integer)
    forecast = Column(String)
    suggest_actions = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
