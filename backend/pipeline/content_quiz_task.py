"""Step Functions task: Content + Quiz generation per lesson. Stores in S3, returns metadata only."""

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from agents.content_gen.agent import generate_lesson
from agents.assessment.agent import generate_quiz
from shared.s3 import s3_client
from shared.db import db_client


def lambda_handler(event, context):
    lesson = event["lesson"]
    research_findings = event.get("researchFindings", event.get("research_findings", {}))
    program_level = event.get("programLevel", event.get("program_level", "intermediate"))
    test_type = event.get("testType", event.get("test_type", "quiz"))
    blooms_level = event.get("bloomsLevel", event.get("blooms_level", 1))
    curriculum_id = event.get("curriculumId", event.get("curriculum_id", "unknown"))
    order = lesson.get("order", event.get("index", 1))

    # Generate content
    content = generate_lesson(lesson, research_findings, program_level)

    # Store lesson in S3
    lesson_key = f"{curriculum_id}/lessons/{order:04d}.md"
    s3_client.put_content(lesson_key, content["markdown_content"])

    # Store lesson metadata in DynamoDB
    db_client.put_item({
        "PK": f"CURR#{curriculum_id}",
        "SK": f"LESSON#{order:04d}",
        "GSI1PK": "STATUS#pending_review",
        "GSI1SK": f"CURR#{curriculum_id}",
        "curriculum_id": curriculum_id,
        "lesson_order": order,
        "title": lesson.get("title", ""),
        "s3_key": lesson_key,
        "status": "pending_review",
        "created_at": datetime.utcnow().isoformat(),
    })

    # Generate quiz
    quiz = generate_quiz(content["markdown_content"], test_type, blooms_level)

    # Store quiz in S3
    quiz_key = f"{curriculum_id}/quizzes/{order:04d}.json"
    s3_client.put_content(quiz_key, json.dumps(quiz), "application/json")

    # Store quiz metadata in DynamoDB
    db_client.put_item({
        "PK": f"CURR#{curriculum_id}",
        "SK": f"QUIZ#{order:04d}",
        "GSI1PK": "STATUS#pending_review",
        "GSI1SK": f"CURR#{curriculum_id}",
        "curriculum_id": curriculum_id,
        "lesson_order": order,
        "s3_key": quiz_key,
        "status": "pending_review",
        "question_count": len(quiz.get("questions", [])),
        "created_at": datetime.utcnow().isoformat(),
    })

    # Return metadata only (not full content) to stay under Step Functions payload limit
    return {
        "lesson_order": order,
        "title": lesson.get("title", ""),
        "lesson_s3_key": lesson_key,
        "quiz_s3_key": quiz_key,
        "status": "pending_review",
    }
