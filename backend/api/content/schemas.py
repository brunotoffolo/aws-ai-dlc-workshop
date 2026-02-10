from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    action: str = Field(pattern="^(approve|reject|edit)$")
    feedback: str | None = None
    edited_content: str | None = None
