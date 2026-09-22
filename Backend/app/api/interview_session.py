from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.match_result import MatchResult
from app.models.interview_session import InterviewSession
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview Session"]
)


class InterviewSessionRequest(BaseModel):
    resume_id: int
    job_description_id: int
    match_result_id: int
    interview_type: str = "technical"


@router.post("/session")
async def create_interview_session(
    request: InterviewSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == request.resume_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    job_description = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == request.job_description_id,
            JobDescription.user_id == current_user.id
        )
        .first()
    )

    if not job_description:
        raise HTTPException(
            status_code=404,
            detail="Job description not found."
        )

    match_result = (
        db.query(MatchResult)
        .filter(
            MatchResult.id == request.match_result_id,
            MatchResult.user_id == current_user.id
        )
        .first()
    )

    if not match_result:
        raise HTTPException(
            status_code=404,
            detail="Match result not found."
        )

    try:
        session = InterviewSession(
            user_id=current_user.id,
            resume_id=resume.id,
            job_description_id=job_description.id,
            match_result_id=match_result.id,
            interview_type=request.interview_type,
            status="created"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return {
            "success": True,
            "session_id": session.id,
            "resume_id": session.resume_id,
            "job_description_id": session.job_description_id,
            "match_result_id": session.match_result_id,
            "interview_type": session.interview_type,
            "status": session.status
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Interview session creation failed: {str(e)}"
        )