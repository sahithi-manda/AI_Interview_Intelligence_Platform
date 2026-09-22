import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.ai.answer_evaluator import evaluate_answer
from app.schemas.answer import AnswerEvaluation

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


class AnswerEvaluationRequest(BaseModel):
    session_id: int
    question_id: int
    answer: str
    question: Optional[str] = None
    skill: Optional[str] = ""
    difficulty: Optional[str] = ""


@router.post(
    "/evaluate",
    response_model=AnswerEvaluation
)
async def evaluate_candidate_answer(
    request: AnswerEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # --------------------------------
        # CHECK INTERVIEW SESSION & OWNERSHIP
        # --------------------------------
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

        # --------------------------------
        # CHECK QUESTION & SESSION BELONGING
        # --------------------------------
        question = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.id == request.question_id,
                InterviewQuestion.session_id == request.session_id
            )
            .first()
        )

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Interview question not found in this session."
            )

        # --------------------------------
        # VALIDATE ANSWER
        # --------------------------------
        if not request.answer or not request.answer.strip():
            raise HTTPException(
                status_code=400,
                detail="Answer cannot be empty."
            )

        q_text = request.question.strip() if request.question and request.question.strip() else question.question
        q_skill = request.skill if request.skill else (question.skill or "")
        q_difficulty = request.difficulty if request.difficulty else (question.difficulty or "")

        # --------------------------------
        # AI EVALUATION
        # --------------------------------
        result = evaluate_answer(
            question=q_text,
            answer=request.answer,
            skill=q_skill,
            difficulty=q_difficulty
        )

        # --------------------------------
        # SAVE ANSWER + EVALUATION TO DATABASE
        # --------------------------------
        interview_answer = InterviewAnswer(
            session_id=request.session_id,
            question_id=request.question_id,
            answer=request.answer,
            overall_score=result.overall_score,
            technical_accuracy=result.technical_accuracy,
            communication_score=result.communication_score,
            strengths=json.dumps(result.strengths),
            weaknesses=json.dumps(result.weaknesses),
            missing_concepts=json.dumps(result.missing_concepts),
            feedback=result.feedback,
            suggested_improvement=result.suggested_improvement
        )

        db.add(interview_answer)

        # Update session status
        if session.status == "created":
            session.status = "in_progress"

        db.commit()
        db.refresh(interview_answer)

        # --------------------------------
        # RETURN AI EVALUATION
        # --------------------------------
        return result

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Answer evaluation failed: {str(e)}"
        )