import time

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.answer import AnswerEvaluation


def evaluate_answer(
    question: str,
    answer: str,
    skill: str = "",
    difficulty: str = ""
) -> AnswerEvaluation:

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

INTERVIEW QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

SKILL BEING TESTED:
{skill}

QUESTION DIFFICULTY:
{difficulty}

Evaluate the answer based only on the information provided.

Analyze:

1. Overall answer quality
2. Technical accuracy
3. Communication quality
4. Strengths
5. Weaknesses
6. Missing concepts
7. Specific feedback
8. How the candidate can improve

Scoring rules:

- overall_score: 0 to 100
- technical_accuracy: 0 to 100
- communication_score: 0 to 100
- Do not give a high score simply because the answer is long.
- Give credit for correct and relevant concepts.
- Identify incorrect technical statements.
- If the answer is incomplete, clearly mention what is missing.
- If the answer is completely unrelated, give a low score.
- Do not invent information about the candidate.
- Keep the feedback practical and interview-focused.

Return only a structured result matching the provided schema.
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
                    response_schema=AnswerEvaluation,
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
            "Gemini did not return an answer evaluation."
        )

    return AnswerEvaluation.model_validate_json(
        response.text
    )