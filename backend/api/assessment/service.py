from __future__ import annotations

from datetime import datetime

from shared.db import Keys, db_client
from shared.models.responses import NOT_FOUND, error_response, success_response


def get_quiz(curriculum_id: str, quiz_id: str) -> dict:
    item = db_client.get_item(Keys.content_pk(curriculum_id), Keys.quiz_sk(quiz_id))
    if not item or item.get("review_status") != "approved":
        return error_response(NOT_FOUND, "Quiz not found", 404)

    # Strip correct answers before sending to learner
    questions = []
    for q in item.get("questions", []):
        questions.append({
            "question_id": q["question_id"], "type": q["type"], "text": q["text"],
            "options": q.get("options"), "difficulty": q.get("difficulty"), "points": q.get("points", 1),
        })
    return success_response({"quiz_id": quiz_id, "questions": questions, "difficulty_level": item.get("difficulty_level")})


def submit_answers(user_id: str, curriculum_id: str, quiz_id: str, answers: list[dict]) -> dict:
    item = db_client.get_item(Keys.content_pk(curriculum_id), Keys.quiz_sk(quiz_id))
    if not item:
        return error_response(NOT_FOUND, "Quiz not found", 404)

    questions_map = {q["question_id"]: q for q in item.get("questions", [])}
    answers_map = {a["question_id"]: a["answer"] for a in answers}

    results, total_points, earned_points = [], 0, 0
    for qid, question in questions_map.items():
        pts = question.get("points", 1)
        total_points += pts
        user_answer = answers_map.get(qid, "")
        correct = user_answer.strip().lower() == question["correct_answer"].strip().lower() if question["type"] == "mcq" else False
        # TODO: short_answer grading via Assessment Agent
        if correct:
            earned_points += pts
        results.append({
            "question_id": qid, "correct": correct, "your_answer": user_answer,
            "correct_answer": question["correct_answer"], "explanation": "",
        })

    score = (earned_points / total_points * 100) if total_points > 0 else 0

    # Update progress with quiz score
    progress = db_client.get_item(Keys.user_pk(user_id), Keys.progress_sk(curriculum_id))
    if progress:
        quiz_scores = progress.get("quiz_scores", {})
        existing = quiz_scores.get(quiz_id, {})
        quiz_scores[quiz_id] = {"score": score, "attempts": existing.get("attempts", 0) + 1, "last_attempt_at": datetime.utcnow().isoformat()}
        db_client.update_item(Keys.user_pk(user_id), Keys.progress_sk(curriculum_id), {"quiz_scores": quiz_scores, "last_activity_at": datetime.utcnow().isoformat()})

    return success_response({"score": score, "total_points": total_points, "per_question": results})


def get_pre_assessment(curriculum_id: str) -> dict:
    # Pre-assessment quizzes stored with quiz_id pattern "pre-assessment-{curriculum_id}"
    quiz_id = f"pre-assessment-{curriculum_id}"
    item = db_client.get_item(Keys.content_pk(curriculum_id), Keys.quiz_sk(quiz_id))
    if not item:
        return error_response(NOT_FOUND, "Pre-assessment not found", 404)

    questions = [{"question_id": q["question_id"], "type": q["type"], "text": q["text"], "options": q.get("options"), "points": q.get("points", 1)} for q in item.get("questions", [])]
    return success_response({"quiz_id": quiz_id, "questions": questions})


def submit_pre_assessment(user_id: str, curriculum_id: str, answers: list[dict]) -> dict:
    quiz_id = f"pre-assessment-{curriculum_id}"
    result = submit_answers(user_id, curriculum_id, quiz_id, answers)

    # TODO: invoke Personalisation Agent for adaptive path generation
    return result
