"""DynamoDB key builders for single-table design."""


def user_pk(user_id: str) -> str:
    return f"USER#{user_id}"


def user_sk() -> str:
    return "PROFILE"


def user_gsi1pk(email: str) -> str:
    return f"EMAIL#{email}"


def curriculum_pk(curriculum_id: str) -> str:
    return f"CURR#{curriculum_id}"


def curriculum_sk() -> str:
    return "META"


def curriculum_gsi1pk(user_id: str) -> str:
    return f"USER#{user_id}"


def lesson_sk(order: int) -> str:
    return f"LESSON#{order:04d}"


def quiz_sk(lesson_order: int) -> str:
    return f"QUIZ#{lesson_order:04d}"


def progress_pk(user_id: str) -> str:
    return f"USER#{user_id}"


def progress_sk(curriculum_id: str) -> str:
    return f"PROG#{curriculum_id}"


def assignment_sk(curriculum_id: str) -> str:
    return f"ASSIGN#{curriculum_id}"


def assignment_gsi1pk(admin_id: str) -> str:
    return f"ADMIN#{admin_id}"


def review_pk(review_id: str) -> str:
    return f"REVIEW#{review_id}"


def review_sk() -> str:
    return "META"


def status_gsi1pk(status: str) -> str:
    return f"STATUS#{status}"
