# Components

## Component Architecture Overview

The platform is organised into 5 layers: Frontend, API, Agent, Data, and Infrastructure.

---

## Layer 1: Frontend Components

### FC-01: Web Application (React + Vite + Tailwind + ShadCN)
- **Purpose**: User-facing SPA for learners, admins, and reviewers
- **Responsibilities**:
  - Render learner dashboard, curriculum views, lessons, quizzes
  - Render admin dashboard (progress tracking, course management, content review)
  - Handle user authentication flows
  - Manage client-side routing and state (TanStack Query)
- **Sub-components**:
  - Auth Module (login, registration, session management)
  - Learner Module (dashboard, curriculum browser, lesson viewer, quiz interface)
  - Admin Module (progress overview, course management, content review queue)
  - Shared UI (ShadCN component library, layout, navigation)

---

## Layer 2: API Components

### AC-01: API Gateway (AWS API Gateway + Lambda)
- **Purpose**: HTTP entry point for all client requests
- **Responsibilities**:
  - Route requests to appropriate Lambda handlers
  - Handle CORS, rate limiting, request validation
  - JWT token validation for authenticated routes

### AC-02: Auth Service (Lambda)
- **Purpose**: User authentication and session management
- **Responsibilities**:
  - User registration, login, email verification
  - JWT token issuance and refresh
  - Password reset flow

### AC-03: Curriculum Service (Lambda)
- **Purpose**: Curriculum CRUD and generation orchestration
- **Responsibilities**:
  - Accept curriculum generation requests (free-text, wizard, admin-assigned)
  - Invoke Orchestrator Agent to generate curriculum
  - Manage curriculum lifecycle (draft, pending review, published, archived)
  - Handle curriculum assignment to learners

### AC-04: Content Service (Lambda)
- **Purpose**: Content retrieval and management
- **Responsibilities**:
  - Serve lesson content from S3
  - Manage content review workflow (pending → approved/rejected)
  - Handle content versioning (current + previous)
  - Serve media assets (diagrams, slides)

### AC-05: Assessment Service (Lambda)
- **Purpose**: Quiz and test management
- **Responsibilities**:
  - Serve quizzes and collect responses
  - Trigger grading via Assessment Agent
  - Track quiz scores and adaptive difficulty state
  - Manage pre-assessment flow

### AC-06: Progress Service (Lambda)
- **Purpose**: Learner progress tracking
- **Responsibilities**:
  - Track lesson completion, quiz scores, curriculum progress
  - Handle pause/resume state persistence
  - Provide progress data for learner and admin dashboards

### AC-07: Admin Service (Lambda)
- **Purpose**: Admin dashboard operations
- **Responsibilities**:
  - Aggregate learner progress for admin views
  - Manage course catalog (list, archive, reassign)
  - Provide content review queue management

---

## Layer 3: Agent Components (Strands SDK + Bedrock AgentCore)

### AG-01: Orchestrator Agent
- **Purpose**: Coordinate the curriculum generation pipeline
- **Responsibilities**:
  - Receive curriculum generation request from Curriculum Service
  - Sequence calls to Research → Content → Assessment agents
  - Aggregate results into structured curriculum
  - Handle pipeline errors and retries

### AG-02: Research Agent
- **Purpose**: Deep research on requested topics
- **Responsibilities**:
  - Web search and summarisation of educational content
  - RAG over knowledge bases (if configured)
  - Multi-source synthesis and fact-checking
  - Return structured research findings to Orchestrator

### AG-03: Content Generation Agent
- **Purpose**: Generate educational materials
- **Responsibilities**:
  - Generate lesson text (explanations, examples, summaries)
  - Generate diagrams and visual aids
  - Generate subtitle text for video content
  - Output content in markdown format for S3 storage

### AG-04: Assessment Agent
- **Purpose**: Generate and grade quizzes/tests
- **Responsibilities**:
  - Generate quiz questions (MCQ, short answer, practical)
  - Implement adaptive difficulty algorithm
  - Grade submitted answers (auto-grade MCQ, rubric-evaluate text)
  - Generate pre-assessment quizzes

### AG-05: Personalisation Agent
- **Purpose**: Adaptive learning path management
- **Responsibilities**:
  - Analyse pre-assessment results to determine knowledge level
  - Generate adaptive learning paths (skip mastered, focus on gaps)
  - Monitor quiz performance and adjust path dynamically
  - Persist learner context via AgentCore memory

---

## Layer 4: Data Components

### DC-01: DynamoDB Tables
- **Purpose**: Structured data storage for all platform entities
- **Tables**:
  - `users` — user profiles, preferences, auth data
  - `curricula` — curriculum metadata, structure, status
  - `content_metadata` — lesson/quiz metadata, S3 keys, review status, version info
  - `progress` — learner progress per curriculum/lesson/quiz
  - `assignments` — admin-to-learner curriculum assignments
  - `review_queue` — content review items with status and reviewer feedback

### DC-02: S3 Buckets
- **Purpose**: Content body and media storage
- **Buckets**:
  - `content-bucket` — lesson markdown, quiz JSON, diagrams, slides
  - Versioning: current + previous version per content item (S3 object versioning with lifecycle policy)

### DC-03: AgentCore Memory Store
- **Purpose**: Persistent agent memory for learner context
- **Responsibilities**:
  - Store learner knowledge profiles across sessions
  - Store conversation/interaction history per learner-curriculum pair
  - Enable Personalisation Agent to recall context without re-assessment
