# Code Generation Plan — Unit 2: Shared Library

## Unit Context
- **Unit**: Shared Library (Python package)
- **Location**: `backend/shared/` in workspace root
- **Dependencies**: Unit 1 (table names, bucket names from infra)
- **Consumers**: Unit 3 (API Services), Unit 4 (AI Agents)
- **Deliverables**: DynamoDB data access layer, S3 utilities, common models, auth utilities, config

## Code Generation Steps

- [x] **Step 1**: Initialize Python package
  - [x] Create `backend/shared/` with `pyproject.toml`
  - [x] Create package structure

- [x] **Step 2**: Create domain models (Pydantic schemas)
  - [x] User, Curriculum, Lesson, Quiz, Progress, Assignment, ReviewItem models
  - [x] DynamoDB key builders (PK/SK/GSI patterns)

- [x] **Step 3**: Create DynamoDB data access layer
  - [x] Generic CRUD operations (put, get, query, update, delete)
  - [x] Entity-specific repositories (user, curriculum, content, progress, assignment, review)

- [x] **Step 4**: Create S3 content utilities
  - [x] Store/retrieve lesson content (markdown)
  - [x] Store/retrieve media (diagrams, images)
  - [x] Content versioning helpers

- [x] **Step 5**: Create auth utilities
  - [x] JWT token validation helper
  - [x] User context extraction from API Gateway event

- [x] **Step 6**: Create config module
  - [x] Environment variable loading (TABLE_NAME, CONTENT_BUCKET, etc.)

- [x] **Step 7**: Generate code summary
