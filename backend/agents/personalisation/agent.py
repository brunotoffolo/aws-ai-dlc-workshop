"""Personalisation Agent — adaptive learning paths via pre-assessment analysis."""

import json
import logging

from ..tools.bedrock import invoke_model_json
from .prompts import ASSESS_SYSTEM_PROMPT, ASSESS_USER_TEMPLATE

logger = logging.getLogger(__name__)

SKIP_THRESHOLD = 90.0
FOCUS_THRESHOLD = 40.0
PATH_RECALC_DEVIATION = 20.0


def assess_knowledge(curriculum_outline: dict, assessment_scores: dict[str, float]) -> dict:
    """Analyse pre-assessment and generate adaptive learning path."""
    user_prompt = ASSESS_USER_TEMPLATE.format(
        curriculum_outline=json.dumps(curriculum_outline, indent=2)[:3000],
        scores=json.dumps(assessment_scores, indent=2),
    )
    logger.info("personalisation_start", extra={"topic_count": len(assessment_scores)})
    result = invoke_model_json(ASSESS_SYSTEM_PROMPT, user_prompt)
    logger.info("personalisation_complete", extra={
        "required": sum(1 for p in result.get("path", []) if p["status"] == "required"),
        "optional": sum(1 for p in result.get("path", []) if p["status"] == "optional"),
        "skip": sum(1 for p in result.get("path", []) if p["status"] == "skip"),
    })
    return result


def should_recalculate_path(predicted_score: float, actual_score: float) -> bool:
    """Check if quiz score deviates enough to trigger path recalculation."""
    return abs(actual_score - predicted_score) > PATH_RECALC_DEVIATION


def adjust_path(current_path: list[dict], quiz_scores: dict[str, float], curriculum_outline: dict) -> dict:
    """Recalculate path based on updated quiz performance."""
    return assess_knowledge(curriculum_outline, quiz_scores)
