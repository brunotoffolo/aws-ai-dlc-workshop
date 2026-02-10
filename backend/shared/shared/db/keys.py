"""DynamoDB single-table key builders."""


class Keys:
    # PK/SK builders
    @staticmethod
    def user_pk(user_id: str) -> str:
        return f"USER#{user_id}"

    @staticmethod
    def profile_sk() -> str:
        return "PROFILE"

    @staticmethod
    def curriculum_sk(curriculum_id: str) -> str:
        return f"CURRICULUM#{curriculum_id}"

    @staticmethod
    def content_pk(curriculum_id: str) -> str:
        return f"CURRICULUM#{curriculum_id}"

    @staticmethod
    def content_sk(lesson_id: str) -> str:
        return f"CONTENT#{lesson_id}"

    @staticmethod
    def quiz_sk(quiz_id: str) -> str:
        return f"QUIZ#{quiz_id}"

    @staticmethod
    def progress_sk(curriculum_id: str) -> str:
        return f"PROGRESS#{curriculum_id}"

    @staticmethod
    def assignment_sk(assignment_id: str) -> str:
        return f"ASSIGNMENT#{assignment_id}"

    # GSI1 builders
    @staticmethod
    def email_gsi1pk(email: str) -> str:
        return f"EMAIL#{email}"

    @staticmethod
    def curriculum_gsi1pk(curriculum_id: str) -> str:
        return f"CURRICULUM#{curriculum_id}"

    @staticmethod
    def review_gsi1pk(status: str) -> str:
        return f"REVIEW#{status}"

    @staticmethod
    def assignment_gsi1pk(curriculum_id: str) -> str:
        return f"ASSIGNMENT#{curriculum_id}"
