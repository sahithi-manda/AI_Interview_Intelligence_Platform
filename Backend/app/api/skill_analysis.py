import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.skill_analyzer import analyze_skills
from app.schemas.matching import MatchResult
from app.schemas.answer import AnswerEvaluation
from app.schemas.skill_analysis import SkillAnalysis

from app.database.database import get_db
from app.models.user import User
from app.models.interview_session import InterviewSession
from app.models.match_result import MatchResult as MatchResultModel
from app.models.interview_answer import InterviewAnswer
from app.models.skill_analysis import SkillAnalysisModel
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


class SkillAnalysisRequest(BaseModel):
    session_id: Optional[int] = None
    match_result: Optional[MatchResult] = None
    evaluations: Optional[list[AnswerEvaluation]] = None


@router.post(
    "/skill-analysis",
    response_model=SkillAnalysis
)
async def skill_analysis(
    request: SkillAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = None
        match_result = request.match_result
        evaluations = request.evaluations

        if request.session_id is not None:
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

            # Reconstruct MatchResult from database if not passed
            if match_result is None:
                mr_db = db.query(MatchResultModel).filter(
                    MatchResultModel.id == session.match_result_id,
                    MatchResultModel.user_id == current_user.id
                ).first()
                if not mr_db:
                    raise HTTPException(
                        status_code=400,
                        detail="Match result not found for this interview session."
                    )
                match_result = MatchResult(
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

            # Reconstruct AnswerEvaluations from all session answers if not passed
            if evaluations is None:
                answers = (
                    db.query(InterviewAnswer)
                    .filter(InterviewAnswer.session_id == session.id)
                    .order_by(InterviewAnswer.created_at.asc())
                    .all()
                )
                evaluations = [
                    AnswerEvaluation(
                        overall_score=ans.overall_score or 0.0,
                        technical_accuracy=ans.technical_accuracy or 0.0,
                        communication_score=ans.communication_score or 0.0,
                        strengths=json.loads(ans.strengths) if ans.strengths else [],
                        weaknesses=json.loads(ans.weaknesses) if ans.weaknesses else [],
                        missing_concepts=json.loads(ans.missing_concepts) if ans.missing_concepts else [],
                        feedback=ans.feedback or "",
                        suggested_improvement=ans.suggested_improvement or ""
                    )
                    for ans in answers
                ]

        if match_result is None:
            raise HTTPException(
                status_code=400,
                detail="Match result is required (provide in request or pass a valid session_id)."
            )

        if evaluations is None:
            evaluations = []

        # Run AI skill analysis
        result = analyze_skills(
            match_result=match_result,
            evaluations=evaluations
        )

        # Persist skill analysis in PostgreSQL
        if session:
            analysis_record = SkillAnalysisModel(
                session_id=session.id,
                user_id=current_user.id,
                strong_skills=json.dumps(result.strong_skills),
                weak_skills=json.dumps(result.weak_skills),
                missing_skills=json.dumps(result.missing_skills),
                technical_weaknesses=json.dumps(result.technical_weaknesses),
                communication_weaknesses=json.dumps(result.communication_weaknesses),
                priority_areas=json.dumps(result.priority_areas),
                overall_readiness_score=result.overall_readiness_score,
                summary=result.summary
            )
            db.add(analysis_record)
            db.commit()

        return result

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Skill analysis failed: {str(e)}"
        )