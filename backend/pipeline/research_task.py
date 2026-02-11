"""Step Functions task: Research — generates curriculum outline via Bedrock."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from agents.research.agent import research_topic


def lambda_handler(event, context):
    topic = event["topic"]
    program_level = event.get("programLevel", event.get("program_level", "intermediate"))
    test_type = event.get("testType", event.get("test_type", "quiz"))
    curriculum_id = event.get("curriculumId", event.get("curriculum_id", "unknown"))

    findings = research_topic(topic, program_level, test_type)
    findings["curriculum_id"] = curriculum_id

    return findings
