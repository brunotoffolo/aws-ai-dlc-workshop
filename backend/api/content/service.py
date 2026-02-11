from __future__ import annotations

from datetime import datetime

from shared.db import Keys, db_client
from shared.models.responses import CONFLICT, NOT_FOUND, VALIDATION_ERROR, error_response, success_response
from shared.s3 import s3_client


def get_lesson(curriculum_id: str, lesson_id: str) -> dict:
    item = db_client.get_item(Keys.content_pk(curriculum_id), Keys.content_sk(lesson_id))
    if not item:
        return error_response(NOT_FOUND, "Content not found", 404)
    url = s3_client.generate_presigned_url(item["s3_key"])
    return success_response({"lesson_id": lesson_id, "url": url, "status": item.get("status", item.get("review_status", "unknown")), "version": item.get("version", 1), "title": item.get("title", "")})


def list_review_queue(page_token: dict | None = None) -> dict:
    result = db_client.query(Keys.review_gsi1pk("pending_review"), index_name="GSI1", limit=20, last_key=page_token)
    items = [{k: v for k, v in i.items() if not k.startswith(("PK", "SK", "GSI"))} for i in result["items"]]
    return success_response({"items": items, "next_page_token": result.get("last_key")})


def review_content(reviewer_id: str, curriculum_id: str, lesson_id: str, action: str, feedback: str | None = None, edited_content: str | None = None) -> dict:
    pk, sk = Keys.content_pk(curriculum_id), Keys.content_sk(lesson_id)
    item = db_client.get_item(pk, sk)
    if not item:
        return error_response(NOT_FOUND, "Content not found", 404)
    reviewable = item.get("review_status", item.get("status", "")) in ("pending_review", "rejected")
    if not reviewable:
        return error_response(CONFLICT, "Content not in reviewable state", 409)

    now = datetime.utcnow().isoformat()

    if action == "approve":
        db_client.update_item(pk, sk, {"review_status": "approved", "status": "approved", "reviewer_id": reviewer_id, "GSI1PK": Keys.review_gsi1pk("approved"), "updated_at": now})
        return success_response({"status": "approved"})

    if action == "reject":
        if not feedback:
            return error_response(VALIDATION_ERROR, "Feedback required for rejection")
        db_client.update_item(pk, sk, {"review_status": "rejected", "status": "rejected", "reviewer_id": reviewer_id, "reviewer_feedback": feedback, "GSI1PK": Keys.review_gsi1pk("rejected"), "updated_at": now})
        return success_response({"status": "rejected"})

    if action == "edit":
        new_key = f"{item['s3_key']}.v{item.get('version', 1) + 1}"
        s3_client.put_content(new_key, edited_content or "")
        db_client.update_item(pk, sk, {
            "previous_s3_key": item["s3_key"], "s3_key": new_key,
            "version": item.get("version", 1) + 1, "review_status": "approved",
            "reviewer_id": reviewer_id, "GSI1PK": Keys.review_gsi1pk("approved"), "updated_at": now,
        })
        return success_response({"status": "approved", "version": item.get("version", 1) + 1})

    return error_response(VALIDATION_ERROR, "Invalid action")


def regenerate_content(curriculum_id: str, lesson_id: str) -> dict:
    pk, sk = Keys.content_pk(curriculum_id), Keys.content_sk(lesson_id)
    item = db_client.get_item(pk, sk)
    if not item:
        return error_response(NOT_FOUND, "Content not found", 404)
    if item.get("review_status", item.get("status")) != "rejected":
        return error_response(CONFLICT, "Only rejected content can be regenerated", 409)

    # TODO: invoke Content Agent via AgentCore with reviewer_feedback
    db_client.update_item(pk, sk, {"review_status": "pending_review", "reviewer_feedback": None, "GSI1PK": Keys.review_gsi1pk("pending_review"), "updated_at": datetime.utcnow().isoformat()})
    return success_response({"status": "pending_review", "message": "Content regeneration triggered"}, 202)


def get_versions(curriculum_id: str, lesson_id: str) -> dict:
    item = db_client.get_item(Keys.content_pk(curriculum_id), Keys.content_sk(lesson_id))
    if not item:
        return error_response(NOT_FOUND, "Content not found", 404)
    return success_response({"current": item.get("s3_key"), "previous": item.get("previous_s3_key"), "version": item.get("version", 1)})
