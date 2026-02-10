# Requirements Document - On-Demand Tutorial Platform

## Intent Analysis Summary

- **User Request**: Build an on-demand tutorial platform with multi-agent AI architecture that auto-generates curriculum, educational materials, quizzes/tests, and accreditation materials, with LinkedIn integration for posting credentials
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: System-wide — multi-agent architecture, multiple AWS services, external integrations
- **Complexity Estimate**: Complex — AI agents, content generation, adaptive testing, external API integration, accreditation system
- **Approach**: MVP-first — core content generation + quizzes, then iterate to add accreditation and LinkedIn

---

## Functional Requirements

### FR-01: User Management
- **FR-01.1**: Users register and authenticate via email/password with optional social login
- **FR-01.2**: User profiles store learning preferences, progress, and completed credentials
- **FR-01.3**: Target audience is corporate employees in training programs
- **FR-01.4**: English-only UI with architecture supporting future internationalisation

### FR-02: Curriculum Generation
- **FR-02.1**: User inputs a topic, test type, and degree program to trigger curriculum generation
- **FR-02.2**: Multi-agent system generates a structured curriculum with modules, lessons, and assessments
- **FR-02.3**: Curriculum adapts to learner's pre-assessed knowledge level (adaptive learning paths)
- **FR-02.4**: Generated curriculum includes learning objectives, prerequisites, and estimated completion time

### FR-03: Content Generation
- **FR-03.1**: Auto-generate text-based lessons, explanations, and reading materials
- **FR-03.2**: Auto-generate diagrams, charts, and visual aids
- **FR-03.3**: Auto-generate slide decks / presentations
- **FR-03.4**: Auto-generate audio/video narration (future phase — not MVP)
- **FR-03.5**: Content is generated using Amazon Bedrock foundation models (Claude, Titan)

### FR-04: Deep Research
- **FR-04.1**: Web search and summarisation of existing educational content on a topic
- **FR-04.2**: RAG over curated knowledge bases and academic papers
- **FR-04.3**: Real-time research agent that searches multiple sources, synthesises, and fact-checks
- **FR-04.4**: Layered research — from simple search to deep synthesis — feeding into content generation

### FR-05: Quizzes and Testing
- **FR-05.1**: Per-lesson quizzes (knowledge checks)
- **FR-05.2**: Midterm/final exams (per-module/course assessments)
- **FR-05.3**: Practical assessments (projects, portfolios)
- **FR-05.4**: Support multiple question types: multiple choice, short answer/essay, practical/hands-on exercises
- **FR-05.5**: Adaptive difficulty — adjusts based on learner performance
- **FR-05.6**: Automated grading for objective questions; rubric-based evaluation for subjective answers

### FR-06: Accreditation & Credentials
- **FR-06.1**: Issue micro-credentials / digital badges upon course/program completion
- **FR-06.2**: Badges are verifiable (unique URL, metadata, issuer information)
- **FR-06.3**: Generate accreditation materials (certificate PDFs, badge images)
- **FR-06.4**: Track credential history per user

### FR-07: LinkedIn Integration
- **FR-07.1**: OAuth-based LinkedIn authentication for credential sharing
- **FR-07.2**: Post rich media (certificate image + description) to user's LinkedIn feed
- **FR-07.3**: Update user's LinkedIn Certifications section with earned credentials
- **FR-07.4**: Add relevant skills to user's LinkedIn profile
- **FR-07.5**: LinkedIn-only integration (no other social platforms)

### FR-08: Personalisation
- **FR-08.1**: Pre-assessment of learner's knowledge level before starting a curriculum
- **FR-08.2**: Adaptive learning paths based on assessment results
- **FR-08.3**: AgentCore memory capabilities to maintain learner context across sessions

---

## Non-Functional Requirements

### NFR-01: Performance
- Content generation latency should be acceptable for interactive use (streaming responses)
- Quiz generation should complete within seconds
- Platform should handle concurrent content generation requests

### NFR-02: Scalability
- Start small (MVP) with architecture designed to scale to thousands of concurrent users
- Serverless-first architecture (Lambda, API Gateway, DynamoDB) for auto-scaling
- Stateless agent design for horizontal scaling

### NFR-03: Security & Privacy
- Secure storage of user data and learning progress
- OAuth token management for LinkedIn integration
- API authentication and authorisation
- Data encryption at rest and in transit

### NFR-04: Cost Optimisation
- Efficient use of Bedrock model invocations (caching, batching where possible)
- Serverless to minimise idle costs
- DynamoDB on-demand capacity for cost-efficient scaling

### NFR-05: Reliability
- Graceful degradation if AI generation fails
- Retry mechanisms for agent tasks
- Error handling for LinkedIn API failures

### NFR-06: Maintainability
- Modular agent architecture — each agent independently deployable
- Infrastructure as Code (CDK/CloudFormation)
- Structured logging and observability

---

## Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Cloud Provider | AWS (fully) | User preference |
| Agent Framework | Strands Agents SDK + Bedrock AgentCore | User preference — AWS-native agent orchestration with memory |
| LLM Provider | Amazon Bedrock (Claude, Titan) | AWS-native, no external API dependencies |
| Frontend | React + Vite + Tailwind + ShadCN | User preference |
| Backend | Python (FastAPI) | User preference |
| Database | DynamoDB | User preference — serverless NoSQL |
| Deployment | Serverless (Lambda, API Gateway, DynamoDB) | User preference — cost-efficient, auto-scaling |
| LinkedIn Integration | LinkedIn API (OAuth 2.0) | Full profile integration (certifications, skills, feed posts) |
| Language | English only (i18n-ready architecture) | User preference |

---

## MVP Scope (Phase 1)

**Included in MVP:**
- User registration and authentication (email/password)
- Topic/test-type/program input interface
- Multi-agent curriculum generation (Strands + AgentCore)
- Text-based content generation with diagrams
- Quiz generation (multiple choice, short answer, adaptive)
- Pre-assessment and adaptive learning paths
- Basic user progress tracking

**Deferred to Phase 2:**
- Accreditation / micro-credential issuance
- LinkedIn integration
- Slide deck generation
- Audio/video narration
- Practical assessments (projects, portfolios)
- Midterm/final exams

---

## Agent Architecture Overview

| Agent / Component | Responsibility |
|---|---|
| Curriculum Pipeline (Step Functions) | Orchestrates deterministic workflow: Research → Content → Assessment. Built-in retries, timeouts, monitoring |
| Research Agent | Deep research — web search, RAG, multi-source synthesis, fact-checking |
| Content Generation Agent | Generates lessons, explanations, diagrams, visual aids, subtitles |
| Assessment Agent | Generates quizzes, tests, grading rubrics; handles adaptive difficulty |
| Personalisation Agent | Pre-assessment, learning path adaptation, learner context via AgentCore memory |
| Credential Agent (Phase 2) | Badge issuance, certificate generation, LinkedIn posting |
