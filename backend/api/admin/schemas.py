from pydantic import BaseModel


class LearnerQueryParams(BaseModel):
    curriculum_id: str | None = None
    page_token: str | None = None
