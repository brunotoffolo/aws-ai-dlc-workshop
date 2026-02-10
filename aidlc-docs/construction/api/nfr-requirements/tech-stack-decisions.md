# Tech Stack Decisions — Unit 3: API Services

## Runtime & Framework

| Component | Choice | Rationale |
|---|---|---|
| Runtime | Python 3.12 on AWS Lambda | Consistent with shared library and agents |
| Framework | AWS Lambda Powertools for Python | Lightweight, AWS-native; built-in logging, tracing hooks, validation; lower cold start than FastAPI+Mangum |
| Request validation | Pydantic v2 (via Lambda Powertools) | Type-safe request/response models, auto-validation |
| Event handling | Lambda Powertools Event Handler (REST) | API Gateway REST event parsing, routing, middleware support |

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| `aws-lambda-powertools` | ^3.x | Core framework: Logger, Event Handler, Validation |
| `pydantic` | ^2.x | Request/response models, data validation |
| `boto3` | Lambda runtime (bundled) | AWS SDK for DynamoDB, S3, Step Functions, AgentCore |
| `ulid-py` | ^2.x | ULID generation for entity IDs |

## Architecture Patterns

### Handler Pattern (Lambda Powertools)
```
Each Lambda function uses Powertools Event Handler:
- app = APIGatewayRestResolver()
- @app.get("/path"), @app.post("/path") decorators
- Pydantic models for input validation
- Powertools Logger for structured logging
- Shared auth utility for role extraction from JWT
```

### Project Structure per Service
```
backend/api/{service}/
  handler.py          # Lambda entry point + route definitions
  schemas.py          # Pydantic request/response models
  service.py          # Business logic (calls shared library)
```

### Shared Utilities (from Unit 2)
```
backend/shared/
  auth/               # JWT claim extraction, role validation
  db/                 # DynamoDB data access layer
  s3/                 # S3 content access
  models/             # Common Pydantic models (entities)
  config/             # Environment config
```

## Deployment Configuration

| Setting | Value | Rationale |
|---|---|---|
| Lambda memory | 256 MB (default for all services) | Sufficient for API handlers; tune per-service if needed |
| Lambda timeout | 30 seconds | Covers agent invocations (grading); API Gateway max is 29s |
| Lambda architecture | arm64 (Graviton2) | Better price-performance |
| Packaging | Zip deployment (not container) | Faster cold starts, simpler for Lambda Powertools |
| Layer strategy | Shared dependencies in Lambda Layer | Shared library + common deps in one layer; reduces per-function package size |

## Decisions NOT Made (Deferred)

| Decision | Deferred To | Reason |
|---|---|---|
| X-Ray tracing | Post-MVP | Basic CloudWatch sufficient for pilot |
| Custom CloudWatch metrics | Post-MVP | Built-in Lambda metrics sufficient |
| Provisioned concurrency | Post-MVP | Cold starts acceptable for 50 users |
| Rate limiting | Post-MVP | No throttling needed for pilot |
| Circuit breaker | Post-MVP | boto3 default retry sufficient |
| Multi-region | Post-MVP | Single-region for pilot |
