# Business Logic Model — Unit 3: API Services

## Service Orchestration Flows

---

## Flow 1: User Registration (Auth Service)

```
Client POST /auth/register {email, password, role?}
  |
  v
Validate password (BR-AUTH-01)
  |-- FAIL --> 400 {errors: ["min 8 chars", "needs uppercase", ...]}
  |
  v
Check email uniqueness (GSI1PK=EMAIL#{email})
  |-- EXISTS --> 409 {error: "Email already registered"}
  |
  v
Create Cognito user (email + password)
  |
  v
Create DynamoDB user record (status=pending_verification)
  |
  v
Cognito sends verification email (24h TTL)
  |
  v
201 {user_id, message: "Verification email sent"}
```

## Flow 2: User Login (Auth Service)

```
Client POST /auth/login {email, password}
  |
  v
Lookup user by email (GSI1)
  |-- NOT FOUND --> 401 {error: "Invalid email or password"}
  |
  v
Check locked_until (BR-AUTH-02)
  |-- LOCKED --> 403 {error: "Account locked", retry_after: remaining_seconds}
  |
  v
Check status == active
  |-- pending_verification --> 403 {error: "Email not verified"}
  |
  v
Cognito authenticate (email + password)
  |-- FAIL --> increment failed_login_count
  |           |-- count >= 5 --> set locked_until = now + 15min
  |           v
  |           401 {error: "Invalid email or password"}
  |
  v
Reset failed_login_count = 0
  |
  v
200 {access_token, refresh_token, user: {id, role, email}}
```

## Flow 3: Curriculum Generation — Free Text (Curriculum Service)

```
Client POST /curricula/generate {topic, test_type, program_level}
  |
  v
Validate input (Pydantic)
  |
  v
Generate curriculum_id (ULID)
  |
  v
Create curriculum record (status=generating, discovery_method=free_text)
  |
  v
Start Step Functions execution (pass: curriculum_id, topic, test_type, program_level, user_id)
  |
  v
Store execution_arn in curriculum record
  |
  v
202 {curriculum_id, status: "generating"}
```

## Flow 4: Curriculum Status Polling (Curriculum Service)

```
Client GET /curricula/{curriculum_id}/status
  |
  v
Get curriculum record (GSI1PK=CURRICULUM#{id})
  |-- NOT FOUND --> 404
  |
  v
If status == "generating":
  |
  v
  Describe Step Functions execution (execution_arn)
  |
  v
  Map execution status to current_step:
    RUNNING + step name --> {status: "generating", current_step: "researching|generating_content|generating_quizzes"}
    SUCCEEDED --> update curriculum status to "pending_review", return {status: "pending_review"}
    FAILED --> update curriculum status to "failed", return {status: "failed", error: message}
  |
  v
200 {status, current_step?, started_at}
```

## Flow 5: Content Review (Content Service)

```
Client POST /content/{content_id}/review {action, feedback?}
  |
  v
Verify caller role == reviewer or admin (BR-ADM-04)
  |
  v
Get content metadata (PK=CURRICULUM#{cid}, SK=CONTENT#{lid})
  |-- NOT FOUND --> 404
  |-- status != pending_review --> 409 {error: "Content not in reviewable state"}
  |
  v
Switch action:
  |
  |-- "approve":
  |     Update review_status = approved, reviewer_id = caller
  |     200 {status: "approved"}
  |
  |-- "reject":
  |     Validate feedback is non-empty
  |     Update review_status = rejected, reviewer_id = caller, reviewer_feedback = feedback
  |     200 {status: "rejected"}
  |
  |-- "edit":
  |     Save edited content to S3 as new version
  |     Move current s3_key to previous_s3_key, update s3_key to new
  |     Increment version, set review_status = approved
  |     200 {status: "approved", version: new_version}
```

## Flow 6: Content Regeneration — Manual Trigger (Content Service)

```
Client POST /content/{content_id}/regenerate
  |
  v
Verify caller role == reviewer or admin
  |
  v
Get content metadata
  |-- review_status != rejected --> 409 {error: "Only rejected content can be regenerated"}
  |
  v
Invoke Content Agent (AgentCore) with:
  - original lesson context (topic, module, outline)
  - reviewer_feedback as additional context
  |
  v
Store new content in S3, update metadata:
  - previous_s3_key = current s3_key
  - s3_key = new S3 key
  - review_status = pending_review
  - version++
  - reviewer_feedback = null
  |
  v
202 {status: "pending_review", message: "Content regenerated and queued for review"}
```

## Flow 7: Quiz Submission and Grading (Assessment Service)

```
Client POST /quizzes/{quiz_id}/submit {answers: [{question_id, answer}]}
  |
  v
Get quiz (PK=CURRICULUM#{cid}, SK=QUIZ#{quiz_id})
  |-- NOT FOUND or not approved --> 404
  |
  v
Grade each question:
  |
  |-- MCQ: compare answer to correct_answer --> correct/incorrect
  |-- Short answer: invoke Assessment Agent (AgentCore) with answer + rubric --> score + feedback
  |
  v
Calculate total score = sum(points for correct) / sum(total points) * 100
  |
  v
Update progress record:
  - quiz_scores[quiz_id] = {score, attempts++, last_attempt_at}
  - Update rolling accuracy for adaptive difficulty (BR-ASS-03)
  |
  v
200 {score, total_points, per_question: [{question_id, correct, your_answer, correct_answer, explanation}]}
```

## Flow 8: Progress Update and Resume (Progress Service)

```
--- Save Resume State ---
Client PUT /progress/{curriculum_id}/resume {lesson_id, scroll_position, quiz_state, form_inputs, time_spent_seconds}
  |
  v
Update progress record:
  - resume_state = full payload
  - last_activity_at = now
  |
  v
200 {success: true}

--- Get Resume State ---
Client GET /progress/{curriculum_id}/resume
  |
  v
Get progress record (PK=USER#{user_id}, SK=PROGRESS#{curriculum_id})
  |
  v
200 {resume_state: {lesson_id, scroll_position, quiz_state, form_inputs, time_spent_seconds}}

--- Mark Lesson Complete ---
Client POST /progress/{curriculum_id}/lessons/{lesson_id}/complete
  |
  v
Update progress record:
  - lessons_completed[lesson_id] = {completed_at: now, score: quiz_score}
  - Recalculate overall_percent
  - If overall_percent == 100 AND all quizzes passed --> status = completed, completed_at = now
  - Clear resume_state for this lesson
  |
  v
200 {overall_percent, status, completed_at?}
```

## Flow 9: Admin Learner Overview (Admin Service)

```
Client GET /admin/learners?curriculum_id=X&status=Y&page_token=Z
  |
  v
Verify caller role == admin
  |
  v
If curriculum_id provided:
  Query GSI1: GSI1PK=CURRICULUM#{curriculum_id}, SK begins_with PROGRESS#
Else:
  Scan with filters (paginated)
  |
  v
For each progress record:
  - Lookup user profile (PK=USER#{user_id}, SK=PROFILE) for name/email
  - Calculate inactivity flag (last_activity_at > 7 days ago)
  |
  v
200 {learners: [{user_id, name, email, curriculum_title, progress_percent, last_activity, inactive_flag}], next_page_token?}
```

## Flow 10: Guided Wizard (Curriculum Service)

```
Client GET /curricula/wizard/categories
  |
  v
Load categories.json (static config bundled with Lambda)
  |
  v
200 {categories: [{id, name, subcategories: [{id, name, topics: [{id, name, description}]}]}]}

--- After wizard completion, same as Flow 3 with discovery_method=wizard ---
```
