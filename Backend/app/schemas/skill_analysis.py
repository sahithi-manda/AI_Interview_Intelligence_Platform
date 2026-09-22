from pydantic import BaseModel, Field


class SkillAnalysis(BaseModel):
    strong_skills: list[str] = Field(default_factory=list)
    weak_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)

    technical_weaknesses: list[str] = Field(default_factory=list)
    communication_weaknesses: list[str] = Field(default_factory=list)

    priority_areas: list[str] = Field(default_factory=list)

    overall_readiness_score: float = 0.0
    summary: str = ""