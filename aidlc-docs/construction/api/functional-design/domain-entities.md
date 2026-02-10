# Domain Entities — Unit 3: API Services

## DynamoDB Single-Table Design

All entities stored in one table. Key schema: `PK` (partition key), `SK` (sort key), `GSI1PK`/`GSI1SK` (Global Secondary Index 1).

---

## Entity: User

| Attribute | Type | Description |
|---|---|---|
| PK | `USER#{user_id}` | Partition key |
| SK | `PROFILE` | Sort key |
| email | string | Unique email address |
| role | enum: `learner`, `admin`, `reviewer` | User role |
| experience_level | enum: `beginner`, `intermediate`, `advanced` | Self-reported |
| learning_goals | list[string] | User's learning goals |
| technical_role | boolean | Technical vs non-technical |
| created_at | ISO datetime | Account creation timestamp |
| updated_at | ISO datetime | Last profile update |
| status | enum: `pending_verification`, `active`, `locked`, `deactivated` | Account status |
| failed_login_count | number | Consecutive failed logins (reset on success) |
| locked_until | ISO datetime | Account lockout expiry (null if not locked) |
| GSI1PK | `EMAIL#{email}` | For email-based lookups |
| GSI1SK | `USER` | GSI sort key |

**Access Patterns:**
- Get user by ID: `PK=USER#{user_id}, SK=PROFILE`
- Get user by email: `GSI1PK=EMAIL#{email}, GSI1SK=USER`

---

## Entity: Curriculum

| Attribute | Type | Description |
|---|---|---|
| PK | `USER#{user_id}` | Owner's partition key |
| SK | `CURRICULUM#{curriculum_id}` | Sort key |
| curriculum_id | string (ULID) | Unique curriculum ID |
| title | string | Generated curriculum title |
| topic | string | Original user input topic |
| test_type | string | Test type selected |
| program_level | enum: `certificate`, `diploma`, `degree` | Program level |
| discovery_method | enum: `free_text`, `wizard`, `admin_assigned` | How curriculum was created |
| status | enum: `generating`, `pending_review`, `published`, `archived` | Lifecycle status |
| execution_arn | string | Step Functions execution ARN |
| modules | list[Module] | Module structure (inline) |
| estimated_hours | number | Estimated completion time |
| created_at | ISO datetime | Creation timestamp |
| updated_at | ISO datetime | Last update |
| GSI1PK | `CURRICULUM#{curriculum_id}` | For direct curriculum lookup |
| GSI1SK | `META` | GSI sort key |

**Module (nested object):**
| Field | Type | Description |
|---|---|---|
| module_id | string | Module identifier |
| title | string | Module title |
| order | number | Sequence order |
| lessons | list[LessonRef] | Lesson references |

**LessonRef (nested object):**
| Field | Type | Description |
|---|---|---|
| lesson_id | string | Lesson identifier |
| title | string | Lesson title |
| order | number | Sequence within module |
| quiz_id | string | Associated quiz ID |

**Access Patterns:**
- List curricula by user: `PK=USER#{user_id}, SK begins_with CURRICULUM#`
- Get curriculum by ID: `GSI1PK=CURRICULUM#{curriculum_id}, GSI1SK=META`

---

## Entity: Content Metadata

| Attribute | Type | Description |
|---|---|---|
| PK | `CURRICULUM#{curriculum_id}` | Parent curriculum |
| SK | `CONTENT#{lesson_id}` | Sort key |
| lesson_id | string | Lesson identifier |
| s3_key | string | S3 object key for lesson content |
| content_type | enum: `lesson`, `quiz`, `diagram` | Content type |
| review_status | enum: `pending_review`, `approved`, `rejected` | Review state |
| reviewer_id | string | Reviewer who acted (null if pending) |
| reviewer_feedback | string | Rejection feedback (null if not rejected) |
| version | number | Current version number |
| previous_s3_key | string | S3 key for previous version (null if v1) |
| created_at | ISO datetime | Generation timestamp |
| updated_at | ISO datetime | Last update |
| GSI1PK | `REVIEW#{review_status}` | For review queue queries |
| GSI1SK | `{created_at}` | Ordered by creation date |

**Access Patterns:**
- Get content for curriculum: `PK=CURRICULUM#{curriculum_id}, SK begins_with CONTENT#`
- Get review queue: `GSI1PK=REVIEW#pending_review, GSI1SK` (ordered by age)

---

## Entity: Quiz

| Attribute | Type | Description |
|---|---|---|
| PK | `CURRICULUM#{curriculum_id}` | Parent curriculum |
| SK | `QUIZ#{quiz_id}` | Sort key |
| quiz_id | string | Quiz identifier |
| lesson_id | string | Associated lesson |
| questions | list[Question] | Quiz questions (inline) |
| difficulty_level | enum: `easy`, `medium`, `hard` | Current difficulty |
| review_status | enum: `pending_review`, `approved`, `rejected` | Review state |
| created_at | ISO datetime | Generation timestamp |

**Question (nested object):**
| Field | Type | Description |
|---|---|---|
| question_id | string | Question identifier |
| type | enum: `mcq`, `short_answer`, `practical` | Question type |
| text | string | Question text |
| options | list[string] | MCQ options (null for other types) |
| correct_answer | string | Correct answer or rubric key |
| difficulty | enum: `easy`, `medium`, `hard` | Individual question difficulty |
| points | number | Points value |

**Access Patterns:**
- Get quiz by curriculum+quiz_id: `PK=CURRICULUM#{curriculum_id}, SK=QUIZ#{quiz_id}`
- List quizzes for curriculum: `PK=CURRICULUM#{curriculum_id}, SK begins_with QUIZ#`

---

## Entity: Progress

| Attribute | Type | Description |
|---|---|---|
| PK | `USER#{user_id}` | Learner |
| SK | `PROGRESS#{curriculum_id}` | Sort key |
| curriculum_id | string | Curriculum being tracked |
| overall_percent | number | Overall completion percentage |
| current_module_id | string | Current module |
| current_lesson_id | string | Current lesson |
| status | enum: `in_progress`, `completed`, `paused` | Progress status |
| lessons_completed | map | `{lesson_id: {completed_at, score}}` |
| quiz_scores | map | `{quiz_id: {score, attempts, last_attempt_at}}` |
| adaptive_path | list[string] | Ordered lesson IDs (personalised path) |
| resume_state | ResumeState | Full pause/resume state |
| started_at | ISO datetime | When learner started |
| completed_at | ISO datetime | Completion timestamp (null if in progress) |
| last_activity_at | ISO datetime | Last interaction |
| GSI1PK | `CURRICULUM#{curriculum_id}` | For admin queries by curriculum |
| GSI1SK | `PROGRESS#{user_id}` | GSI sort key |

**ResumeState (nested object):**
| Field | Type | Description |
|---|---|---|
| lesson_id | string | Last active lesson |
| scroll_position | number | Scroll offset in pixels |
| quiz_state | map | In-progress quiz answers `{question_id: answer}` |
| form_inputs | map | Any unsaved form data |
| time_spent_seconds | number | Total time spent on current lesson |

**Access Patterns:**
- Get progress by user+curriculum: `PK=USER#{user_id}, SK=PROGRESS#{curriculum_id}`
- List all progress for user: `PK=USER#{user_id}, SK begins_with PROGRESS#`
- List all learners for curriculum (admin): `GSI1PK=CURRICULUM#{curriculum_id}, SK begins_with PROGRESS#`

---

## Entity: Assignment

| Attribute | Type | Description |
|---|---|---|
| PK | `USER#{learner_id}` | Assigned learner |
| SK | `ASSIGNMENT#{assignment_id}` | Sort key |
| assignment_id | string (ULID) | Unique assignment ID |
| curriculum_id | string | Assigned curriculum |
| assigned_by | string | Admin user_id |
| deadline | ISO datetime | Due date (null if no deadline) |
| status | enum: `pending`, `accepted`, `in_progress`, `completed`, `overdue` | Assignment status |
| created_at | ISO datetime | Assignment creation |
| GSI1PK | `ASSIGNMENT#{curriculum_id}` | For admin queries |
| GSI1SK | `{learner_id}` | GSI sort key |

**Access Patterns:**
- List assignments for learner: `PK=USER#{learner_id}, SK begins_with ASSIGNMENT#`
- List assignments for curriculum (admin): `GSI1PK=ASSIGNMENT#{curriculum_id}`

---

## Entity: Review Queue Item

Review queue is handled via Content Metadata entity's `GSI1PK=REVIEW#{review_status}` pattern. No separate entity needed — the Content Metadata entity serves double duty.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| ID generation | ULID | Sortable, unique, no coordination needed |
| Nested vs flat | Nested objects for modules/questions | Reduces item count, atomic reads |
| Quiz storage | Inline in single item | Quizzes are read as a whole unit |
| Resume state | Full state (C) | Best UX — scroll position, quiz state, form inputs, time |
| Review queue | GSI on content_metadata | No separate entity — reuses existing data |
