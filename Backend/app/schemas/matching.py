from pydantic import BaseModel, Field


class MatchResult(BaseModel):
    overall_match: float = 0.0
    skills_match: float = 0.0
    experience_match: float = 0.0
    education_match: float = 0.0

    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)

    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)

    recommendations: list[str] = Field(default_factory=list)