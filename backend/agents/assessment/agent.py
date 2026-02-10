"""Assessment Agent — quiz generation and grading with adaptive difficulty."""

import logging

from ..tools.bedrock import invoke_model_json
from .difficulty import calculate_new_level, get_level_name
from .prompts import (
    QUIZ_SYSTEM_PROMPT, QUIZ_USER_TEMPLATE,
    GRADE_SYSTEM_PROMPT, GRADE_USER_TEMPLATE,
)

logger = logging.getLogger(__name__)

QUESTION_COUNTS = {"quiz": 7, "exam": 15, "practical": 10}


def generate_quiz(lesson_content: str, test_type: str, blooms_level: int) -> dict:
    """Generate quiz questions at specified Bloom's level."""
    count = QUESTION_COUNTS.get(test_type, 7)
    user_prompt = QUIZ_USER_TEMPLATE.format(
        test_type=test_type,
        question_count=count,
        blooms_level=blooms_level,
        blooms_name=get_level_name(blooms_level),
        lesson_content=lesson_content[:3000],
    )
    logger.info("quiz_gen_start", extra={"test_type": test_type, "blooms_level": blooms_level})
    result = invoke_model_json(QUIZ_SYSTEM_PROMPT, user_prompt)
    logger.info("quiz_gen_complete", extra={"question_count": len(result.get("questions", []))})
    return result


def grade_submission(questions: list[dict], answers: list[dict], recent_scores: list[bool], current_level: int) -> dict:
    """Grade quiz submission. Auto-grade MCQ, LLM-grade others."""
    total_points = 0
    earned_points = 0
    per_question = []
    new_scores = list(recent_scores)

    for q, a in zip(questions, answers):
        total_points += q["points"]

        if q["type"] == "mcq":
            correct = a.get("answer", "").strip().upper() == q["correct_answer"].strip().upper()
            pts = q["points"] if correct else 0
            feedback = "Correct!" if correct else f"Incorrect. The answer is {q['correct_answer']}."
        else:
            result = invoke_model_json(
                GRADE_SYSTEM_PROMPT,
                GRADE_USER_TEMPLATE.format(
                    points=q["points"],
                    question_text=q["text"],
                    rubric=q.get("rubric", "Evaluate for correctness and completeness."),
                    student_answer=a.get("answer", ""),
                ),
            )
            correct = result.get("correct", False)
            pts = result.get("points_earned", 0)
            feedback = result.get("feedback", "")

        earned_points += pts
        new_scores.append(correct)
        per_question.append({
            "question_id": q["id"],
            "correct": correct,
            "points_earned": pts,
            "feedback": feedback,
        })

    new_level = calculate_new_level(current_level, new_scores)
    score = (earned_points / total_points * 100) if total_points > 0 else 0

    return {
        "score": round(score, 1),
        "total_points": total_points,
        "earned_points": earned_points,
        "per_question": per_question,
        "new_blooms_level": new_level,
    }
