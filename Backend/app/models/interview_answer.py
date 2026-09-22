from sqlalchemy import (
    Column,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func

from app.database.database import Base


class InterviewAnswer(Base):

    __tablename__ = "interview_answers"

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

    question_id = Column(
        Integer,
        ForeignKey("interview_questions.id"),
        nullable=False
    )

    answer = Column(
        Text,
        nullable=False
    )

    overall_score = Column(
        Float,
        nullable=True
    )

    technical_accuracy = Column(
        Float,
        nullable=True
    )

    communication_score = Column(
        Float,
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

    missing_concepts = Column(
        Text,
        nullable=True
    )

    feedback = Column(
        Text,
        nullable=True
    )

    suggested_improvement = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )