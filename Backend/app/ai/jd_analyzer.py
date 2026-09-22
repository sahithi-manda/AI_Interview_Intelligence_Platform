from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.jd import JobDescription


def analyze_jd_with_ai(jd_text: str) -> JobDescription:
    """
    Analyze a job description using Gemini
    and return a structured job description profile.
    """

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert technical recruiter and job description analyzer.

Analyze the following job description and extract a structured
job description profile.

Rules:
- Extract only information supported by the job description.
- Do not invent requirements or responsibilities.
- Identify required technical skills.
- Identify preferred skills when explicitly mentioned.
- Identify experience requirements.
- Identify education requirements.
- Identify responsibilities.
- Identify important qualifications.
- If information is missing, return an empty value.
- Keep the summary concise and professional.

Job Description:

{jd_text}
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
                    response_schema=JobDescription,
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
            "Gemini did not return a valid job description profile."
        )

    return JobDescription.model_validate_json(
        response.text
    )