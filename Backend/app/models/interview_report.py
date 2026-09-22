from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class InterviewReportModel(Base):
    __tablename__ = "interview_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    session_id = Column(
        Integer,
        ForeignKey("interview_sessions.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    overall_score = Column(
        Float,
        nullable=True
    )

    technical_score = Column(
        Float,
        nullable=True
    )

    communication_score = Column(
        Float,
        nullable=True
    )

    strong_areas = Column(
        Text,
        nullable=True
    )

    weak_areas = Column(
        Text,
        nullable=True
    )

    missing_skills = Column(
        Text,
        nullable=True
    )

    interview_summary = Column(
        Text,
        nullable=True
    )

    hiring_recommendation = Column(
        Text,
        nullable=True
    )

    improvement_areas = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
