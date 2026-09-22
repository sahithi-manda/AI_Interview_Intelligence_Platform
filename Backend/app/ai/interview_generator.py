from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.resume import CandidateProfile
from app.schemas.jd import JobDescription
from app.schemas.matching import MatchResult
from app.schemas.interview import InterviewQuestionSet


def generate_interview_questions(
    candidate: CandidateProfile,
    job: JobDescription,
    match_result: MatchResult
) -> InterviewQuestionSet:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert technical interviewer.

Create a personalized interview question set for this candidate.

CANDIDATE PROFILE:
{candidate.model_dump_json(indent=2)}

JOB DESCRIPTION:
{job.model_dump_json(indent=2)}

MATCH RESULT:
{match_result.model_dump_json(indent=2)}

Generate interview questions based on the candidate and the job.

Requirements:

1. Generate 10 questions.
2. Include different categories:
   - Technical
   - Project
   - Behavioral
   - Skill Gap
3. Include different difficulty levels:
   - Easy
   - Medium
   - Hard
4. Focus strongly on the skills required by the job.
5. Ask project-related questions based only on projects
   actually present in the candidate profile.
6. Ask skill-gap questions for important missing skills.
7. Do not invent candidate experience or projects.
8. Avoid duplicate or very similar questions.
9. Questions should be realistic interview questions.
10. Each question must contain:
    - question
    - category
    - difficulty
    - skill
    - reason
11. The reason should briefly explain why the question
    was selected for this candidate.
12. Return only the structured result matching the schema.
"""

    response = None

    # Retry temporary Gemini service errors
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=InterviewQuestionSet,
                    temperature=0.2,
                    max_output_tokens=8192,
                ),
            )

            break

        except Exception as e:
            error_message = str(e)

            if not any(err in error_message for err in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED")):
                raise e

            if attempt == 2:
                raise e

            import time
            time.sleep(3)

    if response is None:
        raise ValueError(
            "Gemini did not return a response."
        )

    if not response.text:
        raise ValueError(
            "Gemini did not return interview questions."
        )

    return InterviewQuestionSet.model_validate_json(
        response.text
    )