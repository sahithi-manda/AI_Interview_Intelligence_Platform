import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.answer import AnswerEvaluation
from app.schemas.matching import MatchResult
from app.schemas.skill_analysis import SkillAnalysis
from app.schemas.interview_report import InterviewReport


def generate_interview_report(
    match_result: MatchResult,
    skill_analysis: SkillAnalysis,
    evaluations: list[AnswerEvaluation]
) -> InterviewReport:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    evaluations_json = [
        evaluation.model_dump()
        for evaluation in evaluations
    ]

    prompt = f"""
You are an expert technical interviewer and recruitment analyst.

Create a final interview performance report for the candidate.

JOB MATCHING RESULT:
{match_result.model_dump_json(indent=2)}

SKILL ANALYSIS:
{skill_analysis.model_dump_json(indent=2)}

INTERVIEW ANSWER EVALUATIONS:
{evaluations_json}

Analyze all the information and create a comprehensive but
concise interview report.

Include:

1. Overall interview performance score.
2. Technical performance score.
3. Communication performance score.
4. Strong areas.
5. Weak areas.
6. Missing skills.
7. Overall interview summary.
8. Hiring recommendation.
9. Specific improvement areas.

Scoring rules:

- All scores must be between 0 and 100.
- Consider both job fit and actual interview performance.
- Do not give a high score only because the candidate has a
  high resume-to-JD match.
- Consider the candidate's actual answer evaluations.
- Missing job skills should be clearly identified.
- Distinguish between weak performance and completely missing skills.
- Do not invent candidate information.
- The hiring recommendation should be realistic and concise.
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
                    response_schema=InterviewReport,
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
            "Gemini did not return an interview report."
        )

    return InterviewReport.model_validate_json(
        response.text
    )