from pydantic import BaseModel, Field


class InterviewQuestion(BaseModel):
    question: str
    category: str
    difficulty: str
    skill: str = ""
    reason: str = ""


class InterviewQuestionSet(BaseModel):
    questions: list[InterviewQuestion] = Field(default_factory=list)