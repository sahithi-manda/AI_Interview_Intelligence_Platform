from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.resume import CandidateProfile
from app.schemas.jd import JobDescription
from app.schemas.matching import MatchResult


def match_resume_with_jd(
    candidate: CandidateProfile,
    job: JobDescription
) -> MatchResult:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert technical recruiter and candidate-job matching
specialist.

Compare the candidate profile with the job description.

Candidate Profile:
{candidate.model_dump_json(indent=2)}

Job Description:
{job.model_dump_json(indent=2)}

Analyze the following:

1. Overall compatibility
2. Required skill match
3. Experience match
4. Education match
5. Matched skills
6. Missing skills
7. Candidate strengths
8. Candidate weaknesses
9. Recommendations for improving job fit

Scoring rules:
- All scores must be between 0 and 100.
- overall_match should represent the overall suitability.
- skills_match should compare candidate skills with required skills.
- experience_match should consider the candidate's actual experience.
- education_match should consider the candidate's education requirements.
- Do not invent candidate information.
- Do not assume a skill just because it is related to another skill.
- Clearly identify missing required skills.
- Base the result only on the provided candidate profile and job description.
- Return a structured result matching the provided schema.
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
                    response_schema=MatchResult,
                    temperature=0.2,
                    max_output_tokens=4096,
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
            "Gemini did not return a valid match result."
        )

    return MatchResult.model_validate_json(
        response.text
    )