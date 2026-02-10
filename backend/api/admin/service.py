from __future__ import annotations

from datetime import datetime, timedelta

from shared.db import Keys, db_client
from shared.models.responses import success_response

INACTIVITY_DAYS = 7


def get_learner_overview(curriculum_id: str | None = None) -> dict:
    if curriculum_id:
        result = db_client.query(Keys.curriculum_gsi1pk(curriculum_id), "PROGRESS#", index_name="GSI1")
    else:
        # For MVP, scan is acceptable with 50 users
        result = db_client.query(Keys.review_gsi1pk("approved"), index_name="GSI1")  # placeholder
        result = {"items": []}  # TODO: implement full scan with pagination for admin

    learners = []
    cutoff = (datetime.utcnow() - timedelta(days=INACTIVITY_DAYS)).isoformat()
    for item in result["items"]:
        user_id = item.get("user_id", "")
        user = db_client.get_item(Keys.user_pk(user_id), Keys.profile_sk())
        learners.append({
            "user_id": user_id,
            "name": user.get("email", "") if user else "",
            "email": user.get("email", "") if user else "",
            "curriculum_id": item.get("curriculum_id"),
            "progress_percent": item.get("overall_percent", 0),
            "last_activity": item.get("last_activity_at"),
            "inactive_flag": item.get("last_activity_at", "") < cutoff if item.get("last_activity_at") else True,
        })

    return success_response({"learners": learners})


def get_course_catalog() -> dict:
    # For MVP with 50 users, simple approach: query known curricula
    # TODO: implement admin-specific GSI or scan for full catalog
    return success_response({"courses": []})


def get_review_backlog() -> dict:
    result = db_client.query(Keys.review_gsi1pk("pending_review"), index_name="GSI1")
    items = result["items"]
    pending_count = len(items)
    oldest_age_hours = 0
    if items:
        oldest = min(items, key=lambda x: x.get("created_at", ""))
        created = datetime.fromisoformat(oldest.get("created_at", datetime.utcnow().isoformat()))
        oldest_age_hours = (datetime.utcnow() - created).total_seconds() / 3600

    return success_response({"pending_count": pending_count, "oldest_item_age_hours": round(oldest_age_hours, 1)})
