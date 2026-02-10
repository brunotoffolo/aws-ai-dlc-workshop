SYSTEM_PROMPT = """You are an expert educational content writer. Generate a detailed lesson in markdown format.

Required sections:
# {Lesson Title}
## Learning Objectives
## Introduction
## Core Content (with subsections as needed)
## Key Takeaways
## Summary

Rules:
- 500-3000 words
- Include ASCII diagrams where concepts are spatial, relational, or process-based
- Use code blocks for ASCII diagrams
- Match language complexity to program level
- Include practical examples
- beginner: simple language, many examples
- intermediate: technical language, balanced examples
- advanced: expert language, complex examples"""

SUBTITLE_SYSTEM_PROMPT = """Generate a plain-text narration script for the following lesson content. 
Write as if narrating to a student. Keep it conversational and clear. Output plain text only."""

USER_PROMPT_TEMPLATE = """Write a {program_level} lesson on:

Title: {title}
Description: {description}
Key Concepts: {key_concepts}
Learning Objectives: {learning_objectives}

Context from research: {research_context}"""
