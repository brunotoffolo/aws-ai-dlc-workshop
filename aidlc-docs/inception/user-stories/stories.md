# User Stories

## Story Organisation
- **Approach**: Epic-based with sub-stories
- **Acceptance Criteria**: Detailed Given/When/Then with edge cases and error scenarios
- **INVEST Compliant**: All stories are Independent, Negotiable, Valuable, Estimable, Small, Testable

---

# MVP Epics (Phase 1)

---

## Epic 1: User Registration & Authentication

### US-001: User Registration
**As a** corporate learner,
**I want to** register with my email and password,
**So that** I can access the tutorial platform.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a new user on the registration page
When they enter a valid email and password (min 8 chars, 1 uppercase, 1 number, 1 special)
Then an account is created and a verification email is sent

Given a user enters an email already registered
When they submit the registration form
Then they see an error "Email already registered" and a link to login

Given a user enters a password that doesn't meet requirements
When they submit the form
Then they see specific validation errors indicating which requirements are not met

Given a user receives a verification email
When they click the verification link within 24 hours
Then their account is activated and they are redirected to login

Given a verification link older than 24 hours
When the user clicks it
Then they see "Link expired" with an option to resend verification
```

### US-002: User Login
**As a** registered user,
**I want to** log in with my email and password,
**So that** I can access my learning dashboard.

**Personas**: Alex, Maria, Jordan, Sam

**Acceptance Criteria**:

```gherkin
Given a registered user with valid credentials
When they enter email and password and submit
Then they are authenticated and redirected to their role-appropriate dashboard

Given a user enters incorrect credentials
When they submit the login form
Then they see "Invalid email or password" (no indication of which is wrong)

Given a user fails login 5 times consecutively
When they attempt a 6th login
Then the account is temporarily locked for 15 minutes with a message explaining the lockout
```

### US-003: User Profile Management
**As a** learner,
**I want to** set my learning preferences in my profile,
**So that** the platform can personalise my experience.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a logged-in learner on the profile page
When they set their role (technical/non-technical), experience level, and learning goals
Then preferences are saved and used by the Personalisation Agent for future content

Given a learner updates their preferences
When they return to an active curriculum
Then the adaptive learning path recalculates based on updated preferences
```

---

## Epic 2: Curriculum Discovery & Generation

### US-004: Free-Text Topic Input
**As a** technical learner,
**I want to** type a topic, test type, and program level in free text,
**So that** the platform generates a tailored curriculum for me.

**Personas**: Alex

**Acceptance Criteria**:

```gherkin
Given a learner on the curriculum creation page
When they enter a topic (e.g., "Kubernetes security"), select test type, and program level
Then the Orchestrator Agent initiates the curriculum generation pipeline

Given the Research Agent completes deep research on the topic
When results are synthesised
Then a structured curriculum outline (modules, lessons, assessments) is presented for review

Given the learner submits a vague or overly broad topic (e.g., "computers")
When the system processes the input
Then the system asks clarifying questions to narrow the scope before generating

Given the AI agents encounter an error during generation
When the pipeline fails
Then the learner sees a friendly error message with option to retry or modify their request
```

### US-005: Guided Wizard Discovery
**As a** non-technical learner,
**I want to** browse categories and refine my topic through a guided wizard,
**So that** I can find relevant learning content without knowing exact terminology.

**Personas**: Maria

**Acceptance Criteria**:

```gherkin
Given a learner selects "Guided Discovery" on the curriculum page
When the wizard loads
Then they see top-level categories (e.g., Business, Technology, Leadership, Data)

Given a learner selects a category
When they drill down
Then they see subcategories and suggested topics with descriptions

Given a learner completes the wizard selections
When they confirm their choices
Then the system generates a curriculum using the same pipeline as free-text input

Given a learner abandons the wizard midway
When they navigate away
Then their partial selections are preserved for 24 hours so they can resume
```

### US-006: Admin-Assigned Curriculum
**As a** training administrator,
**I want to** assign a curriculum to one or more learners,
**So that** I can ensure my team completes required training.

**Personas**: Jordan

**Acceptance Criteria**:

```gherkin
Given an admin on the assignment page
When they select a curriculum and one or more learners (or a group)
Then the curriculum appears in each learner's dashboard with an "Assigned" badge

Given an admin assigns a curriculum with a deadline
When the deadline is set
Then learners see the due date and receive reminder notifications at configurable intervals

Given a learner already has the same curriculum in progress
When the admin assigns it again
Then the system notifies the admin and does not create a duplicate

Given an admin assigns a curriculum to a learner who hasn't registered yet
When the assignment is made
Then the system queues the assignment and applies it when the learner registers
```

---

## Epic 3: AI Content Generation & Review

### US-007: Lesson Content Generation
**As a** learner,
**I want** the platform to generate detailed lessons with explanations and diagrams,
**So that** I can learn the topic thoroughly.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a curriculum has been generated and approved by a content reviewer
When a learner opens a lesson
Then they see structured content: learning objectives, explanations, examples, diagrams, and a summary

Given the Content Generation Agent produces a lesson
When the content is generated
Then it is placed in "Pending Review" status and is NOT visible to learners

Given a lesson contains technical concepts
When diagrams are applicable
Then the system auto-generates relevant diagrams and visual aids embedded in the lesson

Given a lesson includes video content
When the video is generated or uploaded
Then subtitles are auto-generated and embedded in the video player with option to toggle on/off

Given auto-generated subtitles are produced
When the content enters the review queue
Then the reviewer can edit subtitle text for accuracy before publishing
```

### US-008: Content Review & Approval Workflow
**As a** content reviewer,
**I want to** review all AI-generated content before it's published to learners,
**So that** content meets quality standards and AWS Responsible AI policy.

**Personas**: Sam, Jordan

**Acceptance Criteria**:

```gherkin
Given the Content Generation Agent produces new content
When generation completes
Then the content enters "Pending Review" queue visible to content reviewers

Given a reviewer opens a content item from the review queue
When they examine the content
Then they see the generated lesson/quiz with options to: Approve, Reject with feedback, or Edit inline

Given a reviewer rejects content with feedback
When feedback is submitted
Then the Content Generation Agent regenerates the content incorporating the feedback

Given a reviewer approves content
When approval is confirmed
Then the content status changes to "Published" and becomes visible to assigned learners

Given content has been pending review for more than 48 hours
When the threshold is exceeded
Then the Training Administrator receives a notification about the backlog

Given a reviewer edits content inline
When they save changes
Then the modified content is published with an audit trail showing original AI output and human edits
```

---

## Epic 4: Pre-Assessment & Adaptive Learning

### US-009: Knowledge Pre-Assessment
**As a** learner,
**I want to** take a pre-assessment before starting a curriculum,
**So that** the platform adapts the learning path to my existing knowledge.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a learner starts a new curriculum
When the curriculum loads
Then the Personalisation Agent presents a pre-assessment quiz covering key topics

Given a learner completes the pre-assessment
When results are analysed
Then the system generates an adaptive learning path: skipping mastered topics, focusing on gaps

Given a learner scores above 90% on a module's pre-assessment section
When the path is generated
Then that module is marked as "Optional - Already Proficient" but still accessible

Given a learner skips the pre-assessment
When they choose to skip
Then the system defaults to the full curriculum path starting from beginner level

Given the pre-assessment results are stored
When the learner returns in a future session
Then AgentCore memory recalls their knowledge profile without re-assessment
```

### US-010: Adaptive Learning Path
**As a** learner,
**I want** my learning path to adapt based on my quiz performance,
**So that** I spend time on topics I actually need to learn.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a learner completes a lesson quiz with score below 60%
When the Personalisation Agent analyses the results
Then additional remedial content is inserted into the learning path for that topic

Given a learner consistently scores above 85% on quizzes
When the pattern is detected
Then the system suggests skipping ahead or increasing difficulty level

Given a learner's performance changes significantly
When AgentCore memory detects the shift
Then the learning path is recalculated and the learner is notified of the adjustment
```

---

## Epic 5: Quizzes & Testing

### US-011: Per-Lesson Quiz Generation
**As a** learner,
**I want to** take a quiz after each lesson to check my understanding,
**So that** I can identify knowledge gaps immediately.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a learner completes a lesson
When they proceed to the quiz
Then the Assessment Agent generates questions covering the lesson's key concepts

Given a quiz is generated
When it is presented
Then it includes a mix of question types: multiple choice, short answer, and (for technical topics) hands-on exercises

Given a learner submits quiz answers
When grading completes
Then they see their score, correct answers, and explanations for incorrect answers

Given a quiz contains short-answer questions
When the learner submits text responses
Then the Assessment Agent evaluates against a rubric and provides specific feedback

Given the Assessment Agent generates a quiz
When generation completes
Then the quiz enters the content review queue before being available to learners
```

### US-012: Adaptive Quiz Difficulty
**As a** learner,
**I want** quiz difficulty to adjust based on my performance,
**So that** I'm appropriately challenged without being overwhelmed.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a learner has answered 5+ questions in a quiz session
When the Assessment Agent analyses the response pattern
Then subsequent questions adjust difficulty (harder if >80% correct, easier if <50% correct)

Given a learner struggles with a specific concept across multiple quizzes
When the pattern is detected
Then the system flags the concept as a knowledge gap and suggests targeted review content
```

### US-013: Practical Assessments
**As a** technical learner,
**I want to** complete practical exercises and projects,
**So that** I can apply what I've learned in realistic scenarios.

**Personas**: Alex

**Acceptance Criteria**:

```gherkin
Given a curriculum includes practical assessment modules
When the learner reaches a practical assessment
Then they see a project brief with objectives, requirements, and evaluation criteria

Given a learner submits a practical assessment
When the Assessment Agent evaluates the submission
Then they receive detailed feedback against the rubric with strengths and areas for improvement

Given a practical assessment requires code submission
When the learner submits code
Then the system evaluates correctness, code quality, and adherence to requirements
```

---

## Epic 6: Progress Tracking & Learning Management

### US-014: Progress Dashboard
**As a** learner,
**I want to** see my learning progress across all curricula,
**So that** I know where I stand and what's remaining.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a logged-in learner
When they view their dashboard
Then they see all active curricula with: progress percentage, current module, next lesson, and estimated time remaining

Given a learner has completed curricula
When they view the dashboard
Then completed curricula appear in a "Completed" section with final scores and completion dates

Given a learner has admin-assigned curricula with deadlines
When they view the dashboard
Then assigned curricula show the deadline and days remaining with visual urgency indicators
```

### US-015: Pause, Resume & Revisit
**As a** learner,
**I want to** pause my learning and resume exactly where I left off,
**So that** I can learn around my work schedule.

**Personas**: Alex, Maria

**Acceptance Criteria**:

```gherkin
Given a learner is mid-lesson and closes the browser
When they return and open the curriculum
Then they are offered to resume from their exact position (including scroll position within a lesson)

Given a learner has completed a curriculum
When they choose to revisit it
Then all content is accessible in read-only mode with their original quiz scores visible

Given a learner pauses a quiz midway
When they resume
Then unanswered questions are preserved and the timer (if any) reflects elapsed time
```

---

## Epic 7: Admin Dashboard (Basic)

### US-016: Learner Progress Overview
**As a** training administrator,
**I want to** view all learners' progress in a dashboard,
**So that** I can track training compliance and identify struggling learners.

**Personas**: Jordan

**Acceptance Criteria**:

```gherkin
Given an admin on the admin dashboard
When they view the learner overview
Then they see a table of learners with: name, assigned curricula, progress %, last activity date, and status

Given an admin filters by curriculum
When they select a specific curriculum
Then the view shows only learners assigned to that curriculum with their individual progress

Given a learner has not accessed their assigned curriculum for 7+ days
When the admin views the dashboard
Then that learner is flagged with an "Inactive" warning indicator
```

### US-017: Course Management
**As a** training administrator,
**I want to** manage generated curricula (view, archive, reassign),
**So that** I can maintain an organised course catalog.

**Personas**: Jordan

**Acceptance Criteria**:

```gherkin
Given an admin on the course management page
When they view the course list
Then they see all curricula with: title, creation date, status (draft/published/archived), assigned learner count

Given an admin archives a curriculum
When no learners are actively enrolled
Then the curriculum moves to archived status and is hidden from new assignments

Given an admin archives a curriculum with active learners
When they attempt to archive
Then they see a warning listing active learners and must confirm or reassign before archiving
```

---

# Phase 2 Epics

---

## Epic 8: Micro-Credentials & Digital Badges

### US-018: Badge Issuance
**As a** learner,
**I want to** receive a verifiable digital badge when I complete a curriculum,
**So that** I can demonstrate my achievement to employers and peers.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a learner completes all modules and passes all assessments in a curriculum
When completion is confirmed
Then the Credential Agent generates a digital badge with: learner name, curriculum title, completion date, issuer, and unique verification URL

Given a badge is issued
When anyone visits the verification URL
Then they see badge details, curriculum summary, and verification status (valid/revoked)

Given a learner fails the final assessment
When they do not meet the passing threshold
Then no badge is issued and the learner is offered remedial content and a retake option
```

### US-019: Certificate Generation
**As a** learner,
**I want to** download a PDF certificate for my completed curriculum,
**So that** I have a formal document for my records.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a learner has earned a badge for a curriculum
When they click "Download Certificate"
Then a branded PDF certificate is generated with: learner name, curriculum title, date, unique ID, and QR code linking to verification URL
```

---

## Epic 9: LinkedIn Integration

### US-020: LinkedIn OAuth Connection
**As a** learner,
**I want to** connect my LinkedIn account to the platform,
**So that** I can share my credentials on my professional profile.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a learner on the integrations settings page
When they click "Connect LinkedIn"
Then they are redirected to LinkedIn OAuth consent screen with requested permissions (profile, share, certifications)

Given a learner completes LinkedIn OAuth
When they return to the platform
Then their LinkedIn connection status shows "Connected" with their LinkedIn display name

Given a learner's LinkedIn token expires
When they attempt a LinkedIn action
Then the system prompts re-authentication without losing any pending actions
```

### US-021: Post Credential to LinkedIn
**As a** learner,
**I want to** post my earned credential to my LinkedIn feed and certifications section,
**So that** my professional network sees my achievement.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a learner has earned a badge and connected LinkedIn
When they click "Share to LinkedIn"
Then they see a preview of the post (certificate image, description, verification link) with option to edit before posting

Given the learner confirms the LinkedIn post
When the post is submitted
Then the credential is posted to their feed AND added to their LinkedIn Certifications section AND relevant skills are added to their profile

Given the LinkedIn API returns an error
When posting fails
Then the learner sees a friendly error message with option to retry, and the pending post is saved for later
```

---

## Epic 10: Advanced Content & Assessments

### US-022: Slide Deck Generation
**As a** learner,
**I want** auto-generated slide decks for each module,
**So that** I can review key concepts in presentation format.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a published lesson exists
When the Content Generation Agent processes it for slides
Then a downloadable slide deck is generated summarising key concepts with visuals
```

### US-023: Midterm & Final Exams
**As a** learner,
**I want to** take midterm and final exams for my curriculum,
**So that** I can demonstrate comprehensive understanding.

**Personas**: Alex, Maria
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a learner reaches the midpoint or end of a curriculum
When they access the exam
Then the Assessment Agent generates a comprehensive exam covering all modules studied so far

Given an exam is timed
When the timer expires
Then unanswered questions are marked as incorrect and the exam is auto-submitted
```

---

## Epic 11: Manager Analytics

### US-024: Team Analytics Dashboard
**As a** department manager,
**I want to** view aggregate training analytics for my team,
**So that** I can identify skill gaps and track training ROI.

**Personas**: Dana
**Phase**: Phase 2

**Acceptance Criteria**:

```gherkin
Given a manager on the analytics dashboard
When they view team metrics
Then they see: completion rates, average scores, time spent, skill coverage, and trending topics

Given a manager wants to identify skill gaps
When they view the skills matrix
Then they see a heatmap of team competencies across topic areas with gap indicators
```

---

## Story Summary

| Category | Epic | Story Count | Phase |
|---|---|---|---|
| Authentication | Epic 1: Registration & Auth | 3 (US-001 to US-003) | MVP |
| Discovery | Epic 2: Curriculum Discovery | 3 (US-004 to US-006) | MVP |
| Content | Epic 3: Content Gen & Review | 2 (US-007 to US-008) | MVP |
| Personalisation | Epic 4: Pre-Assessment & Adaptive | 2 (US-009 to US-010) | MVP |
| Testing | Epic 5: Quizzes & Testing | 3 (US-011 to US-013) | MVP |
| Progress | Epic 6: Progress & Learning Mgmt | 2 (US-014 to US-015) | MVP |
| Admin | Epic 7: Admin Dashboard | 2 (US-016 to US-017) | MVP |
| Credentials | Epic 8: Badges & Certificates | 2 (US-018 to US-019) | Phase 2 |
| LinkedIn | Epic 9: LinkedIn Integration | 2 (US-020 to US-021) | Phase 2 |
| Advanced Content | Epic 10: Slides & Exams | 2 (US-022 to US-023) | Phase 2 |
| Analytics | Epic 11: Manager Analytics | 1 (US-024) | Phase 2 |
| **Total** | **11 Epics** | **24 Stories** | **17 MVP / 7 Phase 2** |
