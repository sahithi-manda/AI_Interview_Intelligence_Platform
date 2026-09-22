import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.skill_analysis import SkillAnalysis
from app.schemas.interview_report import InterviewReport
from app.schemas.improvement import ImprovementPlan


def generate_improvement_plan(
    skill_analysis: SkillAnalysis,
    interview_report: InterviewReport
) -> ImprovementPlan:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert career coach and technical interview mentor.

Create a personalized improvement plan for the candidate based on
their skill analysis and final interview report.

SKILL ANALYSIS:
{skill_analysis.model_dump_json(indent=2)}

INTERVIEW REPORT:
{interview_report.model_dump_json(indent=2)}

Create an actionable plan that includes:

1. Priority skills the candidate should improve.
2. Specific learning goals.
3. Technical practice areas.
4. Project recommendations that help build missing skills.
5. Interview practice recommendations.
6. Short-term goals.
7. Long-term goals.
8. A concise personalized improvement plan.

Rules:

- Base the plan only on the provided analysis and report.
- Prioritize missing and weak skills.
- Do not invent candidate experience.
- Recommend practical and realistic projects.
- Do not recommend skills that are unrelated to the identified
  weaknesses or job requirements.
- Short-term goals should be achievable in the near term.
- Long-term goals should focus on stronger job readiness.
- Keep recommendations specific and actionable.
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
                    response_schema=ImprovementPlan,
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
            "Gemini did not return an improvement plan."
        )

    return ImprovementPlan.model_validate_json(
        response.text
    )