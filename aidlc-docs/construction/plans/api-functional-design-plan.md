# Functional Design Plan — Unit 3: API Services

## Unit Context
- **Unit**: API Services (Python/FastAPI on Lambda)
- **Location**: `backend/api/` in workspace root
- **Services**: Auth, Curriculum, Content, Assessment, Progress, Admin (6 Lambda functions)
- **Primary Stories**: US-001, US-002, US-003, US-004, US-005, US-006, US-008, US-017
- **Secondary Stories**: US-007, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016
- **Dependencies**: Unit 1 (Infrastructure), Unit 2 (Shared Library)

---

## Functional Design Steps

- [x] **Step 1**: Define domain entities and data model (DynamoDB access patterns)
- [x] **Step 2**: Define business rules and validation logic per service
- [x] **Step 3**: Define business logic model (service orchestration flows)
- [x] **Step 4**: Generate functional design artifacts

---

## Questions

Please answer the following questions to help clarify the functional design for the API Services unit.

## Question 1
How should the DynamoDB single-table design handle entity relationships? The current design uses `PK=USER#{user_id}`, `SK=PROGRESS#{curriculum_id}#{lesson_id}` for progress. What about curricula ownership and content metadata?

A) Strict single-table — ALL entities (users, curricula, content, progress, assignments, reviews) in one table with composite keys and GSIs
B) Logical separation — one main table for transactional data (users, curricula, progress, assignments) and a separate metadata table for content/review items
C) Per-entity tables — separate DynamoDB tables per entity type (simpler queries, more tables)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should curriculum generation status be tracked and communicated to the frontend?

A) Polling — frontend polls a status endpoint every N seconds until generation completes
B) WebSocket — real-time push notifications via API Gateway WebSocket API
C) Polling with progressive detail — poll returns increasing detail (pipeline step progress, estimated time)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
For the content review workflow, how should content regeneration work when a reviewer rejects with feedback?

A) Automatic — rejection triggers immediate re-generation by Content Agent with reviewer feedback injected as context
B) Manual trigger — reviewer rejects, admin or reviewer manually triggers re-generation when ready
C) Queue-based — rejected items enter a regeneration queue, processed in batch at intervals
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
How should the Admin Service handle learner progress aggregation for the dashboard?

A) Real-time queries — aggregate from DynamoDB on each request using GSI queries
B) Pre-computed summaries — background process (Lambda on schedule) computes and caches aggregates
C) Hybrid — real-time for individual learner views, pre-computed for aggregate/overview dashboards
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should API request validation and error responses be standardised across all 6 services?

A) FastAPI native — use Pydantic models for request/response validation with FastAPI's built-in error handling
B) Custom middleware — shared validation middleware in the shared library with custom error response format
C) FastAPI + custom error handler — Pydantic models for validation, custom exception handler for consistent error response envelope
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
For the Assessment Service, when a learner requests a quiz, should the API serve pre-generated quizzes or generate on-demand?

A) Pre-generated only — quizzes are generated during curriculum pipeline and stored; API just retrieves them
B) On-demand only — Assessment Agent generates a fresh quiz each time a learner requests one
C) Hybrid — pre-generated during pipeline for initial attempt, on-demand generation for retakes or adaptive difficulty adjustments
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
How should the Curriculum Service handle the guided wizard category data (US-005)?

A) Static configuration — categories stored as a JSON config file deployed with the Lambda, updated via code deployment
B) DynamoDB-backed — categories stored in DynamoDB, manageable by admins via API
C) Hardcoded initial set with admin CRUD — start with static categories, add admin endpoints to manage them later
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
For the Progress Service pause/resume feature (US-015), what level of granularity should be persisted?

A) Lesson-level — track which lesson the learner was on, resume from start of that lesson
B) Position-level — track lesson + scroll position + any in-progress quiz state
C) Full state — lesson + scroll position + quiz state + any form inputs + time spent
D) Other (please describe after [Answer]: tag below)

[Answer]: C
