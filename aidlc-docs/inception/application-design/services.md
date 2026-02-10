# Services

## Service Layer Architecture

The service layer orchestrates interactions between API handlers, agents, and data stores. All inter-agent communication is synchronous request-response via the Orchestrator Agent.

---

## SVC-01: Curriculum Generation Service

**Purpose**: Orchestrate end-to-end curriculum generation from user request to reviewable content.

**Flow**:
```
User Request → Curriculum Service (Lambda)
  → Orchestrator Agent
    → Research Agent (sync) → research findings
    → Content Generation Agent (sync, per lesson) → lesson content + diagrams
    → Assessment Agent (sync, per lesson) → quizzes + rubrics
  → Store content in S3 (pending review)
  → Store metadata in DynamoDB (status: pending_review)
  → Notify content review queue
```

**Orchestration Pattern**: Sequential pipeline — each agent receives output from the previous stage.

**Error Handling**:
- If Research Agent fails: return error to user with retry option
- If Content Agent fails on a lesson: skip lesson, mark as failed, continue pipeline, notify admin
- If Assessment Agent fails: generate curriculum without quizzes, flag for manual quiz creation

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
