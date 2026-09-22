import json

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ai.jd_analyzer import analyze_jd_with_ai
from app.database.database import get_db
from app.models.job_description import JobDescription
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/jd",
    tags=["Job Description"]
)


class JDRequest(BaseModel):
    text: str


@router.post("/analyze")
async def analyze_jd(
    request: JDRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    try:
        result = analyze_jd_with_ai(request.text)

        job_description = JobDescription(
            user_id=current_user.id,
            job_title=result.job_title,
            company=result.company,
            raw_text=request.text,
            analyzed_data=json.dumps(result.model_dump())
        )

        db.add(job_description)
        db.commit()
        db.refresh(job_description)

        return {
            "success": True,
            "job_description_id": job_description.id,
            "analysis": result.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Job description analysis failed: {str(error)}"
        )