import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.improvement_generator import generate_improvement_plan
from app.schemas.skill_analysis import SkillAnalysis
from app.schemas.interview_report import InterviewReport
from app.schemas.improvement import ImprovementPlan

from app.database.database import get_db
from app.models.user import User
from app.models.interview_session import InterviewSession
from app.models.skill_analysis import SkillAnalysisModel
from app.models.interview_report import InterviewReportModel
from app.models.improvement_plan import ImprovementPlanModel
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


class ImprovementPlanRequest(BaseModel):
    session_id: Optional[int] = None
    skill_analysis: Optional[SkillAnalysis] = None
    interview_report: Optional[InterviewReport] = None


@router.post(
    "/improvement-plan",
    response_model=ImprovementPlan
)
async def generate_improvement_plan_api(
    request: ImprovementPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = None
        skill_analysis = request.skill_analysis
        interview_report = request.interview_report

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

            # Reconstruct SkillAnalysis if not provided
            if skill_analysis is None:
                sa_db = (
                    db.query(SkillAnalysisModel)
                    .filter(SkillAnalysisModel.session_id == session.id)
                    .order_by(SkillAnalysisModel.created_at.desc())
                    .first()
                )
                if sa_db:
                    skill_analysis = SkillAnalysis(
                        strong_skills=json.loads(sa_db.strong_skills) if sa_db.strong_skills else [],
                        weak_skills=json.loads(sa_db.weak_skills) if sa_db.weak_skills else [],
                        missing_skills=json.loads(sa_db.missing_skills) if sa_db.missing_skills else [],
                        technical_weaknesses=json.loads(sa_db.technical_weaknesses) if sa_db.technical_weaknesses else [],
                        communication_weaknesses=json.loads(sa_db.communication_weaknesses) if sa_db.communication_weaknesses else [],
                        priority_areas=json.loads(sa_db.priority_areas) if sa_db.priority_areas else [],
                        overall_readiness_score=sa_db.overall_readiness_score or 0.0,
                        summary=sa_db.summary or ""
                    )

            # Reconstruct InterviewReport if not provided
            if interview_report is None:
                rep_db = (
                    db.query(InterviewReportModel)
                    .filter(InterviewReportModel.session_id == session.id)
                    .order_by(InterviewReportModel.created_at.desc())
                    .first()
                )
                if rep_db:
                    interview_report = InterviewReport(
                        overall_score=rep_db.overall_score or 0.0,
                        technical_score=rep_db.technical_score or 0.0,
                        communication_score=rep_db.communication_score or 0.0,
                        strong_areas=json.loads(rep_db.strong_areas) if rep_db.strong_areas else [],
                        weak_areas=json.loads(rep_db.weak_areas) if rep_db.weak_areas else [],
                        missing_skills=json.loads(rep_db.missing_skills) if rep_db.missing_skills else [],
                        interview_summary=rep_db.interview_summary or "",
                        hiring_recommendation=rep_db.hiring_recommendation or "",
                        improvement_areas=json.loads(rep_db.improvement_areas) if rep_db.improvement_areas else []
                    )

        if skill_analysis is None:
            raise HTTPException(
                status_code=400,
                detail="Skill analysis is required (provide in request or ensure skill analysis exists for session)."
            )
        if interview_report is None:
            raise HTTPException(
                status_code=400,
                detail="Interview report is required (provide in request or ensure interview report exists for session)."
            )

        result = generate_improvement_plan(
            skill_analysis=skill_analysis,
            interview_report=interview_report
        )

        # Persist improvement plan
        if session:
            plan_rec = ImprovementPlanModel(
                session_id=session.id,
                user_id=current_user.id,
                priority_skills=json.dumps(result.priority_skills),
                learning_goals=json.dumps(result.learning_goals),
                practice_areas=json.dumps(result.practice_areas),
                project_recommendations=json.dumps(result.project_recommendations),
                interview_practice=json.dumps(result.interview_practice),
                short_term_goals=json.dumps(result.short_term_goals),
                long_term_goals=json.dumps(result.long_term_goals),
                personalized_plan=result.personalized_plan
            )
            db.add(plan_rec)
            db.commit()

        return result

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Improvement plan generation failed: {str(e)}"
        )