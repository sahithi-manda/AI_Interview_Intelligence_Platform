from pydantic import BaseModel


class FollowUpQuestion(BaseModel):
    question: str
    category: str = "Technical"
    difficulty: str = "Medium"
    skill: str = ""
    reason: str = ""


class FollowUpResponse(BaseModel):
    follow_up: FollowUpQuestion