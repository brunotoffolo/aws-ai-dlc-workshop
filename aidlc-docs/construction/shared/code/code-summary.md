# Code Summary — Unit 2: Shared Library

## Files Generated

| File | Purpose |
|---|---|
| `backend/shared/pyproject.toml` | Package config with boto3 + pydantic deps |
| `backend/shared/__init__.py` | Package exports |
| `backend/shared/config.py` | Environment variable loading (TABLE_NAME, CONTENT_BUCKET, USER_POOL_ID) |
| `backend/shared/models.py` | 7 Pydantic domain models + 4 enums (UserRole, CurriculumStatus, ContentStatus, ReviewAction) |
| `backend/shared/keys.py` | DynamoDB single-table key builders (PK/SK/GSI1 patterns for all entities) |
| `backend/shared/db.py` | DynamoDB CRUD operations (put, get, query, update, delete) |
| `backend/shared/s3.py` | S3 content storage (store/get markdown, store media, presigned URLs) |
| `backend/shared/auth.py` | User context extraction from API Gateway Cognito authorizer claims |

## Verification
- All models instantiate with correct defaults
- All key builders produce correct PK/SK/GSI patterns
- Auth utility extracts user context from API Gateway events
- Config loads environment variables with sensible defaults
