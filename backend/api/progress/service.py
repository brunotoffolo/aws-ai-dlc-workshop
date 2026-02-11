from __future__ import annotations

from datetime import datetime

from shared.db import Keys, db_client
from shared.models.responses import NOT_FOUND, error_response, success_response


def get_progress(user_id: str, curriculum_id: str) -> dict:
    item = db_client.get_item(Keys.user_pk(user_id), Keys.progress_sk(curriculum_id))
    if not item:
        return error_response(NOT_FOUND, "Progress not found", 404)
    return success_response({k: v for k, v in item.items() if not k.startswith(("PK", "SK", "GSI"))})


def save_resume(user_id: str, curriculum_id: str, resume_state: dict) -> dict:
    pk, sk = Keys.user_pk(user_id), Keys.progress_sk(curriculum_id)
    item = db_client.get_item(pk, sk)
    if not item:
        # Create progress record if it doesn't exist
        db_client.put_item({
            "PK": pk, "SK": sk,
            "GSI1PK": Keys.curriculum_gsi1pk(curriculum_id), "GSI1SK": f"PROGRESS#{user_id}",
            "user_id": user_id, "curriculum_id": curriculum_id,
            "overall_percent": 0, "status": "in_progress",
            "lessons_completed": {}, "quiz_scores": {},
            "resume_state": resume_state,
            "started_at": datetime.utcnow().isoformat(),
            "last_activity_at": datetime.utcnow().isoformat(),
        })
    else:
        db_client.update_item(pk, sk, {"resume_state": resume_state, "last_activity_at": datetime.utcnow().isoformat()})
    return success_response({"message": "Resume state saved"})


def get_resume(user_id: str, curriculum_id: str) -> dict:
    item = db_client.get_item(Keys.user_pk(user_id), Keys.progress_sk(curriculum_id))
    if not item or not item.get("resume_state"):
        return error_response(NOT_FOUND, "No resume state found", 404)
    return success_response({"resume_state": item["resume_state"]})


def complete_lesson(user_id: str, curriculum_id: str, lesson_id: str) -> dict:
    pk, sk = Keys.user_pk(user_id), Keys.progress_sk(curriculum_id)
    item = db_client.get_item(pk, sk)
    if not item:
        return error_response(NOT_FOUND, "Progress not found", 404)

    lessons_completed = item.get("lessons_completed", {})
    lessons_completed[lesson_id] = {"completed_at": datetime.utcnow().isoformat(), "score": item.get("quiz_scores", {}).get(lesson_id, {}).get("score")}

    # Get total lesson count from curriculum
    curriculum = db_client.query(Keys.curriculum_gsi1pk(curriculum_id), "META", index_name="GSI1")
    total_lessons = 0
    if curriculum["items"]:
        for module in curriculum["items"][0].get("modules", []):
            total_lessons += len(module.get("lessons", []))

    overall_percent = (len(lessons_completed) / total_lessons * 100) if total_lessons > 0 else 0
    updates = {"lessons_completed": lessons_completed, "overall_percent": overall_percent, "last_activity_at": datetime.utcnow().isoformat()}

    if overall_percent >= 100:
        updates["status"] = "completed"
        updates["completed_at"] = datetime.utcnow().isoformat()

    db_client.update_item(pk, sk, updates)
    return success_response({"overall_percent": overall_percent, "status": updates.get("status", "in_progress")})


def get_dashboard(user_id: str) -> dict:
    result = db_client.query(Keys.user_pk(user_id), "PROGRESS#")
    active, completed = [], []
    for item in result["items"]:
        entry = {k: v for k, v in item.items() if not k.startswith(("PK", "SK", "GSI"))}
        if item.get("status") == "completed":
            completed.append(entry)
        else:
            active.append(entry)

    assignments = db_client.query(Keys.user_pk(user_id), "ASSIGN#")
    assigned = []
    for a in assignments["items"]:
        cid = a.get("curriculum_id", "")
        curr = db_client.query(Keys.curriculum_gsi1pk(cid), "META", index_name="GSI1")
        entry = {"curriculum_id": cid, "deadline": a.get("deadline"), "assigned": True}
        if curr["items"]:
            c = curr["items"][0]
            entry["topic"] = c.get("topic", "")
            entry["title"] = c.get("topic", "")
            entry["status"] = c.get("status", "")
            entry["program_level"] = c.get("program_level", "")
        assigned.append(entry)

    return success_response({"active": active, "completed": completed, "assigned": assigned})
