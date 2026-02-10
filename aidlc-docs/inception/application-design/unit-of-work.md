# Units of Work

## Project Structure
- **Repository**: Monorepo — single repository containing all backend services, agents, frontend, and infrastructure
- **Backend Services**: Python Lambda functions (FastAPI)
- **Agents**: Python containers on AgentCore runtime (Strands SDK)
- **Frontend**: React + Vite + Tailwind + ShadCN (deployed independently to S3/CloudFront)
- **Infrastructure**: AWS CDK (TypeScript)

## Deployment Model
- **API Services**: AWS Lambda behind API Gateway (serverless)
- **Agents**: AgentCore runtime containers (each agent = separate container)
- **Frontend**: S3 static hosting + CloudFront CDN
- **Data**: DynamoDB + S3

---

## Unit Definitions

### Unit 1: Infrastructure (infra)
- **Type**: CDK TypeScript project
- **Scope**: All AWS infrastructure provisioning
- **Deliverables**:
  - API Gateway configuration
  - Lambda function definitions for all API services
  - DynamoDB table definitions
  - S3 bucket definitions
  - CloudFront distribution for frontend
  - AgentCore agent definitions and container configurations
  - Step Functions state machine for curriculum generation pipeline
  - IAM roles and policies
  - Cognito or custom auth infrastructure (if needed)
- **Development Priority**: First — other units depend on infrastructure

### Unit 2: Shared Library (shared)
- **Type**: Python package
- **Scope**: Common code shared across API services and agents
- **Deliverables**:
  - DynamoDB data access layer (models, queries)
  - S3 content access utilities
  - Common types/schemas (curriculum, content, quiz, user models)
  - Auth utilities (JWT validation, user context)
  - Error handling and response formatting
  - Configuration management
- **Development Priority**: Second — API services and agents depend on shared code

### Unit 3: API Services (api)
- **Type**: Python Lambda functions (FastAPI)
- **Scope**: All REST API endpoints (Auth, Curriculum, Content, Assessment, Progress, Admin)
- **Deliverables**:
  - Auth Service — registration, login, email verification, JWT
  - Curriculum Service — generation requests, CRUD, assignments, wizard categories
  - Content Service — lesson retrieval, review queue, content approval workflow
  - Assessment Service — quiz serving, answer submission, grading, pre-assessment
  - Progress Service — progress tracking, pause/resume, dashboard data
  - Admin Service — learner overview, course management, review backlog
  - API route definitions and request/response schemas
- **Development Priority**: Third — depends on shared library and infrastructure

### Unit 4: AI Agents (agents)
- **Type**: Python containers on AgentCore runtime (Strands SDK)
- **Scope**: All AI agent implementations
- **Deliverables**:
  - Research Agent — web search, RAG, multi-source synthesis, fact-checking
  - Content Generation Agent — lessons, diagrams, subtitles
  - Assessment Agent — quiz generation, grading, adaptive difficulty
  - Personalisation Agent — pre-assessment analysis, adaptive paths, AgentCore memory
  - Agent tool definitions (Bedrock invocations, S3 access, web search)
  - AgentCore memory configuration
- **Note**: Orchestrator replaced by Step Functions (Unit 1) — 4 agents, not 5
- **Development Priority**: Third (parallel with API) — depends on shared library and infrastructure

### Unit 5: Frontend (frontend)
- **Type**: React + Vite + Tailwind + ShadCN
- **Scope**: Complete web application UI
- **Deliverables**:
  - Auth pages (login, register, verify email)
  - Learner dashboard (active curricula, progress, completed)
  - Curriculum discovery (free-text input, guided wizard)
  - Lesson viewer (content display, diagrams, progress tracking)
  - Quiz interface (MCQ, short answer, practical, adaptive)
  - Pre-assessment flow
  - Admin dashboard (learner overview, course management, content review queue)
  - Content review interface (approve/reject/edit)
  - TanStack Query API integration layer
  - Responsive layout and navigation
- **Development Priority**: Third (parallel with API and Agents) — depends on API contracts from Unit 3

---

## Monorepo Directory Structure

```
tutorial-platform/
+-- infra/                          # Unit 1: CDK Infrastructure
|   +-- bin/
|   |   +-- app.ts
|   +-- lib/
|   |   +-- api-stack.ts
|   |   +-- data-stack.ts
|   |   +-- agent-stack.ts
|   |   +-- pipeline-stack.ts          # Step Functions state machine
|   |   +-- frontend-stack.ts
|   +-- package.json
|   +-- tsconfig.json
|   +-- cdk.json
+-- backend/
|   +-- shared/                     # Unit 2: Shared Library
|   |   +-- models/
|   |   +-- db/
|   |   +-- s3/
|   |   +-- auth/
|   |   +-- config/
|   |   +-- pyproject.toml
|   +-- api/                        # Unit 3: API Services
|   |   +-- auth/
|   |   +-- curriculum/
|   |   +-- content/
|   |   +-- assessment/
|   |   +-- progress/
|   |   +-- admin/
|   |   +-- main.py
|   |   +-- pyproject.toml
|   +-- agents/                     # Unit 4: AI Agents (4 agents)
|   |   +-- research/
|   |   +-- content_gen/
|   |   +-- assessment/
|   |   +-- personalisation/
|   |   +-- tools/
|   |   +-- pyproject.toml
+-- frontend/                       # Unit 5: Frontend
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- hooks/
|   |   +-- api/
|   |   +-- lib/
|   +-- package.json
|   +-- vite.config.ts
|   +-- tailwind.config.ts
+-- README.md
```

## Development Sequence

```
Phase A (Sequential):
  Unit 1: Infrastructure  -->  Unit 2: Shared Library

Phase B (Parallel, after Phase A):
  Unit 3: API Services  |  Unit 4: AI Agents  |  Unit 5: Frontend

Phase C (Integration):
  Integration testing across all units
```
