from pydantic import BaseModel, Field


class GenerateCurriculumRequest(BaseModel):
    topic: str = Field(min_length=1)
    test_type: str
    program_level: str


class AssignCurriculumRequest(BaseModel):
    curriculum_id: str
    learner_ids: list[str]
    deadline: str | None = None
