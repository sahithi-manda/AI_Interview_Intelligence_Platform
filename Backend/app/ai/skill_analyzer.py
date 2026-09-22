import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.matching import MatchResult
from app.schemas.answer import AnswerEvaluation
from app.schemas.skill_analysis import SkillAnalysis


def analyze_skills(
    match_result: MatchResult,
    evaluations: list[AnswerEvaluation]
) -> SkillAnalysis:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    evaluations_json = [
        evaluation.model_dump()
        for evaluation in evaluations
    ]

    prompt = f"""
You are an expert technical interviewer and career assessment
specialist.

Analyze the candidate's skills and weaknesses using the provided
job matching result and interview answer evaluations.

JOB MATCHING RESULT:
{match_result.model_dump_json(indent=2)}

INTERVIEW ANSWER EVALUATIONS:
{evaluations_json}

Analyze:

1. Strong skills demonstrated by the candidate.
2. Weak skills that need improvement.
3. Skills missing from the job requirements.
4. Technical weaknesses found in the interview answers.
5. Communication weaknesses found in the answers.
6. Most important areas the candidate should improve first.
7. Overall readiness for the target job.

Rules:

- Base the analysis only on the provided information.
- Do not invent skills or experience.
- A skill should be considered strong only when supported by the
  match result or interview evaluations.
- Distinguish between missing job requirements and weak performance.
- Prioritize important skills that affect job readiness.
- overall_readiness_score must be between 0 and 100.
- Keep the summary practical and interview-focused.
- Return only a structured result matching the provided schema.
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
                    response_schema=SkillAnalysis,
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

            time.sleep(3)

    if response is None:
        raise ValueError(
            "Gemini did not return a response."
        )

    if not response.text:
        raise ValueError(
            "Gemini did not return skill analysis."
        )

    return SkillAnalysis.model_validate_json(
        response.text
    )