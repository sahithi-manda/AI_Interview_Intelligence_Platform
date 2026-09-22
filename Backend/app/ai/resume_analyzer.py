import time
from pathlib import Path

from PyPDF2 import PdfReader
from docx import Document
from google import genai
from google.genai import types

from app.schemas.resume import CandidateProfile
from app.core.config import settings


def extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)

    text = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text.append(page_text)

    return "\n".join(text)


def extract_docx_text(file_path: str) -> str:
    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text)

    return "\n".join(text)


def extract_resume_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    raise ValueError(
        "Unsupported file format. Use PDF or DOCX."
    )


def clean_resume_text(text: str) -> str:
    lines = []

    for line in text.splitlines():
        line = " ".join(line.split())

        if line:
            lines.append(line)

    return "\n".join(lines)


def analyze_resume_with_ai(resume_text: str) -> CandidateProfile:
    """
    Analyze resume text using Gemini
    and return a structured candidate profile.
    """

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert technical recruiter and resume analyzer.

Analyze the following resume and extract a structured candidate profile.

Rules:
- Extract only information supported by the resume.
- Do not invent skills, experience, education, projects,
  certifications, achievements, or any other information.
- If information is missing, return an empty value.
- Keep the summary concise and professional.
- Extract technical and programming skills accurately.
- Extract projects with their technologies.
- Extract education details.
- Extract work or internship experience.
- Extract certifications and achievements.

Resume:

{resume_text}
"""

    response = None

    # Retry Gemini request up to 3 times
    # in case of temporary 503/high-demand errors.
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CandidateProfile,
                    temperature=0.2,
                    max_output_tokens=4096,
                ),
            )

            break

        except Exception as e:
            error_message = str(e)

            # Retry for temporary service or rate limit errors
            if not any(err in error_message for err in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED")):
                raise e

            if attempt == 2:
                raise e

            # Wait before trying again
            time.sleep(3)

    if response is None:
        raise ValueError(
            "Gemini did not return a response."
        )

    if not response.text:
        raise ValueError(
            "Gemini did not return a candidate profile."
        )

    return CandidateProfile.model_validate_json(
        response.text
    )