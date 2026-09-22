import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.answer import AnswerEvaluation
from app.schemas.followup import FollowUpResponse


def generate_follow_up(
    question: str,
    answer: str,
    evaluation: AnswerEvaluation,
    skill: str = "",
    difficulty: str = ""
) -> FollowUpResponse:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert adaptive technical interviewer.

Generate the next follow-up interview question based on
the candidate's previous question, answer, and evaluation.

PREVIOUS QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

ANSWER EVALUATION:
{evaluation.model_dump_json(indent=2)}

SKILL:
{skill}

PREVIOUS DIFFICULTY:
{difficulty}

Adaptive interview rules:

1. If the answer is weak or incomplete:
   - Ask a simpler question that checks the missing concept.
   - Focus on the candidate's weakness or missing concept.

2. If the answer is average:
   - Ask a related question with similar difficulty.
   - Check deeper understanding.

3. If the answer is strong:
   - Increase the difficulty.
   - Ask a deeper or practical question.

4. The follow-up must be directly related to the previous answer.
5. Focus on the specified skill when provided.
6. Do not invent information about the candidate.
7. Do not repeat the previous question.
8. The question must be realistic for a technical interview.
9. Provide a short reason explaining why this follow-up was selected.
10. Return only a structured result matching the provided schema.

Difficulty should be one of:
Easy, Medium, Hard.
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
                    response_schema=FollowUpResponse,
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
            "Gemini did not return a follow-up question."
        )

    return FollowUpResponse.model_validate_json(
        response.text
    )