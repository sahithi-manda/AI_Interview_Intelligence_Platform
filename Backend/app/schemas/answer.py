from pydantic import BaseModel, Field


class AnswerEvaluation(BaseModel):
    overall_score: float = 0.0
    technical_accuracy: float = 0.0
    communication_score: float = 0.0

    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_concepts: list[str] = Field(default_factory=list)

    feedback: str = ""
    suggested_improvement: str = ""