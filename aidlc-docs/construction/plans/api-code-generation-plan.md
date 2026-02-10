# Code Generation Plan — Unit 3: API Services

## Unit Context
- **Unit**: API Services (Python/Lambda Powertools)
- **Location**: `backend/api/` in workspace root
- **Framework**: AWS Lambda Powertools (Event Handler, Logger, Validation)
- **Validation**: Pydantic v2
- **Layer**: SharedLayer from `backend/shared/` (Unit 2 — auto-built by CDK)
- **Dependencies**: Unit 1 (Infrastructure — CDK stacks), Unit 2 (Shared Library — models, db, auth utils)

## Stories Covered
- **Primary**: US-001, US-002, US-003, US-004, US-005, US-006, US-008, US-017
- **Secondary**: US-007, US-009, US-010, US-011, US-012, US-013, US-014, US-015, US-016

## Design References
- `aidlc-docs/construction/api/functional-design/domain-entities.md`
- `aidlc-docs/construction/api/functional-design/business-rules.md`
- `aidlc-docs/construction/api/functional-design/business-logic-model.md`
- `aidlc-docs/construction/api/nfr-design/nfr-design-patterns.md`
- `aidlc-docs/construction/api/nfr-design/logical-components.md`
- `aidlc-docs/construction/api/infrastructure-design/infrastructure-design.md`
- `aidlc-docs/construction/api/infrastructure-design/deployment-architecture.md`

---

## Code Generation Steps

- [x] **Step 1**: Create shared library foundation (Unit 2 dependency)
  - [x] `backend/shared/shared/__init__.py`
  - [x] `backend/shared/shared/config.py`
  - [x] `backend/shared/shared/models/__init__.py`
  - [x] `backend/shared/shared/models/entities.py`
  - [x] `backend/shared/shared/models/responses.py`
  - [x] `backend/shared/shared/auth/__init__.py`
  - [x] `backend/shared/shared/auth/middleware.py`
  - [x] `backend/shared/shared/db/__init__.py`
  - [x] `backend/shared/shared/db/client.py`
  - [x] `backend/shared/shared/db/keys.py`
  - [x] `backend/shared/shared/s3/__init__.py`
  - [x] `backend/shared/shared/s3/client.py`
  - [x] `backend/shared/pyproject.toml`

- [x] **Step 2**: Create Auth Service (US-001, US-002, US-003)
  - [x] `backend/api/auth/handler.py`
  - [x] `backend/api/auth/schemas.py`
  - [x] `backend/api/auth/service.py`

- [x] **Step 3**: Create Curriculum Service (US-004, US-005, US-006)
  - [x] `backend/api/curriculum/handler.py`
  - [x] `backend/api/curriculum/schemas.py`
  - [x] `backend/api/curriculum/service.py`
  - [x] `backend/api/curriculum/categories.json`

- [x] **Step 4**: Create Content Service (US-008)
  - [x] `backend/api/content/handler.py`
  - [x] `backend/api/content/schemas.py`
  - [x] `backend/api/content/service.py`

- [x] **Step 5**: Create Assessment Service (US-009, US-011)
  - [x] `backend/api/assessment/handler.py`
  - [x] `backend/api/assessment/schemas.py`
  - [x] `backend/api/assessment/service.py`

- [x] **Step 6**: Create Progress Service (US-014, US-015)
  - [x] `backend/api/progress/handler.py`
  - [x] `backend/api/progress/schemas.py`
  - [x] `backend/api/progress/service.py`

- [x] **Step 7**: Create Admin Service (US-016, US-017)
  - [x] `backend/api/admin/handler.py`
  - [x] `backend/api/admin/schemas.py`
  - [x] `backend/api/admin/service.py`

- [x] **Step 8**: Update CDK ApiStack for Unit 3 integration
  - [x] Update `infra/lib/api-stack.ts`

- [x] **Step 9**: Generate code summary documentation
  - [x] `aidlc-docs/construction/api/code/code-summary.md`
