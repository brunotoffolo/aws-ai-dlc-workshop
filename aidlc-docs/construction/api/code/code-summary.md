# Code Summary — Unit 3: API Services

## Files Generated

### Shared Library (`backend/shared/`)
| File | Purpose |
|---|---|
| `pyproject.toml` | Package definition with dependencies |
| `shared/__init__.py` | Package init |
| `shared/config.py` | Environment variable loader |
| `shared/models/__init__.py` | Models package exports |
| `shared/models/entities.py` | 7 Pydantic domain entities + enums |
| `shared/models/responses.py` | Success/error envelope + 9 error codes |
| `shared/auth/__init__.py` | Auth package exports |
| `shared/auth/middleware.py` | JWT claim extraction + `@require_role` decorator |
| `shared/db/__init__.py` | DB package exports |
| `shared/db/keys.py` | DynamoDB PK/SK/GSI key builders |
| `shared/db/client.py` | DynamoDB client wrapper (get, put, update, delete, query) |
| `shared/s3/__init__.py` | S3 package exports |
| `shared/s3/client.py` | S3 client wrapper (get, put, presigned URL) |

### Auth Service (`backend/api/auth/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 6 routes (register, login, verify, refresh, get/update profile) |
| `schemas.py` | Pydantic request models (RegisterRequest, LoginRequest, etc.) |
| `service.py` | Business logic — password validation, lockout, Cognito integration |

### Curriculum Service (`backend/api/curriculum/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 7 routes (generate, list, get, status, wizard, assign, archive) |
| `schemas.py` | Pydantic request models (GenerateCurriculumRequest, AssignCurriculumRequest) |
| `service.py` | Business logic — Step Functions start/poll, CRUD, wizard categories |
| `categories.json` | Static wizard category tree (3 top-level: Business, Technology, Data) |

### Content Service (`backend/api/content/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 5 routes (get lesson, review queue, review, regenerate, versions) |
| `schemas.py` | Pydantic request models (ReviewRequest) |
| `service.py` | Business logic — review workflow (approve/reject/edit), versioning, regeneration |

### Assessment Service (`backend/api/assessment/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 4 routes (get quiz, submit, pre-assessment get/submit) |
| `schemas.py` | Pydantic request models (SubmitAnswersRequest) |
| `service.py` | Business logic — MCQ auto-grading, score tracking, pre-assessment |

### Progress Service (`backend/api/progress/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 5 routes (get progress, save/get resume, complete lesson, dashboard) |
| `schemas.py` | Pydantic request models (ResumeStateRequest) |
| `service.py` | Business logic — full-state resume, lesson completion, dashboard aggregation |

### Admin Service (`backend/api/admin/`)
| File | Purpose |
|---|---|
| `handler.py` | Lambda Powertools handler — 3 routes (learners, courses, review backlog) |
| `schemas.py` | Pydantic request models (LearnerQueryParams) |
| `service.py` | Business logic — learner overview, course catalog, review backlog metrics |

### CDK Update (`infra/lib/`)
| File | Purpose |
|---|---|
| `api-stack.ts` | Updated — added SharedLayer, arm64, correct handler paths, env vars per function |

## TODOs (Agent Integration — Unit 4)
- `content/service.py` — `regenerate_content()`: invoke Content Agent via AgentCore
- `assessment/service.py` — `submit_answers()`: short-answer grading via Assessment Agent
- `assessment/service.py` — `submit_pre_assessment()`: invoke Personalisation Agent for adaptive path
- `admin/service.py` — `get_course_catalog()`: implement full catalog scan/GSI

## Total: 31 files (13 shared + 18 API services)
