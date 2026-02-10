# Domain Entities — Unit 4: AI Agents

## Agent-Specific Entities

These entities are internal to the agent layer. Platform-wide entities (User, Curriculum, etc.) are defined in the shared library.

### ResearchFindings
Produced by Research Agent, consumed by Content and Assessment Agents via Step Functions.

```python
class ResearchFindings:
    title: str
    description: str
    prerequisites: list[str]
    estimated_hours: float
    modules: list[ModuleOutline]

class ModuleOutline:
    title: str
    description: str
    lessons: list[LessonOutline]

class LessonOutline:
    title: str
    description: str
    key_concepts: list[str]
    learning_objectives: list[str]
```

### LessonContent
Produced by Content Agent, stored in S3.

```python
class LessonContent:
    markdown_content: str
    subtitle_text: str
    s3_key: str
```

### QuizData
Produced by Assessment Agent, stored in S3/DynamoDB.

```python
class QuizQuestion:
    id: str
    type: str           # "mcq" | "short_answer" | "practical"
    blooms_level: int    # 1-6
    text: str
    options: list[str] | None
    correct_answer: str
    rubric: str | None
    points: int

class QuizData:
    questions: list[QuizQuestion]

class GradingResult:
    score: float
    total_points: int
    earned_points: int
    per_question: list[QuestionResult]
    new_blooms_level: int

class QuestionResult:
    question_id: str
    correct: bool
    points_earned: int
    feedback: str
```

### LearnerProfile
Stored in AgentCore memory by Personalisation Agent.

```python
class LearnerProfile:
    user_id: str
    curriculum_id: str
    pre_assessment_scores: dict[str, float]
    quiz_scores: dict[str, float]
    current_blooms_level: int
    last_updated: str
```

### AdaptivePath
Produced by Personalisation Agent.

```python
class PathEntry:
    module_index: int
    lesson_index: int
    status: str      # "required" | "optional" | "skip"
    reason: str

class AdaptivePath:
    path: list[PathEntry]
    recommendations: list[str]
```
