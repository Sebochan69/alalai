from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
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
    location_area = Column(String, nullable=True)
    dispatch_reason = Column(String, nullable=True)
    ai_processed_complaint = Column(Text, nullable=True)
    possible_duplicate_complaint_id = Column(Integer, nullable=True)
    admin_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    date_resolved = Column(DateTime, nullable=True)

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

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class BarangayInfo(Base):
    __tablename__ = "barangay_info"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    title = Column(String)
    content = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)
