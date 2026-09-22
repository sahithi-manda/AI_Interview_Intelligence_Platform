from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False
    )

    job_description_id = Column(
        Integer,
        ForeignKey("job_descriptions.id"),
        nullable=False
    )

    overall_match = Column(
        Float,
        nullable=True
    )

    skills_match = Column(
        Float,
        nullable=True
    )

    experience_match = Column(
        Float,
        nullable=True
    )

    education_match = Column(
        Float,
        nullable=True
    )

    matched_skills = Column(
        Text,
        nullable=True
    )

    missing_skills = Column(
        Text,
        nullable=True
    )

    strengths = Column(
        Text,
        nullable=True
    )

    weaknesses = Column(
        Text,
        nullable=True
    )

    recommendations = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )