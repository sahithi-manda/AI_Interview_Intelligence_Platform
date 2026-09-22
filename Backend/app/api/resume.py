import os
import uuid
import json

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

from app.ai.resume_analyzer import (
    clean_resume_text,
    extract_resume_text,
    analyze_resume_with_ai,
)

from app.database.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/resumes",
    tags=["Resume"]
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    extension = os.path.splitext(file.filename)[1].lower()

    allowed_extensions = {".pdf", ".docx"}

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    file_id = str(uuid.uuid4())

    saved_filename = f"{file_id}{extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        saved_filename
    )

    try:
        contents = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        extracted_text = extract_resume_text(file_path)
        cleaned_text = clean_resume_text(extracted_text)

        if not cleaned_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume."
            )

        # Save resume and connect it to logged-in user
        resume = Resume(
            user_id=current_user.id,
            file_id=file_id,
            filename=file.filename,
            file_path=file_path,
            extracted_text=cleaned_text
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "file_type": extension,
            "text_length": len(cleaned_text),
            "extracted_text": cleaned_text
        }

    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    except Exception as error:

        db.rollback()

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(error)}"
        )


@router.post("/{file_id}/analyze")
async def analyze_resume(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze an uploaded resume using AI."""

    resume = (
        db.query(Resume)
        .filter(
            Resume.file_id == file_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    try:
        # Use text stored in PostgreSQL
        cleaned_text = resume.extracted_text

        if not cleaned_text:
            cleaned_text = clean_resume_text(
                extract_resume_text(resume.file_path)
            )

        profile = analyze_resume_with_ai(cleaned_text)

        # Store AI-generated candidate profile
        resume.candidate_profile = json.dumps(
            profile.model_dump()
        )

        db.commit()
        db.refresh(resume)

        return {
            "success": True,
            "file_id": file_id,
            "candidate_profile": profile.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Resume AI analysis failed: {str(error)}"
        )