import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.interview_generator import generate_interview_questions

from app.schemas.resume import CandidateProfile
from app.schemas.jd import JobDescription
from app.schemas.matching import MatchResult

from app.database.database import get_db

from app.models.interview_session import InterviewSession
from app.models.interview_question import InterviewQuestion
from app.models.resume import Resume
from app.models.job_description import JobDescription as JobDescriptionModel
from app.models.match_result import MatchResult as MatchResultModel
from app.models.user import User

from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


class InterviewGenerationRequest(BaseModel):
    session_id: int
    candidate: Optional[CandidateProfile] = None
    job: Optional[JobDescription] = None
    match_result: Optional[MatchResult] = None


@router.post("/questions")
async def generate_questions(
    request: InterviewGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # -----------------------------
        # FIND AND VALIDATE INTERVIEW SESSION
        # -----------------------------
        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == request.session_id,
                InterviewSession.user_id == current_user.id
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Interview session not found or access denied."
            )

        # -----------------------------
        # RESOLVE CANDIDATE PROFILE
        # -----------------------------
        candidate = request.candidate
        if candidate is None:
            resume = db.query(Resume).filter(
                Resume.id == session.resume_id,
                Resume.user_id == current_user.id
            ).first()
            if not resume or not resume.candidate_profile:
                raise HTTPException(
                    status_code=400,
                    detail="Candidate profile not provided and resume has no analyzed profile."
                )
            try:
                candidate = CandidateProfile.model_validate_json(resume.candidate_profile)
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to parse candidate profile from resume."
                )

        # -----------------------------
        # RESOLVE JOB DESCRIPTION
        # -----------------------------
        job = request.job
        if job is None:
            job_desc = db.query(JobDescriptionModel).filter(
                JobDescriptionModel.id == session.job_description_id,
                JobDescriptionModel.user_id == current_user.id
            ).first()
            if not job_desc or not job_desc.analyzed_data:
                raise HTTPException(
                    status_code=400,
                    detail="Job description profile not provided and job has no analyzed data."
                )
            try:
                job = JobDescription.model_validate_json(job_desc.analyzed_data)
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to parse job description data."
                )

        # -----------------------------
        # RESOLVE MATCH RESULT
        # -----------------------------
        match_res = request.match_result
        if match_res is None:
            mr_db = db.query(MatchResultModel).filter(
                MatchResultModel.id == session.match_result_id,
                MatchResultModel.user_id == current_user.id
            ).first()
            if not mr_db:
                raise HTTPException(
                    status_code=400,
                    detail="Match result not found for this interview session."
                )
            match_res = MatchResult(
                overall_match=mr_db.overall_match or 0.0,
                skills_match=mr_db.skills_match or 0.0,
                experience_match=mr_db.experience_match or 0.0,
                education_match=mr_db.education_match or 0.0,
                matched_skills=json.loads(mr_db.matched_skills) if mr_db.matched_skills else [],
                missing_skills=json.loads(mr_db.missing_skills) if mr_db.missing_skills else [],
                strengths=json.loads(mr_db.strengths) if mr_db.strengths else [],
                weaknesses=json.loads(mr_db.weaknesses) if mr_db.weaknesses else [],
                recommendations=json.loads(mr_db.recommendations) if mr_db.recommendations else []
            )

        # -----------------------------
        # GENERATE QUESTIONS USING AI
        # -----------------------------
        result = generate_interview_questions(
            candidate=candidate,
            job=job,
            match_result=match_res
        )

        # -----------------------------
        # SAVE QUESTIONS
        # -----------------------------
        saved_questions = []

        # Find current highest question order in session
        max_order_query = (
            db.query(InterviewQuestion.question_order)
            .filter(InterviewQuestion.session_id == session.id)
            .order_by(InterviewQuestion.question_order.desc())
            .first()
        )
        start_order = (max_order_query[0] if max_order_query else 0) + 1

        for index, question in enumerate(result.questions, start=start_order):
            db_question = InterviewQuestion(
                session_id=session.id,
                question=question.question,
                category=question.category,
                difficulty=question.difficulty,
                skill=question.skill,
                reason=question.reason,
                question_order=index
            )
            db.add(db_question)
            saved_questions.append(db_question)

        # Update session status to in_progress if currently created
        if session.status == "created":
            session.status = "in_progress"

        db.commit()

        for question in saved_questions:
            db.refresh(question)

        return {
            "success": True,
            "session_id": session.id,
            "question_count": len(saved_questions),
            "questions": [
                {
                    "id": question.id,
                    "question": question.question,
                    "category": question.category,
                    "difficulty": question.difficulty,
                    "skill": question.skill,
                    "reason": question.reason,
                    "question_order": question.question_order
                }
                for question in saved_questions
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Interview question generation failed: {str(e)}"
        )