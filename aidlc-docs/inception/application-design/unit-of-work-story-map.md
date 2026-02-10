# Unit of Work — Story Map

## MVP Story-to-Unit Mapping

| Story ID | Story Title | Primary Unit | Secondary Units | Notes |
|---|---|---|---|---|
| **Epic 1: Registration & Auth** |
| US-001 | User Registration | Unit 3 (API) | Unit 5 (Frontend), Unit 1 (Infra) | Auth Service + registration UI |
| US-002 | User Login | Unit 3 (API) | Unit 5 (Frontend) | Auth Service + login UI |
| US-003 | User Profile Management | Unit 3 (API) | Unit 5 (Frontend) | Auth Service + profile UI |
| **Epic 2: Curriculum Discovery** |
| US-004 | Free-Text Topic Input | Unit 3 (API) | Unit 4 (Agents), Unit 5 (Frontend) | Curriculum Service triggers Orchestrator Agent |
| US-005 | Guided Wizard Discovery | Unit 5 (Frontend) | Unit 3 (API) | Primarily UI, backed by Curriculum Service |
| US-006 | Admin-Assigned Curriculum | Unit 3 (API) | Unit 5 (Frontend) | Curriculum Service + admin UI |
| **Epic 3: Content Gen & Review** |
| US-007 | Lesson Content Generation | Unit 4 (Agents) | Unit 3 (API), Unit 2 (Shared) | Content Agent generates, stores in S3 via shared lib |
| US-008 | Content Review & Approval | Unit 3 (API) | Unit 5 (Frontend) | Content Service + review UI |
| **Epic 4: Pre-Assessment & Adaptive** |
| US-009 | Knowledge Pre-Assessment | Unit 4 (Agents) | Unit 3 (API), Unit 5 (Frontend) | Assessment + Personalisation Agents |
| US-010 | Adaptive Learning Path | Unit 4 (Agents) | Unit 3 (API) | Personalisation Agent + AgentCore memory |
| **Epic 5: Quizzes & Testing** |
| US-011 | Per-Lesson Quiz Generation | Unit 4 (Agents) | Unit 3 (API), Unit 5 (Frontend) | Assessment Agent generates, API serves |
| US-012 | Adaptive Quiz Difficulty | Unit 4 (Agents) | Unit 3 (API) | Assessment Agent adaptive algorithm |
| US-013 | Practical Assessments | Unit 4 (Agents) | Unit 3 (API), Unit 5 (Frontend) | Assessment Agent + submission UI |
| **Epic 6: Progress & Learning Mgmt** |
| US-014 | Progress Dashboard | Unit 5 (Frontend) | Unit 3 (API) | Frontend dashboard + Progress Service |
| US-015 | Pause, Resume & Revisit | Unit 3 (API) | Unit 5 (Frontend) | Progress Service + frontend state |
| **Epic 7: Admin Dashboard** |
| US-016 | Learner Progress Overview | Unit 5 (Frontend) | Unit 3 (API) | Admin UI + Admin Service |
| US-017 | Course Management | Unit 3 (API) | Unit 5 (Frontend) | Admin Service + management UI |

## Coverage Summary

| Unit | Primary Stories | Secondary Stories | Total Involvement |
|---|---|---|---|
| Unit 1: Infrastructure | 0 | 1 (US-001) | Supports all units (implicit) |
| Unit 2: Shared Library | 0 | 1 (US-007) | Supports all units (implicit) |
| Unit 3: API Services | 8 | 9 | 17 (all stories) |
| Unit 4: AI Agents | 5 | 1 | 6 stories |
| Unit 5: Frontend | 2 | 12 | 14 stories |

## Cross-Unit Stories (require coordination)

| Story | Units Involved | Coordination Need |
|---|---|---|
| US-004 (Free-Text Input) | Frontend → API → Step Functions → Agents | UI → Curriculum Service → Step Functions → Research/Content/Assessment Agents |
| US-007 (Content Generation) | Step Functions → Agents → Shared → API | Step Functions invokes Content Agent, stores via shared lib, API serves to reviewers |
| US-009 (Pre-Assessment) | Frontend → API → Agents | UI presents quiz, API routes, Assessment + Personalisation Agents process |
| US-011 (Quiz Generation) | Agents → API → Frontend | Agent generates, API serves, Frontend renders quiz interface |

## Phase 2 Story Mapping (for reference)

| Story ID | Story Title | Primary Unit | Notes |
|---|---|---|---|
| US-018 | Badge Issuance | Unit 4 (new Credential Agent) | New agent + API endpoint |
| US-019 | Certificate Generation | Unit 4 (Credential Agent) | PDF generation |
| US-020 | LinkedIn OAuth | Unit 3 (API) | New LinkedIn auth flow |
| US-021 | Post to LinkedIn | Unit 3 (API) | LinkedIn API integration |
| US-022 | Slide Deck Generation | Unit 4 (Content Agent) | Extend Content Agent |
| US-023 | Midterm & Final Exams | Unit 4 (Assessment Agent) | Extend Assessment Agent |
| US-024 | Team Analytics Dashboard | Unit 5 (Frontend) + Unit 3 (API) | New admin views |
