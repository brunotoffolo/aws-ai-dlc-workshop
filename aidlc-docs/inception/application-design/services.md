# Services

## Service Layer Architecture

The service layer orchestrates interactions between API handlers, agents, and data stores. API services invoke agents via AgentCore. The curriculum generation pipeline is orchestrated by AWS Step Functions (deterministic workflow, no LLM reasoning needed).

---

## SVC-01: Curriculum Generation Service

**Purpose**: Orchestrate end-to-end curriculum generation from user request to reviewable content.

**Flow**:
```
User Request → Curriculum Service (Lambda)
  → Start Step Functions Execution
    → Step 1: Research Agent (AgentCore task) → research findings
    → Step 2: Generate lesson outline from research
    → Step 3: Map over lessons (parallel where possible):
        → Content Generation Agent (AgentCore task) → lesson content + diagrams
        → Assessment Agent (AgentCore task) → quizzes + rubrics
    → Step 4: Store content in S3 (pending review)
    → Step 5: Store metadata in DynamoDB (status: pending_review)
    → Step 6: Notify content review queue
```

**Orchestration Pattern**: AWS Step Functions state machine — deterministic sequential/parallel pipeline with built-in retries, timeouts, and error handling.

**Error Handling**:
- Step Functions native retry with exponential backoff per step
- If Research Agent fails: state machine enters failure state, Curriculum Service notified, user sees retry option
- If Content Agent fails on a lesson: Catch block skips lesson, marks as failed, continues pipeline, notifies admin
- If Assessment Agent fails: Catch block generates curriculum without quizzes, flags for manual quiz creation
- Dead letter queue for persistent failures

---

## SVC-02: Content Review Service

**Purpose**: Manage the human-in-the-loop content approval workflow (AWS Responsible AI compliance).

**Flow**:
```
Content generated → status: pending_review
  → Reviewer opens review queue
  → Reviewer examines content
    → APPROVE → status: published, visible to learners
    → REJECT with feedback → Content Agent regenerates → back to pending_review
    → EDIT inline → save edits with audit trail → status: published
```

**Versioning**: On regeneration or edit, previous version is preserved (current + previous only).

---

## SVC-03: Adaptive Learning Service

**Purpose**: Manage personalised learning paths using AgentCore memory.

**Flow**:
```
Learner starts curriculum
  → Pre-assessment quiz generated (Assessment Agent)
  → Learner completes pre-assessment
  → Personalisation Agent analyses results
  → Adaptive path generated (skip mastered, focus gaps)
  → Path stored in DynamoDB + AgentCore memory

Learner completes lesson quiz
  → Personalisation Agent evaluates performance
  → Path adjusted if needed (remedial content or skip-ahead)
  → Updated path stored
```

**Memory Pattern**: AgentCore stores learner knowledge profile persistently. On session resume, Personalisation Agent loads profile without re-assessment.

---

## SVC-04: Assessment & Grading Service

**Purpose**: Generate, serve, and grade all assessment types with adaptive difficulty.

**Flow**:
```
Quiz requested
  → Assessment Agent generates questions at current difficulty level
  → Questions enter review queue (if new) or served directly (if pre-approved)
  → Learner submits answers
  → Assessment Agent grades (auto for MCQ, rubric for text)
  → Score + feedback returned
  → Difficulty state updated for next quiz
```

**Adaptive Algorithm**: Track rolling accuracy over last N questions. Increase difficulty if >80%, decrease if <50%.

---

## SVC-05: Progress Tracking Service

**Purpose**: Track and persist all learner progress state.

**Responsibilities**:
- Lesson completion tracking (per lesson, per module, per curriculum)
- Quiz score history
- Pause/resume position (lesson + scroll position)
- Curriculum completion detection → trigger credential flow (Phase 2)

**Data Pattern**: Single DynamoDB table with composite keys: `PK=USER#{user_id}`, `SK=PROGRESS#{curriculum_id}#{lesson_id}`

---

## SVC-06: Admin Operations Service

**Purpose**: Provide admin dashboard data and course management operations.

**Responsibilities**:
- Aggregate learner progress across curricula for admin views
- Manage course lifecycle (draft → published → archived)
- Provide review queue metrics (pending count, age)
- Handle curriculum assignment workflows
