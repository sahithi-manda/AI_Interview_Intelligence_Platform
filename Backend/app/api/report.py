import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.report_generator import generate_interview_report
from app.ai.skill_analyzer import analyze_skills
from app.schemas.answer import AnswerEvaluation
from app.schemas.matching import MatchResult
from app.schemas.skill_analysis import SkillAnalysis
from app.schemas.interview_report import InterviewReport

from app.database.database import get_db
from app.models.user import User
from app.models.interview_session import InterviewSession
from app.models.match_result import MatchResult as MatchResultModel
from app.models.interview_answer import InterviewAnswer
from app.models.skill_analysis import SkillAnalysisModel
from app.models.interview_report import InterviewReportModel
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


class InterviewReportRequest(BaseModel):
    session_id: Optional[int] = None
    match_result: Optional[MatchResult] = None
    skill_analysis: Optional[SkillAnalysis] = None
    evaluations: Optional[list[AnswerEvaluation]] = None


@router.post(
    "/report",
    response_model=InterviewReport
)
async def generate_report(
    request: InterviewReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = None
        match_result = request.match_result
        skill_analysis = request.skill_analysis
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

            # Reconstruct MatchResult if missing
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

            # Reconstruct evaluations from answers if missing
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

            # Reconstruct or generate SkillAnalysis if missing
            if skill_analysis is None:
                latest_sa = (
                    db.query(SkillAnalysisModel)
                    .filter(SkillAnalysisModel.session_id == session.id)
                    .order_by(SkillAnalysisModel.created_at.desc())
                    .first()
                )
                if latest_sa:
                    skill_analysis = SkillAnalysis(
                        strong_skills=json.loads(latest_sa.strong_skills) if latest_sa.strong_skills else [],
                        weak_skills=json.loads(latest_sa.weak_skills) if latest_sa.weak_skills else [],
                        missing_skills=json.loads(latest_sa.missing_skills) if latest_sa.missing_skills else [],
                        technical_weaknesses=json.loads(latest_sa.technical_weaknesses) if latest_sa.technical_weaknesses else [],
                        communication_weaknesses=json.loads(latest_sa.communication_weaknesses) if latest_sa.communication_weaknesses else [],
                        priority_areas=json.loads(latest_sa.priority_areas) if latest_sa.priority_areas else [],
                        overall_readiness_score=latest_sa.overall_readiness_score or 0.0,
                        summary=latest_sa.summary or ""
                    )
                else:
                    skill_analysis = analyze_skills(
                        match_result=match_result,
                        evaluations=evaluations
                    )
                    sa_rec = SkillAnalysisModel(
                        session_id=session.id,
                        user_id=current_user.id,
                        strong_skills=json.dumps(skill_analysis.strong_skills),
                        weak_skills=json.dumps(skill_analysis.weak_skills),
                        missing_skills=json.dumps(skill_analysis.missing_skills),
                        technical_weaknesses=json.dumps(skill_analysis.technical_weaknesses),
                        communication_weaknesses=json.dumps(skill_analysis.communication_weaknesses),
                        priority_areas=json.dumps(skill_analysis.priority_areas),
                        overall_readiness_score=skill_analysis.overall_readiness_score,
                        summary=skill_analysis.summary
                    )
                    db.add(sa_rec)
                    db.commit()

        if match_result is None:
            raise HTTPException(
                status_code=400,
                detail="Match result is required (provide in request or pass a valid session_id)."
            )
        if skill_analysis is None:
            raise HTTPException(
                status_code=400,
                detail="Skill analysis is required (provide in request or pass a valid session_id)."
            )
        if evaluations is None:
            evaluations = []

        result = generate_interview_report(
            match_result=match_result,
            skill_analysis=skill_analysis,
            evaluations=evaluations
        )

        # Persist report and update session
        if session:
            report_rec = InterviewReportModel(
                session_id=session.id,
                user_id=current_user.id,
                overall_score=result.overall_score,
                technical_score=result.technical_score,
                communication_score=result.communication_score,
                strong_areas=json.dumps(result.strong_areas),
                weak_areas=json.dumps(result.weak_areas),
                missing_skills=json.dumps(result.missing_skills),
                interview_summary=result.interview_summary,
                hiring_recommendation=result.hiring_recommendation,
                improvement_areas=json.dumps(result.improvement_areas)
            )
            db.add(report_rec)

            session.status = "completed"
            try:
                session.overall_score = int(round(result.overall_score))
            except Exception:
                session.overall_score = None
            session.summary = result.interview_summary

            db.commit()

        return result

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Interview report generation failed: {str(e)}"
        )