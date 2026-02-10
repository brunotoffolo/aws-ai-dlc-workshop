"""Research Agent — generates curriculum outline from topic using Bedrock LLM."""

import logging

from ..tools.bedrock import invoke_model_json
from ..tools.sanitise import sanitise_topic
from .prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


def research_topic(topic: str, program_level: str, test_type: str) -> dict:
    """Generate structured curriculum outline for a topic."""
    clean_topic = sanitise_topic(topic)
    user_prompt = USER_PROMPT_TEMPLATE.format(
        topic=clean_topic,
        program_level=program_level,
        test_type=test_type,
    )
    logger.info("research_start", extra={"topic": clean_topic, "level": program_level})
    result = invoke_model_json(SYSTEM_PROMPT, user_prompt)
    logger.info("research_complete", extra={"modules": len(result.get("modules", []))})
    return result
