from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import boto3
import ulid

from shared.config import config
from shared.db import Keys, db_client
from shared.models.responses import CONFLICT, NOT_FOUND, error_response, success_response

sfn = boto3.client("stepfunctions")

CATEGORIES_PATH = Path(__file__).parent / "categories.json"


def generate_curriculum(user_id: str, topic: str, test_type: str, program_level: str, discovery_method: str = "free_text") -> dict:
    curriculum_id = str(ulid.new())
    now = datetime.utcnow().isoformat()

    execution = sfn.start_execution(
        stateMachineArn=config.PIPELINE_STATE_MACHINE_ARN,
        name=curriculum_id,
        input=json.dumps({"curriculum_id": curriculum_id, "user_id": user_id, "topic": topic, "test_type": test_type, "program_level": program_level}),
    )

    db_client.put_item({
        "PK": Keys.user_pk(user_id),
        "SK": Keys.curriculum_sk(curriculum_id),
        "GSI1PK": Keys.curriculum_gsi1pk(curriculum_id),
        "GSI1SK": "META",
        "curriculum_id": curriculum_id,
        "user_id": user_id,
        "topic": topic,
        "test_type": test_type,
        "program_level": program_level,
        "discovery_method": discovery_method,
        "status": "generating",
        "execution_arn": execution["executionArn"],
        "modules": [],
        "created_at": now,
        "updated_at": now,
    })

    return success_response({"curriculum_id": curriculum_id, "status": "generating"}, 202)


def get_curriculum(curriculum_id: str) -> dict:
    result = db_client.query(Keys.curriculum_gsi1pk(curriculum_id), "META", index_name="GSI1")
    if not result["items"]:
        return error_response(NOT_FOUND, "Curriculum not found", 404)
    item = result["items"][0]
    return success_response({k: v for k, v in item.items() if not k.startswith(("PK", "SK", "GSI"))})


def list_curricula(user_id: str) -> dict:
    # Own curricula
    result = db_client.query(Keys.user_pk(user_id), "CURRICULUM#")
    items = [{k: v for k, v in i.items() if not k.startswith(("PK", "SK", "GSI"))} for i in result["items"]]
    # Assigned curricula
    assigned = db_client.query(Keys.user_pk(user_id), "ASSIGN#")
    for a in assigned["items"]:
        cid = a.get("curriculum_id", "")
        if cid and not any(i.get("curriculum_id") == cid for i in items):
            # Fetch curriculum metadata
            curr = db_client.query(Keys.curriculum_gsi1pk(cid), "META", index_name="GSI1")
            if curr["items"]:
                entry = {k: v for k, v in curr["items"][0].items() if not k.startswith(("PK", "SK", "GSI"))}
                entry["assigned"] = True
                entry["deadline"] = a.get("deadline")
                items.append(entry)
    return success_response(items)


def poll_status(curriculum_id: str) -> dict:
    result = db_client.query(Keys.curriculum_gsi1pk(curriculum_id), "META", index_name="GSI1")
    if not result["items"]:
        return error_response(NOT_FOUND, "Curriculum not found", 404)

    item = result["items"][0]
    status = item.get("status")

    if status == "generating" and item.get("execution_arn"):
        exec_resp = sfn.describe_execution(executionArn=item["execution_arn"])
        sfn_status = exec_resp["status"]
        if sfn_status == "SUCCEEDED":
            db_client.update_item(item["PK"], item["SK"], {"status": "pending_review", "updated_at": datetime.utcnow().isoformat()})
            status = "pending_review"
        elif sfn_status == "FAILED":
            db_client.update_item(item["PK"], item["SK"], {"status": "failed", "updated_at": datetime.utcnow().isoformat()})
            status = "failed"

    return success_response({"status": status, "started_at": item.get("created_at")})


def assign_curriculum(admin_id: str, curriculum_id: str, learner_ids: list[str], deadline: str | None = None) -> dict:
    for raw_id in learner_ids:
        # Resolve email to user_id if needed
        learner_id = raw_id
        if "@" in raw_id:
            result = db_client.query(Keys.email_gsi1pk(raw_id), "USER", index_name="GSI1")
            if not result["items"]:
                return error_response(NOT_FOUND, f"Learner {raw_id} not found")
            learner_id = result["items"][0].get("user_id", raw_id)
        existing = db_client.query(Keys.user_pk(learner_id), f"ASSIGNMENT#")
        dupes = [a for a in existing["items"] if a.get("curriculum_id") == curriculum_id]
        if dupes:
            return error_response(CONFLICT, f"Learner {learner_id} already assigned to this curriculum", 409)

        assignment_id = str(ulid.new())
        db_client.put_item({
            "PK": Keys.user_pk(learner_id),
            "SK": Keys.assignment_sk(assignment_id),
            "GSI1PK": Keys.assignment_gsi1pk(curriculum_id),
            "GSI1SK": learner_id,
            "assignment_id": assignment_id,
            "curriculum_id": curriculum_id,
            "learner_id": learner_id,
            "assigned_by": admin_id,
            "deadline": deadline,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
        })

    return success_response({"message": f"Curriculum assigned to {len(learner_ids)} learner(s)"}, 201)


def archive_curriculum(user_id: str, curriculum_id: str) -> dict:
    result = db_client.query(Keys.curriculum_gsi1pk(curriculum_id), "META", index_name="GSI1")
    if not result["items"]:
        return error_response(NOT_FOUND, "Curriculum not found", 404)

    item = result["items"][0]
    db_client.update_item(item["PK"], item["SK"], {"status": "archived", "updated_at": datetime.utcnow().isoformat()})
    return success_response({"message": "Curriculum archived"})


def get_wizard_categories() -> dict:
    with open(CATEGORIES_PATH) as f:
        categories = json.load(f)
    return success_response(categories)
