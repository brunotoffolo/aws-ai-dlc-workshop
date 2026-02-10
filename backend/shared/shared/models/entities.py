from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class UserRole(str, Enum):
    LEARNER = "learner"
    ADMIN = "admin"
    REVIEWER = "reviewer"


class UserStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    LOCKED = "locked"
    DEACTIVATED = "deactivated"


class CurriculumStatus(str, Enum):
    GENERATING = "generating"
    PENDING_REVIEW = "pending_review"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    FAILED = "failed"


class DiscoveryMethod(str, Enum):
    FREE_TEXT = "free_text"
    WIZARD = "wizard"
    ADMIN_ASSIGNED = "admin_assigned"


class ProgramLevel(str, Enum):
    CERTIFICATE = "certificate"
    DIPLOMA = "diploma"
    DEGREE = "degree"


class ReviewStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class ReviewAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    EDIT = "edit"


class QuestionType(str, Enum):
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    PRACTICAL = "practical"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ProgressStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"


class AssignmentStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


# --- Domain Entities ---


class User(BaseModel):
    user_id: str
    email: str
    role: UserRole = UserRole.LEARNER
    experience_level: str | None = None
    learning_goals: list[str] = Field(default_factory=list)
    technical_role: bool = False
    status: UserStatus = UserStatus.PENDING_VERIFICATION
    failed_login_count: int = 0
    locked_until: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class LessonRef(BaseModel):
    lesson_id: str
    title: str
    order: int
    quiz_id: str | None = None


class Module(BaseModel):
    module_id: str
    title: str
    order: int
    lessons: list[LessonRef] = Field(default_factory=list)


class Curriculum(BaseModel):
    curriculum_id: str
    user_id: str
    title: str = ""
    topic: str
    test_type: str
    program_level: ProgramLevel
    discovery_method: DiscoveryMethod
    status: CurriculumStatus = CurriculumStatus.GENERATING
    execution_arn: str | None = None
    modules: list[Module] = Field(default_factory=list)
    estimated_hours: float | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Question(BaseModel):
    question_id: str
    type: QuestionType
    text: str
    options: list[str] | None = None
    correct_answer: str
    difficulty: Difficulty = Difficulty.MEDIUM
    points: int = 1


class Quiz(BaseModel):
    quiz_id: str
    curriculum_id: str
    lesson_id: str
    questions: list[Question] = Field(default_factory=list)
    difficulty_level: Difficulty = Difficulty.MEDIUM
    review_status: ReviewStatus = ReviewStatus.PENDING_REVIEW
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ContentMetadata(BaseModel):
    curriculum_id: str
    lesson_id: str
    s3_key: str
    content_type: str = "lesson"
    review_status: ReviewStatus = ReviewStatus.PENDING_REVIEW
    reviewer_id: str | None = None
    reviewer_feedback: str | None = None
    version: int = 1
    previous_s3_key: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeState(BaseModel):
    lesson_id: str
    scroll_position: int = 0
    quiz_state: dict[str, Any] = Field(default_factory=dict)
    form_inputs: dict[str, Any] = Field(default_factory=dict)
    time_spent_seconds: int = 0


class Progress(BaseModel):
    user_id: str
    curriculum_id: str
    overall_percent: float = 0.0
    current_module_id: str | None = None
    current_lesson_id: str | None = None
    status: ProgressStatus = ProgressStatus.IN_PROGRESS
    lessons_completed: dict[str, Any] = Field(default_factory=dict)
    quiz_scores: dict[str, Any] = Field(default_factory=dict)
    adaptive_path: list[str] = Field(default_factory=list)
    resume_state: ResumeState | None = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)


class Assignment(BaseModel):
    assignment_id: str
    learner_id: str
    curriculum_id: str
    assigned_by: str
    deadline: datetime | None = None
    status: AssignmentStatus = AssignmentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
