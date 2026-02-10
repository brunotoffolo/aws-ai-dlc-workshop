"""Content Generation Agent — generates lesson markdown + subtitles."""

import logging

from ..tools.bedrock import invoke_model
from .prompts import SYSTEM_PROMPT, SUBTITLE_SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)


def generate_lesson(lesson: dict, research_findings: dict, program_level: str) -> dict:
    """Generate lesson content with ASCII diagrams and subtitle text."""
    user_prompt = USER_PROMPT_TEMPLATE.format(
        program_level=program_level,
        title=lesson["title"],
        description=lesson["description"],
        key_concepts=", ".join(lesson.get("key_concepts", [])),
        learning_objectives=", ".join(lesson.get("learning_objectives", [])),
        research_context=research_findings.get("description", ""),
    )

    logger.info("content_gen_start", extra={"title": lesson["title"]})
    markdown_content = invoke_model(SYSTEM_PROMPT, user_prompt)

    subtitle_text = invoke_model(
        SUBTITLE_SYSTEM_PROMPT,
        f"Generate narration for this lesson:\n\n{markdown_content[:3000]}",
        max_tokens=2048,
    )

    s3_key = f"{research_findings.get('curriculum_id', 'unknown')}/lessons/{lesson.get('order', 0):04d}.md"
    logger.info("content_gen_complete", extra={"title": lesson["title"], "s3_key": s3_key})

    return {
        "markdown_content": markdown_content,
        "subtitle_text": subtitle_text,
        "s3_key": s3_key,
    }
