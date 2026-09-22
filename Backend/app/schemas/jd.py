from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    job_title: str = ""
    company: str = ""
    experience_required: str = ""
    education_required: str = ""

    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)

    responsibilities: list[str] = Field(default_factory=list)
    qualifications: list[str] = Field(default_factory=list)

    summary: str = ""