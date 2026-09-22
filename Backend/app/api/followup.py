import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.followup_generator import generate_follow_up
from app.schemas.answer import AnswerEvaluation
from app.schemas.followup import FollowUpResponse
from app.database.database import get_db
from app.models.user import User
from app.models.interview_session import InterviewSession
from app.models.interview_question import InterviewQuestion
from app.models.interview_answer import InterviewAnswer
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"]
)


class FollowUpRequest(BaseModel):
    session_id: Optional[int] = None
    question_id: Optional[int] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    evaluation: Optional[AnswerEvaluation] = None
    skill: str = ""
    difficulty: str = ""


@router.post(
    "/follow-up",
    response_model=FollowUpResponse
)
async def generate_follow_up_question(
    request: FollowUpRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = None
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

        q_text = request.question
        ans_text = request.answer
        eval_obj = request.evaluation
        skill = request.skill
        difficulty = request.difficulty

        if request.question_id is not None:
            question_rec = (
                db.query(InterviewQuestion)
                .filter(InterviewQuestion.id == request.question_id)
                .first()
            )
            if not question_rec:
                raise HTTPException(
                    status_code=404,
                    detail="Interview question not found."
                )
            if session and question_rec.session_id != session.id:
                raise HTTPException(
                    status_code=400,
                    detail="Question does not belong to the specified session."
                )

            if not q_text:
                q_text = question_rec.question
            if not skill and question_rec.skill:
                skill = question_rec.skill
            if not difficulty and question_rec.difficulty:
                difficulty = question_rec.difficulty

            if eval_obj is None or not ans_text:
                latest_ans = (
                    db.query(InterviewAnswer)
                    .filter(InterviewAnswer.question_id == question_rec.id)
                    .order_by(InterviewAnswer.created_at.desc())
                    .first()
                )
                if latest_ans:
                    if not ans_text:
                        ans_text = latest_ans.answer
                    if eval_obj is None:
                        eval_obj = AnswerEvaluation(
                            overall_score=latest_ans.overall_score or 0.0,
                            technical_accuracy=latest_ans.technical_accuracy or 0.0,
                            communication_score=latest_ans.communication_score or 0.0,
                            strengths=json.loads(latest_ans.strengths) if latest_ans.strengths else [],
                            weaknesses=json.loads(latest_ans.weaknesses) if latest_ans.weaknesses else [],
                            missing_concepts=json.loads(latest_ans.missing_concepts) if latest_ans.missing_concepts else [],
                            feedback=latest_ans.feedback or "",
                            suggested_improvement=latest_ans.suggested_improvement or ""
                        )

        if not q_text:
            raise HTTPException(
                status_code=400,
                detail="Previous question text is required."
            )
        if not ans_text:
            raise HTTPException(
                status_code=400,
                detail="Candidate answer is required."
            )
        if eval_obj is None:
            raise HTTPException(
                status_code=400,
                detail="Answer evaluation is required."
            )

        result = generate_follow_up(
            question=q_text,
            answer=ans_text,
            evaluation=eval_obj,
            skill=skill,
            difficulty=difficulty
        )

        # Persist follow-up question if session is identified
        if session:
            max_order_query = (
                db.query(InterviewQuestion.question_order)
                .filter(InterviewQuestion.session_id == session.id)
                .order_by(InterviewQuestion.question_order.desc())
                .first()
            )
            next_order = (max_order_query[0] if max_order_query else 0) + 1

            follow_up_db = InterviewQuestion(
                session_id=session.id,
                question=result.follow_up.question,
                category=result.follow_up.category or "Follow-up",
                difficulty=result.follow_up.difficulty or "Medium",
                skill=result.follow_up.skill or skill,
                reason=result.follow_up.reason,
                question_order=next_order
            )
            db.add(follow_up_db)
            db.commit()

        return result

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Follow-up generation failed: {str(e)}"
        )