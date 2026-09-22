import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.ai.matching_engine import match_resume_with_jd
from app.schemas.resume import CandidateProfile
from app.schemas.jd import JobDescription

from app.database.database import get_db
from app.models.resume import Resume
from app.models.job_description import JobDescription as JobDescriptionModel
from app.models.match_result import MatchResult
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/matching",
    tags=["Matching"]
)


class MatchingRequest(BaseModel):
    resume_id: Optional[int] = None
    job_description_id: Optional[int] = None
    candidate: Optional[CandidateProfile] = None
    job: Optional[JobDescription] = None


@router.post("/analyze")
async def analyze_matching(
    request: MatchingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Resolve Resume: use specific ID if provided, otherwise fallback to latest
        if request.resume_id is not None:
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
                    detail="Specified resume not found or access denied."
                )
        else:
            resume = (
                db.query(Resume)
                .filter(Resume.user_id == current_user.id)
                .order_by(Resume.created_at.desc())
                .first()
            )
            if not resume:
                raise HTTPException(
                    status_code=404,
                    detail="No resume found for this user."
                )

        # Resolve Job Description: use specific ID if provided, otherwise fallback to latest
        if request.job_description_id is not None:
            job_description = (
                db.query(JobDescriptionModel)
                .filter(
                    JobDescriptionModel.id == request.job_description_id,
                    JobDescriptionModel.user_id == current_user.id
                )
                .first()
            )
            if not job_description:
                raise HTTPException(
                    status_code=404,
                    detail="Specified job description not found or access denied."
                )
        else:
            job_description = (
                db.query(JobDescriptionModel)
                .filter(JobDescriptionModel.user_id == current_user.id)
                .order_by(JobDescriptionModel.created_at.desc())
                .first()
            )
            if not job_description:
                raise HTTPException(
                    status_code=404,
                    detail="No job description found for this user."
                )

        # Resolve CandidateProfile
        candidate = request.candidate
        if candidate is None:
            if resume.candidate_profile:
                try:
                    candidate = CandidateProfile.model_validate_json(resume.candidate_profile)
                except Exception:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid candidate profile data in resume record."
                    )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Candidate profile not provided and resume has not been analyzed yet."
                )

        # Resolve JobDescription schema
        job = request.job
        if job is None:
            if job_description.analyzed_data:
                try:
                    job = JobDescription.model_validate_json(job_description.analyzed_data)
                except Exception:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid analyzed data in job description record."
                    )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Job description profile not provided and job description has not been analyzed yet."
                )

        # Run AI matching
        result = match_resume_with_jd(
            candidate=candidate,
            job=job
        )

        # Save matching result to database
        match_result = MatchResult(
            user_id=current_user.id,
            resume_id=resume.id,
            job_description_id=job_description.id,
            overall_match=result.overall_match,
            skills_match=result.skills_match,
            experience_match=result.experience_match,
            education_match=result.education_match,
            matched_skills=json.dumps(result.matched_skills),
            missing_skills=json.dumps(result.missing_skills),
            strengths=json.dumps(result.strengths),
            weaknesses=json.dumps(result.weaknesses),
            recommendations=json.dumps(result.recommendations)
        )

        db.add(match_result)
        db.commit()
        db.refresh(match_result)

        return {
            "success": True,
            "match_result_id": match_result.id,
            "resume_id": resume.id,
            "job_description_id": job_description.id,
            "match_result": result.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Matching analysis failed: {str(error)}"
        )