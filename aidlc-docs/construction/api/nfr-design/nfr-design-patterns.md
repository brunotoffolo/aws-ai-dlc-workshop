# NFR Design Patterns — Unit 3: API Services

## Pattern 1: Structured Logging (Cross-Cutting)

**Pattern**: Lambda Powertools Logger with correlation ID and cold start detection.

**Implementation**:
- Each Lambda handler initialises `Logger(service="<service-name>")`
- Correlation ID injected automatically from API Gateway `requestContext.requestId`
- Cold start flag logged on first invocation
- Log level: `INFO` in prod, `DEBUG` in dev (via environment variable `LOG_LEVEL`)

**Log Structure** (JSON):
```json
{
  "level": "INFO",
  "service": "curriculum-service",
  "timestamp": "2026-02-10T18:00:00Z",
  "message": "Curriculum generation started",
  "correlation_id": "abc-123-def",
  "cold_start": false,
  "function_name": "api-curriculum",
  "xray_trace_id": "1-abc-def"
}
```

**Usage Pattern**:
```python
from aws_lambda_powertools import Logger
logger = Logger(service="curriculum-service")

@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def handler(event, context):
    logger.info("Processing request", extra={"curriculum_id": "..."})
```

---

## Pattern 2: Error Response Envelope (Cross-Cutting)

**Pattern**: Standardised error response envelope with error codes across all services.

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  }
}
```

**Error Codes**:

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request payload validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource state conflict (e.g., duplicate email, already archived) |
| `ACCOUNT_LOCKED` | 403 | Account temporarily locked |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification pending |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Downstream service failure |

**Implementation**: Shared exception classes in shared library, caught by Powertools exception handler middleware.

---

## Pattern 3: Auth Middleware (Cross-Cutting)

**Pattern**: JWT claim extraction and role-based access control at handler level.

**Flow**:
```
API Gateway Cognito Authorizer validates JWT
  --> Lambda receives event with requestContext.authorizer.claims
    --> Shared auth utility extracts user_id, email, role from claims
      --> Handler checks role against required role for endpoint
        --> PASS: proceed | FAIL: 403 FORBIDDEN
```

**Role Hierarchy**:
- `admin`: access to all endpoints
- `reviewer`: access to learner + reviewer endpoints
- `learner`: access to learner endpoints only

**Implementation**: Decorator pattern from shared library:
```python
from shared.auth import require_role, get_current_user

@require_role("admin")
def admin_endpoint(event):
    user = get_current_user(event)
    ...
```

---

## Pattern 4: Retry (boto3 Default)

**Pattern**: boto3 built-in retry with standard mode (3 retries, exponential backoff).

**Applies to**: All DynamoDB, S3, Step Functions, and AgentCore SDK calls.

**Configuration**: No custom config — use boto3 default retry behavior.

**Error Handling**: On final retry failure, catch `ClientError` and return appropriate error envelope response.

---

## Pattern 5: Input Validation (Pydantic)

**Pattern**: Pydantic v2 models for all request/response validation via Lambda Powertools.

**Implementation**:
- Define Pydantic models in `schemas.py` per service
- Powertools Event Handler auto-validates request body against model
- Validation errors automatically return 400 with field-level details in error envelope
