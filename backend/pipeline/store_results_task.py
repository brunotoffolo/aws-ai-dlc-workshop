"""Step Functions task: Update curriculum status after all lessons are generated."""

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from shared.db import db_client, Keys


def lambda_handler(event, context):
    curriculum_id = event.get("curriculumId", event.get("curriculum_id", "unknown"))
    user_id = event.get("userId", event.get("user_id", ""))
    lessons = event.get("lessons", [])

    # Update curriculum status to pending_review
    db_client.update_item(
        Keys.user_pk(user_id),
        Keys.curriculum_sk(curriculum_id),
        {"status": "pending_review", "lesson_count": len(lessons), "updated_at": datetime.utcnow().isoformat()},
    )

    return {"status": "pending_review", "lesson_count": len(lessons)}
