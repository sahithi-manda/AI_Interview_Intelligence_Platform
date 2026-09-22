from pydantic import BaseModel, Field


class InterviewReport(BaseModel):
    overall_score: float = 0.0
    technical_score: float = 0.0
    communication_score: float = 0.0

    strong_areas: list[str] = Field(default_factory=list)
    weak_areas: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)

    interview_summary: str = ""
    hiring_recommendation: str = ""

    improvement_areas: list[str] = Field(default_factory=list)