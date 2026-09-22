from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class ImprovementPlanModel(Base):
    __tablename__ = "improvement_plans"

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

    priority_skills = Column(
        Text,
        nullable=True
    )

    learning_goals = Column(
        Text,
        nullable=True
    )

    practice_areas = Column(
        Text,
        nullable=True
    )

    project_recommendations = Column(
        Text,
        nullable=True
    )

    interview_practice = Column(
        Text,
        nullable=True
    )

    short_term_goals = Column(
        Text,
        nullable=True
    )

    long_term_goals = Column(
        Text,
        nullable=True
    )

    personalized_plan = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
