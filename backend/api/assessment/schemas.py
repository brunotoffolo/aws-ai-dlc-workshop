from pydantic import BaseModel


class AnswerItem(BaseModel):
    question_id: str
    answer: str


class SubmitAnswersRequest(BaseModel):
    answers: list[AnswerItem]
