# from datetime import datetime
# from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
# from sqlalchemy.orm import relationship

# from app.db.base import Base


# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     full_name = Column(String, nullable=False)
#     email = Column(String, unique=True, index=True, nullable=False)
#     hashed_password = Column(String, nullable=False)
#     role = Column(String, nullable=False, default="citizen")
#     assigned_locations = Column(String, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)

#     reports = relationship("Report", foreign_keys="Report.citizen_id", back_populates="citizen")


# class Report(Base):
#     __tablename__ = "reports"

#     id = Column(Integer, primary_key=True, index=True)
#     citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     assigned_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

#     address = Column(String, nullable=False)
#     location_area = Column(String, nullable=True)
#     latitude = Column(Float, nullable=True)
#     longitude = Column(Float, nullable=True)
#     description = Column(Text, nullable=False)
#     photo_path = Column(String, nullable=True)

#     tag = Column(String, nullable=True)
#     priority = Column(String, nullable=True)
#     ai_summary = Column(Text, nullable=True)
#     dispatch_reason = Column(Text, nullable=True)
#     ai_processed_complaint = Column(Text, nullable=True)
#     possible_duplicate_report_id = Column(Integer, nullable=True)

#     status = Column(String, default="pending")
#     admin_comment = Column(Text, nullable=True)

#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow)

#     citizen = relationship("User", foreign_keys=[citizen_id], back_populates="reports")
#     assigned_admin = relationship("User", foreign_keys=[assigned_admin_id])


# class Notification(Base):
#     __tablename__ = "notifications"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     title = Column(String, nullable=False)
#     message = Column(Text, nullable=False)
#     is_read = Column(Boolean, default=False)
#     created_at = Column(DateTime, default=datetime.utcnow)


# class ChatMessage(Base):
#     __tablename__ = "chat_messages"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
#     role = Column(String, nullable=False)
#     content = Column(Text, nullable=False)
#     created_at = Column(DateTime, default=datetime.utcnow)


# class BarangayInfo(Base):
#     __tablename__ = "barangay_info"

#     id = Column(Integer, primary_key=True, index=True)
#     category = Column(String, nullable=False)
#     title = Column(String, nullable=False)
#     content = Column(Text, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow)
