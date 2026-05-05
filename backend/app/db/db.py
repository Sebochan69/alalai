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
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email_address = Column(String, unique=True)
    hashed_password = Column(String)
    location_assigned = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # RELATIONSHIPS:
    complaints = relationship("Complaint", back_populates="created_by", foreign_keys="[Complaint.user_id]")
    assigned_tasks = relationship("Complaint", back_populates="assigned_to", foreign_keys="[Complaint.assigned_id]")
    comments = relationship("Comment", back_populates="author")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String)
    long = Column(Float)
    lat = Column(Float)
    status = Column(String, default="Pending")
    description = Column(String)
    priority = Column(String, nullable=True)
    media = Column(String, nullable=True)
    tagging = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # FOREIGN KEY: Points to the User who created the complaint
    user_id = Column(Integer, ForeignKey("users.id"))
    assigned_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # RELATIONSHIP: Access the user object via 'complaint_instance.created_by'
    created_by = relationship("User", back_populates="complaints", foreign_keys=[user_id])
    assigned_to = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_id])

    comments = relationship("Comment", back_populates="complaint", cascade="all, delete-orphan")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, index=True) # e.g., "2026-05"
    overall_complaint_count = Column(Integer)
    overall_completion_rate = Column(Integer)
    forecast = Column(String)
    avg_solution_days = Column(Integer)
    category_breakdown = Column(String)
    suggest_actions = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    complaint = relationship("Complaint", back_populates="comments")
    author = relationship("User", back_populates="comments")
