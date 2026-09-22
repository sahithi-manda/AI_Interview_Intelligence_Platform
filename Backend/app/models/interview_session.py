from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

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

    match_result_id = Column(
        Integer,
        ForeignKey("match_results.id"),
        nullable=False
    )

    status = Column(
        String(50),
        default="created",
        nullable=False
    )

    interview_type = Column(
        String(50),
        default="technical",
        nullable=False
    )

    overall_score = Column(
        Integer,
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