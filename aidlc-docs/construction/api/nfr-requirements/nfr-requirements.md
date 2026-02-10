# NFR Requirements — Unit 3: API Services

## Performance Requirements

| Requirement | Target | Rationale |
|---|---|---|
| API response time (all endpoints) | < 3 seconds | Relaxed target acceptable for MVP pilot |
| DynamoDB read latency | < 100ms (single-digit ms typical) | DynamoDB on-demand, single-table design |
| S3 content retrieval | < 500ms | Pre-signed URL generation is fast; content download is client-side |
| Agent invocation (grading) | < 10 seconds | AgentCore calls for short-answer grading are async-tolerant |
| Lambda cold start | Accepted, no mitigation | MVP with 50 users — cold starts infrequent and acceptable |

## Scalability Requirements

| Requirement | Target | Rationale |
|---|---|---|
| Concurrent users | Up to 50 | Internal team pilot |
| Lambda concurrency | Default account limits (1000 unreserved) | Far exceeds 50-user need |
| DynamoDB capacity | On-demand | Auto-scales, no provisioning needed |
| API Gateway | Default throttling (10,000 req/s) | Far exceeds need |
| Rate limiting | None for MVP | Add per-user throttling in future if needed |

## Availability Requirements

| Requirement | Target | Rationale |
|---|---|---|
| Uptime target | Best-effort (no SLA for MVP) | Pilot phase, no contractual SLA |
| Multi-AZ | Inherent (Lambda, DynamoDB, API Gateway are multi-AZ by default) | No additional config needed |
| Disaster recovery | None for MVP | Single-region deployment |
| Backup | DynamoDB PITR disabled for MVP | Enable for production |

## Security Requirements

| Requirement | Implementation | Rationale |
|---|---|---|
| Authentication | Cognito JWT — API Gateway Cognito authorizer validates tokens | Simplest approach, no custom authorizer Lambda |
| Authorization | Role-based — Lambda extracts `custom:role` from JWT claims | Roles: learner, admin, reviewer |
| Data encryption at rest | DynamoDB default encryption (AWS-owned key), S3 SSE-S3 | Default encryption, no KMS overhead |
| Data encryption in transit | HTTPS enforced (API Gateway default) | TLS 1.2+ |
| CORS | Configured at API Gateway level | Allow frontend origin only |
| Input validation | Pydantic models via Lambda Powertools | Validates all request payloads |
| Secret management | No secrets in code — Cognito handles auth, IAM roles for service access | No API keys or secrets to manage |

## Reliability Requirements

| Requirement | Implementation | Rationale |
|---|---|---|
| Error handling | boto3 default retry with exponential backoff | Simple, sufficient for MVP |
| Retry strategy | boto3 built-in (3 retries with exponential backoff) | Default SDK behavior |
| Graceful degradation | Return user-friendly error messages on failure | No circuit breaker for MVP |
| Dead letter queue | None for MVP | Add for production |

## Observability Requirements

| Requirement | Implementation | Rationale |
|---|---|---|
| Logging | CloudWatch Logs via Lambda Powertools Logger | Structured JSON logging, correlation IDs |
| Metrics | Lambda built-in metrics (errors, duration, invocations, throttles) | No custom metrics for MVP |
| Tracing | None for MVP | Add X-Ray in future |
| Alerting | None for MVP | Manual CloudWatch monitoring |
| Dashboards | None for MVP | Use CloudWatch console directly |

## Maintainability Requirements

| Requirement | Implementation | Rationale |
|---|---|---|
| Code structure | Lambda Powertools event handlers with shared utilities | Consistent handler pattern across services |
| Logging standard | Structured JSON with correlation ID | Lambda Powertools Logger provides this |
| Testing | Unit tests with pytest, mocked AWS services (moto) | Standard Python testing |
| Documentation | OpenAPI spec generated from Pydantic models | Auto-generated API docs |
