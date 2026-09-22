from pydantic import BaseModel, Field


class Education(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""


class Project(BaseModel):
    name: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)


class Experience(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    responsibilities: list[str] = Field(default_factory=list)


class CandidateProfile(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""

    education: list[Education] = Field(default_factory=list)

    skills: list[str] = Field(default_factory=list)

    projects: list[Project] = Field(default_factory=list)

    experience: list[Experience] = Field(default_factory=list)

    certifications: list[str] = Field(default_factory=list)

    achievements: list[str] = Field(default_factory=list)

    summary: str = ""