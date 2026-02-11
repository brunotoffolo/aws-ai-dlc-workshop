from __future__ import annotations

from datetime import datetime, timedelta

import boto3

from shared.db import Keys, db_client
from shared.config import config
from shared.models.responses import success_response

INACTIVITY_DAYS = 7
_ddb = None


def _get_table():
    global _ddb
    if _ddb is None:
        _ddb = boto3.resource("dynamodb").Table(config.TABLE_NAME)
    return _ddb


def get_learner_overview(curriculum_id: str | None = None) -> dict:
    table = _get_table()
    # Scan for all user profiles
    resp = table.scan(
        FilterExpression="SK = :sk",
        ExpressionAttributeValues={":sk": "PROFILE"},
    )
    cutoff = (datetime.utcnow() - timedelta(days=INACTIVITY_DAYS)).isoformat()
    learners = []
    for item in resp.get("Items", []):
        if item.get("role") == "admin":
            continue
        learners.append({
            "user_id": item.get("user_id", ""),
            "email": item.get("email", ""),
            "role": item.get("role", "learner"),
            "status": item.get("status", ""),
            "created_at": item.get("created_at", ""),
            "last_activity": item.get("updated_at", ""),
            "inactive_flag": item.get("updated_at", "") < cutoff if item.get("updated_at") else True,
        })
    return success_response({"learners": learners})


def get_course_catalog() -> dict:
    table = _get_table()
    # Scan for all curriculum items
    resp = table.scan(
        FilterExpression="begins_with(SK, :sk)",
        ExpressionAttributeValues={":sk": "CURRICULUM#"},
    )
    courses = []
    for item in resp.get("Items", []):
        cid = item.get("curriculum_id", "")
        # Count lessons for this curriculum
        lesson_result = table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues={":pk": f"CURR#{cid}", ":sk": "LESSON#"},
            Select="COUNT",
        )
        courses.append({
            "curriculum_id": cid,
            "topic": item.get("topic", ""),
            "program_level": item.get("program_level", ""),
            "status": item.get("status", ""),
            "lesson_count": lesson_result.get("Count", 0),
            "created_at": item.get("created_at", ""),
            "user_id": item.get("user_id", ""),
        })
    return success_response({"courses": courses})


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
