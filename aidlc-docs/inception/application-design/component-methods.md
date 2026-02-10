# Component Methods

Method signatures for each component. Detailed business rules will be defined in Functional Design (CONSTRUCTION phase).

---

## AC-02: Auth Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `register_user(email, password, role)` | email: str, password: str, role: enum | `{user_id, verification_token}` | Create new user account |
| `verify_email(token)` | token: str | `{success: bool}` | Activate account via email link |
| `login(email, password)` | email: str, password: str | `{access_token, refresh_token}` | Authenticate and issue JWT |
| `refresh_token(refresh_token)` | refresh_token: str | `{access_token}` | Refresh expired access token |
| `update_profile(user_id, preferences)` | user_id: str, preferences: dict | `{user}` | Update learner preferences |

## AC-03: Curriculum Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `generate_curriculum(user_id, topic, test_type, program_level, discovery_method)` | user_id: str, topic: str, test_type: enum, program_level: enum, discovery_method: enum | `{curriculum_id, execution_arn, status}` | Start Step Functions pipeline execution |
| `get_curriculum(curriculum_id)` | curriculum_id: str | `{curriculum}` | Retrieve curriculum with modules/lessons |
| `list_curricula(user_id, filters)` | user_id: str, filters: dict | `[{curriculum}]` | List user's curricula (active, completed, assigned) |
| `assign_curriculum(admin_id, curriculum_id, learner_ids, deadline)` | admin_id: str, curriculum_id: str, learner_ids: list, deadline: datetime | `{assignment_id}` | Admin assigns curriculum to learners |
| `archive_curriculum(admin_id, curriculum_id)` | admin_id: str, curriculum_id: str | `{success: bool}` | Archive a curriculum |
| `get_wizard_categories()` | none | `[{category}]` | Get guided wizard category tree |

## AC-04: Content Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `get_lesson(lesson_id, version)` | lesson_id: str, version: str | `{lesson_content, metadata}` | Retrieve lesson content from S3 |
| `list_review_queue(reviewer_id, filters)` | reviewer_id: str, filters: dict | `[{review_item}]` | List pending content for review |
| `review_content(reviewer_id, content_id, action, feedback)` | reviewer_id: str, content_id: str, action: enum(approve/reject/edit), feedback: str | `{updated_status}` | Approve, reject, or edit content |
| `get_content_versions(content_id)` | content_id: str | `{current, previous}` | Get current and previous content versions |

## AC-05: Assessment Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `get_quiz(quiz_id, user_id)` | quiz_id: str, user_id: str | `{quiz_questions, difficulty_level}` | Get quiz with adaptive difficulty |
| `submit_answers(quiz_id, user_id, answers)` | quiz_id: str, user_id: str, answers: list | `{score, feedback, detailed_results}` | Submit and grade quiz answers |
| `get_pre_assessment(curriculum_id, user_id)` | curriculum_id: str, user_id: str | `{assessment_questions}` | Get pre-assessment for a curriculum |
| `submit_pre_assessment(curriculum_id, user_id, answers)` | curriculum_id: str, user_id: str, answers: list | `{knowledge_profile, recommended_path}` | Submit pre-assessment and get adaptive path |

## AC-06: Progress Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `get_progress(user_id, curriculum_id)` | user_id: str, curriculum_id: str | `{progress}` | Get learner progress for a curriculum |
| `update_progress(user_id, curriculum_id, lesson_id, status)` | user_id: str, curriculum_id: str, lesson_id: str, status: enum | `{updated_progress}` | Update lesson completion status |
| `get_dashboard(user_id)` | user_id: str | `{active_curricula, completed, assigned}` | Get learner dashboard data |
| `save_resume_point(user_id, curriculum_id, position)` | user_id: str, curriculum_id: str, position: dict | `{success}` | Save pause/resume position |

## AC-07: Admin Service

| Method | Input | Output | Purpose |
|---|---|---|---|
| `get_learner_overview(admin_id, filters)` | admin_id: str, filters: dict | `[{learner_summary}]` | Get all learners with progress summary |
| `get_course_catalog(admin_id, filters)` | admin_id: str, filters: dict | `[{course_summary}]` | List all courses with status and enrollment |
| `get_review_backlog(admin_id)` | admin_id: str | `{pending_count, oldest_item_age}` | Get content review backlog metrics |

---

## Agent Methods

## IF-01: Curriculum Pipeline (Step Functions)

Pipeline is defined as infrastructure (CDK), not code methods. The state machine:
1. Invokes Research Agent (AgentCore task)
2. For each lesson in outline: invokes Content Agent + Assessment Agent (AgentCore tasks)
3. Stores results in S3/DynamoDB via shared library Lambda tasks
4. Updates curriculum status to `pending_review`

## AG-02: Research Agent

| Method | Input | Output | Purpose |
|---|---|---|---|
| `research_topic(topic, depth, program_level)` | topic: str, depth: enum, program_level: enum | `{findings, sources, outline}` | Deep research on topic with layered approach |

## AG-03: Content Generation Agent

| Method | Input | Output | Purpose |
|---|---|---|---|
| `generate_lesson(topic, outline, research_findings, format)` | topic: str, outline: dict, research_findings: dict, format: enum | `{markdown_content, diagrams, subtitle_text}` | Generate lesson content with visuals |

## AG-04: Assessment Agent

| Method | Input | Output | Purpose |
|---|---|---|---|
| `generate_quiz(lesson_content, difficulty, question_types)` | lesson_content: str, difficulty: enum, question_types: list | `{questions, rubrics}` | Generate quiz questions with grading rubrics |
| `grade_submission(quiz_id, answers, rubrics)` | quiz_id: str, answers: list, rubrics: dict | `{score, feedback, per_question_results}` | Grade quiz submission |

## AG-05: Personalisation Agent

| Method | Input | Output | Purpose |
|---|---|---|---|
| `assess_knowledge(user_id, curriculum_id, assessment_results)` | user_id: str, curriculum_id: str, assessment_results: dict | `{knowledge_profile, adaptive_path}` | Analyse pre-assessment and generate adaptive path |
| `adjust_path(user_id, curriculum_id, quiz_results)` | user_id: str, curriculum_id: str, quiz_results: dict | `{updated_path, recommendations}` | Adjust learning path based on ongoing performance |
