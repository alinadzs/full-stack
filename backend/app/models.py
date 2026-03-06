from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# ================= USERS =================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)

    # связи
    meetings = relationship("Meeting", back_populates="owner")
    tasks = relationship("Task", back_populates="assigned_user")


# ================= MEETINGS =================
class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    meeting_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))

    # связи
    owner = relationship("User", back_populates="meetings")
    tasks = relationship(
        "Task",
        back_populates="meeting",
        cascade="all, delete"
    )


# ================= TASKS =================
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="pending")
    deadline = Column(Date)

    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))

    # связи
    meeting = relationship("Meeting", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")