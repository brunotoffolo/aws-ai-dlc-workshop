# Story Generation Plan

## Plan Overview
This plan defines the methodology for creating user stories and personas for the on-demand tutorial platform. All questions must be answered before story generation begins.

---

## Section 1: Clarifying Questions

### User Personas

## Question 1
Beyond the corporate learner, what other user roles should the platform support?

A) Learner only — single role, self-service platform
B) Learner + Training Administrator (assigns courses, views team progress)
C) Learner + Training Admin + Content Reviewer (reviews/approves AI-generated content before publishing)
D) Learner + Training Admin + Content Reviewer + Manager (views team analytics/completion)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
What is the typical corporate learner profile?

A) Technical employees (developers, engineers, data scientists)
B) Non-technical employees (sales, marketing, HR, operations)
C) Mixed — platform should serve both technical and non-technical learners
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### User Journeys

## Question 3
How does a learner discover and start a new curriculum?

A) Free-text input only — learner types a topic and the system generates everything
B) Guided wizard — learner selects from categories, then refines with free-text
C) Both — free-text for experienced users, guided wizard for new users
D) Admin-assigned — training admin assigns curricula to learners
E) Other (please describe after [Answer]: tag below)

[Answer]: Free-text, guided wizard, and admin-assigned

## Question 4
Should learners be able to pause, resume, and revisit completed curricula?

A) Yes — full progress tracking with pause/resume and revisit
B) Pause/resume only — no revisiting completed content
C) Linear only — must complete in order, no pausing
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Story Breakdown Approach

## Question 5
Which story organisation approach do you prefer?

A) User Journey-Based — stories follow the learner's workflow (discover → learn → test → credential → share)
B) Feature-Based — stories organised around platform features (content gen, quizzes, credentials, etc.)
C) Epic-Based — high-level epics broken into smaller stories
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Acceptance Criteria

## Question 6
What level of detail do you want in acceptance criteria?

A) High-level — "Given/When/Then" format with key scenarios only
B) Detailed — comprehensive Given/When/Then with edge cases and error scenarios
C) Minimal — simple bullet-point checklist per story
D) Other (please describe after [Answer]: tag below)

[Answer]: B

### Business Context

## Question 7
Should the MVP stories include any admin/management capabilities, or purely learner-facing?

A) Learner-facing only for MVP — admin features in Phase 2
B) Learner + basic admin dashboard (view learner progress, manage courses)
C) Learner + full admin capabilities from the start
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8
How should the platform handle AI-generated content quality?

A) Fully automated — AI generates and publishes directly, no human review
B) AI generates with confidence scoring — low-confidence content flagged for review
C) All AI content requires human approval before learners see it
D) Configurable per organisation — admin chooses review policy
E) Other (please describe after [Answer]: tag below)

[Answer]: C, responsible AI.  Stick to this https://aws.amazon.com/ai/responsible-ai/policy/

---

## Section 2: Story Generation Execution Plan

Once questions are answered, the following steps will be executed:

- [ ] **Step 1**: Define user personas based on Q1-Q2 answers
  - [ ] Create primary persona (Corporate Learner)
  - [ ] Create additional personas based on answers
  - [ ] Define persona goals, pain points, and characteristics

- [ ] **Step 2**: Map user journeys based on Q3-Q4 answers
  - [ ] Define primary learner journey (discover → learn → test → credential)
  - [ ] Define secondary journeys (admin, content review) if applicable
  - [ ] Identify key interaction points with AI agents

- [ ] **Step 3**: Generate user stories using approach from Q5
  - [ ] Create stories for MVP scope (content generation + quizzes + adaptive learning)
  - [ ] Create stories for Phase 2 scope (accreditation + LinkedIn)
  - [ ] Apply INVEST criteria to each story
  - [ ] Add acceptance criteria per Q6 format preference

- [ ] **Step 4**: Generate acceptance criteria based on Q6 answer
  - [ ] Write acceptance criteria for each story
  - [ ] Include error scenarios and edge cases per detail level
  - [ ] Ensure testability of each criterion

- [ ] **Step 5**: Map personas to stories
  - [ ] Link each story to relevant persona(s)
  - [ ] Verify all personas have associated stories
  - [ ] Verify all MVP requirements are covered by stories

- [ ] **Step 6**: Organise and prioritise
  - [ ] Group stories by MVP vs Phase 2
  - [ ] Order stories within MVP by dependency and value
  - [ ] Create story summary with counts and coverage

- [ ] **Step 7**: Save artifacts
  - [ ] Save `aidlc-docs/inception/user-stories/personas.md`
  - [ ] Save `aidlc-docs/inception/user-stories/stories.md`
