# Business Rules — Unit 3: API Services

## Auth Service (AC-02)

### BR-AUTH-01: Password Policy
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character
- Validated at API level before Cognito call

### BR-AUTH-02: Account Lockout
- Track consecutive failed login attempts in DynamoDB (`failed_login_count`)
- After 5 consecutive failures: lock account for 15 minutes (`locked_until` timestamp)
- On successful login: reset `failed_login_count` to 0
- Locked account returns "Account temporarily locked" (no credential hint)

### BR-AUTH-03: Email Verification
- Verification link valid for 24 hours
- Expired link returns "Link expired" with resend option
- Unverified accounts cannot access any authenticated endpoint
- Resend verification: max 3 resends per 24-hour period

### BR-AUTH-04: Login Response
- Invalid credentials return generic "Invalid email or password" (never reveal which is wrong)
- Locked accounts return lockout message with remaining time

### BR-AUTH-05: Role Assignment
- Default role on registration: `learner`
- `admin` and `reviewer` roles assigned by existing admin only
- Role determines accessible API endpoints (enforced at API Gateway + Lambda)

---

## Curriculum Service (AC-03)

### BR-CUR-01: Curriculum Generation Request
- Required fields: `topic`, `test_type`, `program_level`
- `discovery_method` set automatically: `free_text` or `wizard` based on endpoint
- On submit: create curriculum record with `status=generating`, start Step Functions execution
- Store `execution_arn` for status polling

### BR-CUR-02: Generation Status Polling
- Endpoint: `GET /curricula/{id}/status`
- Returns: `{status, current_step, started_at}`
- `current_step` derived from Step Functions execution history API
- Poll interval recommendation: 5 seconds (communicated to frontend)

### BR-CUR-03: Curriculum Lifecycle
- States: `generating` → `pending_review` → `published` → `archived`
- Only `published` curricula visible to learners
- `generating` shows progress indicator to requesting user
- `archived` curricula hidden from new assignments but accessible to enrolled learners

### BR-CUR-04: Admin Assignment
- Admin can assign any `published` curriculum to learners
- Duplicate check: if learner already has same curriculum in progress, reject with notification
- Assignment to unregistered email: queue assignment, apply on registration
- Deadline is optional; if set, learner sees due date and urgency indicators

### BR-CUR-05: Guided Wizard Categories
- Categories loaded from static JSON config file (`categories.json`)
- Hierarchical: top-level → subcategories → suggested topics
- Wizard selection maps to a `topic` string for the generation pipeline

### BR-CUR-06: Archive Rules
- No active learners enrolled → archive immediately
- Active learners enrolled → warn admin, require confirmation
- Archived curricula: no new assignments, existing learners can still access

---

## Content Service (AC-04)

### BR-CON-01: Content Access Control
- Only `approved` content visible to learners
- `pending_review` and `rejected` content visible only to reviewers and admins
- Content served from S3 via pre-signed URLs (short TTL)

### BR-CON-02: Content Review Workflow
- New content enters `pending_review` automatically after pipeline generation
- Reviewer actions: `approve`, `reject` (with feedback), `edit` (inline)
- Approve → `review_status=approved`, content visible to learners
- Reject → `review_status=rejected`, `reviewer_feedback` stored, awaits manual re-trigger
- Edit → save edits as new version, auto-approve, audit trail preserved

### BR-CON-03: Content Versioning
- Max 2 versions: current + previous
- On new version: current becomes previous, new becomes current
- Previous version S3 key stored in `previous_s3_key`
- Learners always see current version only

### BR-CON-04: Content Regeneration (Manual Trigger)
- Reviewer rejects with feedback → content stays in `rejected` state
- Reviewer or admin manually triggers regeneration via `POST /content/{id}/regenerate`
- Regeneration invokes Content Agent with original context + reviewer feedback
- New content enters `pending_review` again

### BR-CON-05: Review Queue Backlog Alert
- Content pending review > 48 hours → flag in admin dashboard
- Ordered by creation date (oldest first) via GSI

---

## Assessment Service (AC-05)

### BR-ASS-01: Quiz Serving (Pre-Generated)
- Quizzes generated during curriculum pipeline and stored in DynamoDB
- `GET /quizzes/{quiz_id}` retrieves stored quiz
- Quiz must be `approved` (review_status) before serving to learners
- Questions returned without correct answers (answers stripped at API level)

### BR-ASS-02: Answer Submission and Grading
- Learner submits answers via `POST /quizzes/{quiz_id}/submit`
- MCQ: auto-graded by comparing to stored correct answers
- Short answer: graded by Assessment Agent (AgentCore invocation) against stored rubrics
- Response includes: score, per-question results, correct answers, explanations

### BR-ASS-03: Adaptive Difficulty Tracking
- Track rolling accuracy over last 10 questions per learner per curriculum
- Accuracy > 80% → flag for difficulty increase (used by Personalisation Agent)
- Accuracy < 50% → flag for difficulty decrease
- Difficulty state stored in Progress entity (`quiz_scores` map)

### BR-ASS-04: Pre-Assessment
- Triggered when learner starts a new curriculum
- Generated by Assessment Agent covering key topics across all modules
- Results sent to Personalisation Agent for adaptive path generation
- Learner can skip → defaults to full curriculum path at beginner level

---

## Progress Service (AC-06)

### BR-PRO-01: Lesson Completion
- Lesson marked complete when learner reaches end of content OR passes associated quiz
- Completion updates: `lessons_completed` map, `overall_percent` recalculated
- `overall_percent` = (completed lessons / total lessons) * 100

### BR-PRO-02: Curriculum Completion
- Curriculum complete when `overall_percent` = 100 AND all required quizzes passed
- On completion: `status=completed`, `completed_at` set
- Triggers credential flow (Phase 2 — no-op in MVP)

### BR-PRO-03: Pause/Resume (Full State)
- On pause (browser close, navigate away): frontend sends `PUT /progress/{curriculum_id}/resume`
- Persists: `lesson_id`, `scroll_position`, `quiz_state`, `form_inputs`, `time_spent_seconds`
- On resume: `GET /progress/{curriculum_id}/resume` returns full state
- Frontend restores exact position including scroll, quiz answers, form data

### BR-PRO-04: Dashboard Data
- Active curricula: `status=in_progress`, ordered by `last_activity_at`
- Completed curricula: `status=completed`, ordered by `completed_at`
- Assigned curricula: join with Assignment entity, show deadline and urgency
- Urgency indicators: green (>7 days), yellow (3-7 days), red (<3 days), overdue

### BR-PRO-05: Inactivity Detection
- Learner inactive > 7 days on assigned curriculum → flagged in admin dashboard
- Based on `last_activity_at` field comparison

---

## Admin Service (AC-07)

### BR-ADM-01: Learner Overview (Real-Time)
- Query all progress records for a curriculum via GSI: `GSI1PK=CURRICULUM#{curriculum_id}`
- Return: learner name, progress %, last activity, status
- Support filtering by curriculum, status, inactivity flag
- Pagination via DynamoDB `LastEvaluatedKey`

### BR-ADM-02: Course Catalog
- List all curricula across all users (admin-only GSI query)
- Return: title, status, creation date, assigned learner count
- Filter by status: `published`, `archived`, `generating`

### BR-ADM-03: Review Backlog Metrics
- Count items with `GSI1PK=REVIEW#pending_review`
- Calculate oldest item age from `created_at`
- Return: `{pending_count, oldest_item_age_hours}`

### BR-ADM-04: Role-Based Access
- Admin endpoints require `role=admin` in JWT claims
- Reviewer endpoints require `role=reviewer` or `role=admin`
- Learner endpoints accessible to all authenticated users
- Enforced at Lambda handler level via shared auth utility
