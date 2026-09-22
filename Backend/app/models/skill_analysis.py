from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class SkillAnalysisModel(Base):
    __tablename__ = "skill_analyses"

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

    strong_skills = Column(
        Text,
        nullable=True
    )

    weak_skills = Column(
        Text,
        nullable=True
    )

    missing_skills = Column(
        Text,
        nullable=True
    )

    technical_weaknesses = Column(
        Text,
        nullable=True
    )

    communication_weaknesses = Column(
        Text,
        nullable=True
    )

    priority_areas = Column(
        Text,
        nullable=True
    )

    overall_readiness_score = Column(
        Float,
        nullable=True
    )

    summary = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
