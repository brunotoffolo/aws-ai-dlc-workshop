# Business Logic Model — Unit 4: AI Agents

## Research Agent

### Purpose
Generate structured research findings on a topic using Bedrock LLM knowledge (no web search or RAG for MVP).

### Pipeline
```
Input (topic, program_level)
  → Step 1: Topic analysis — identify key subtopics, prerequisites, learning objectives
  → Step 2: Content outline — generate module/lesson structure with descriptions
  → Step 3: Source synthesis — compile key concepts, definitions, examples per lesson
  → Output: structured research findings + curriculum outline
```

### Input Schema
```python
{
    "topic": str,           # e.g. "Kubernetes security"
    "program_level": str,   # "beginner" | "intermediate" | "advanced"
    "test_type": str,       # "quiz" | "exam" | "practical"
}
```

### Output Schema
```python
{
    "title": str,                    # Curriculum title
    "description": str,              # Curriculum description
    "prerequisites": list[str],      # Recommended prerequisites
    "estimated_hours": float,        # Estimated completion time
    "modules": [
        {
            "title": str,
            "description": str,
            "lessons": [
                {
                    "title": str,
                    "description": str,
                    "key_concepts": list[str],
                    "learning_objectives": list[str],
                }
            ]
        }
    ]
}
```

---

## Content Generation Agent

### Purpose
Generate lesson content (text + ASCII diagrams + subtitles) from research findings.

### Pipeline
```
Input (lesson outline, research findings)
  → Step 1: Generate lesson body (explanations, examples, summaries)
  → Step 2: Generate ASCII diagrams where applicable
  → Step 3: Generate subtitle text (for future video content)
  → Output: markdown content + subtitle text
```

### Input Schema
```python
{
    "lesson": {
        "title": str,
        "description": str,
        "key_concepts": list[str],
        "learning_objectives": list[str],
    },
    "research_findings": dict,   # Full research output for context
    "program_level": str,
}
```

### Output Schema
```python
{
    "markdown_content": str,     # Full lesson in markdown (includes ASCII diagrams)
    "subtitle_text": str,        # Plain text narration script for future video
    "s3_key": str,               # Generated S3 storage key
}
```

### Content Structure (per lesson)
```markdown
# {Lesson Title}

## Learning Objectives
- Objective 1
- Objective 2

## Introduction
[Context and motivation]

## Core Content
[Explanations with examples]

### Diagram
```
[ASCII diagram]
```

## Key Takeaways
- Takeaway 1
- Takeaway 2

## Summary
[Brief recap]
```

---

## Assessment Agent

### Purpose
Generate quizzes with adaptive difficulty and grade submissions.

### Quiz Generation Pipeline
```
Input (lesson content, difficulty, question_types)
  → Step 1: Analyse lesson for assessable concepts
  → Step 2: Generate questions per type (MCQ, short answer, practical)
  → Step 3: Tag each question with Bloom's taxonomy level
  → Step 4: Generate grading rubrics for non-MCQ questions
  → Output: questions + rubrics
```

### Grading Pipeline
```
Input (quiz questions, learner answers, rubrics)
  → MCQ: exact match scoring (auto)
  → Short answer: LLM rubric evaluation (0-100 per question)
  → Practical: LLM rubric evaluation with code analysis (if applicable)
  → Output: score, per-question feedback, updated difficulty state
```

### Adaptive Difficulty Algorithm (Bloom's + Rolling Threshold)

Questions are tagged with Bloom's taxonomy levels:
1. **Remember** — recall facts (easiest)
2. **Understand** — explain concepts
3. **Apply** — use knowledge in new situations
4. **Analyse** — break down and examine
5. **Evaluate** — justify decisions
6. **Create** — produce new work (hardest)

**Algorithm**:
- Learner starts at level determined by pre-assessment (default: Remember)
- Track rolling accuracy over last 10 questions at current level
- If accuracy > 80%: advance to next Bloom's level
- If accuracy < 50%: drop to previous Bloom's level
- If 50-80%: stay at current level, vary question difficulty within level
- Store current Bloom's level + rolling scores in DynamoDB progress

### Quiz Generation Input Schema
```python
{
    "lesson_content": str,       # Markdown lesson content
    "test_type": str,            # "quiz" | "exam" | "practical"
    "difficulty": str,           # "beginner" | "intermediate" | "advanced"
    "blooms_level": int,         # 1-6, current learner level
    "question_types": list[str], # ["mcq", "short_answer", "practical"]
    "question_count": int,       # Number of questions to generate
}
```

### Quiz Generation Output Schema
```python
{
    "questions": [
        {
            "id": str,
            "type": str,                    # "mcq" | "short_answer" | "practical"
            "blooms_level": int,            # 1-6
            "text": str,                    # Question text
            "options": list[str] | None,    # MCQ options (null for other types)
            "correct_answer": str,          # For MCQ
            "rubric": str | None,           # Grading rubric for non-MCQ
            "points": int,
        }
    ]
}
```

### Grading Output Schema
```python
{
    "score": float,              # 0-100 percentage
    "total_points": int,
    "earned_points": int,
    "per_question": [
        {
            "question_id": str,
            "correct": bool,
            "points_earned": int,
            "feedback": str,
        }
    ],
    "new_blooms_level": int,     # Updated level after this quiz
}
```

---

## Personalisation Agent

### Purpose
Analyse pre-assessment results and adjust learning paths. Uses AgentCore memory for minimal learner context (pre-assessment results + quiz scores).

### Pre-Assessment Analysis Pipeline
```
Input (user_id, curriculum_id, assessment_answers)
  → Step 1: Grade pre-assessment (same grading logic as Assessment Agent)
  → Step 2: Build knowledge profile (per-topic scores)
  → Step 3: Generate adaptive path (skip mastered, focus on gaps)
  → Step 4: Store profile in AgentCore memory
  → Output: knowledge profile + adaptive learning path
```

### Path Adjustment Pipeline
```
Input (user_id, curriculum_id, latest_quiz_results)
  → Step 1: Load learner profile from AgentCore memory
  → Step 2: Update topic scores based on quiz results
  → Step 3: Recalculate path if significant change detected
  → Step 4: Update AgentCore memory
  → Output: updated path + recommendations
```

### AgentCore Memory Schema (per learner-curriculum pair)
```python
{
    "user_id": str,
    "curriculum_id": str,
    "pre_assessment_scores": dict[str, float],  # topic → score (0-100)
    "quiz_scores": dict[str, float],            # lesson_order → score (0-100)
    "current_blooms_level": int,                # 1-6
    "last_updated": str,                        # ISO timestamp
}
```

### Adaptive Path Output Schema
```python
{
    "path": [
        {
            "module_index": int,
            "lesson_index": int,
            "status": str,          # "required" | "optional" | "skip"
            "reason": str,          # "knowledge gap" | "already proficient" | "prerequisite"
        }
    ],
    "recommendations": list[str],   # e.g. "Focus on Module 2 - scored 30% on related topics"
}
```
