from pydantic import BaseModel, Field


class ImprovementPlan(BaseModel):
    priority_skills: list[str] = Field(default_factory=list)

    learning_goals: list[str] = Field(default_factory=list)

    practice_areas: list[str] = Field(default_factory=list)

    project_recommendations: list[str] = Field(default_factory=list)

    interview_practice: list[str] = Field(default_factory=list)

    short_term_goals: list[str] = Field(default_factory=list)

    long_term_goals: list[str] = Field(default_factory=list)

    personalized_plan: str = ""