from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func

from app.database.database import Base


class InterviewQuestion(Base):

    __tablename__ = "interview_questions"


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


    question = Column(
        Text,
        nullable=False
    )


    category = Column(
        String(100),
        nullable=False
    )


    difficulty = Column(
        String(50),
        nullable=False
    )


    skill = Column(
        String(100),
        nullable=True
    )


    reason = Column(
        Text,
        nullable=True
    )


    question_order = Column(
        Integer,
        nullable=False
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )