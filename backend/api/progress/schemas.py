from typing import Any

from pydantic import BaseModel


class ResumeStateRequest(BaseModel):
    lesson_id: str
    scroll_position: int = 0
    quiz_state: dict[str, Any] = {}
    form_inputs: dict[str, Any] = {}
    time_spent_seconds: int = 0
