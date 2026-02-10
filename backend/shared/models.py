from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    LEARNER = "LEARNER"
    ADMIN = "ADMIN"
    REVIEWER = "REVIEWER"
    MANAGER = "MANAGER"


class CurriculumStatus(str, Enum):
    GENERATING = "GENERATING"
    PENDING_REVIEW = "PENDING_REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class ContentStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ReviewAction(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    EDIT = "EDIT"


class User(BaseModel):
    user_id: str
    email: str
    role: UserRole = UserRole.LEARNER
    preferences: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Curriculum(BaseModel):
    curriculum_id: str
    user_id: str
    title: str
    topic: str
    test_type: str
    program_level: str
    status: CurriculumStatus = CurriculumStatus.GENERATING
    modules: list[dict] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Lesson(BaseModel):
    curriculum_id: str
    lesson_order: int
    title: str
    s3_key: str
    status: ContentStatus = ContentStatus.PENDING_REVIEW
    reviewer_feedback: Optional[str] = None


class Quiz(BaseModel):
    curriculum_id: str
    lesson_order: int
    questions: list[dict] = Field(default_factory=list)
    difficulty: str = "medium"
    status: ContentStatus = ContentStatus.PENDING_REVIEW


class Progress(BaseModel):
    user_id: str
    curriculum_id: str
    current_lesson: int = 0
    completed_lessons: list[int] = Field(default_factory=list)
    quiz_scores: dict = Field(default_factory=dict)
    resume_position: dict = Field(default_factory=dict)
    percentage: float = 0.0
    last_accessed: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class Assignment(BaseModel):
    user_id: str
    curriculum_id: str
    admin_id: str
    deadline: Optional[str] = None
    assigned_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ReviewItem(BaseModel):
    review_id: str
    content_type: str  # "lesson" or "quiz"
    curriculum_id: str
    lesson_order: int
    status: ContentStatus = ContentStatus.PENDING_REVIEW
    reviewer_id: Optional[str] = None
    feedback: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
