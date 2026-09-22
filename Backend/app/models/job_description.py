from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"

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

    job_title = Column(
        String(255),
        nullable=True
    )

    company = Column(
        String(255),
        nullable=True
    )

    raw_text = Column(
        Text,
        nullable=False
    )

    analyzed_data = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )