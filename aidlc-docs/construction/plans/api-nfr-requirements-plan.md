# NFR Requirements Plan — Unit 3: API Services

## Unit Context
- **Unit**: API Services (Python/FastAPI on Lambda)
- **Functional Design**: 6 services, 7 DynamoDB entities, 25 business rules, 10 orchestration flows
- **Deployment**: Lambda behind API Gateway (serverless)
- **Data**: DynamoDB single-table + S3

---

## NFR Requirements Steps

- [x] **Step 1**: Define performance and latency requirements per service
- [x] **Step 2**: Define security and authorization model
- [x] **Step 3**: Define scalability and reliability requirements
- [x] **Step 4**: Make tech stack decisions (libraries, frameworks, patterns)
- [x] **Step 5**: Generate NFR requirements artifacts

---

## Questions

Please answer the following questions to clarify non-functional requirements for the API Services unit.

## Question 1
What are the expected response time targets for API endpoints?

A) Relaxed — < 3 seconds for all endpoints (acceptable for MVP, simpler implementation)
B) Standard — < 1 second for reads, < 2 seconds for writes, < 5 seconds for agent invocations
C) Strict — < 500ms for reads, < 1 second for writes, < 3 seconds for agent invocations
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
What is the expected concurrent user load for MVP?

A) Small — up to 50 concurrent users (internal team pilot)
B) Medium — up to 500 concurrent users (department-level rollout)
C) Large — up to 5,000 concurrent users (company-wide)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should API authentication and authorization be implemented?

A) Cognito JWT only — API Gateway validates JWT, Lambda extracts claims for role-based access
B) Cognito JWT + custom authorizer Lambda — separate Lambda validates token and enriches context
C) Cognito JWT + API Gateway resource policies — JWT validation + IP/VPC restrictions
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What level of observability is needed for MVP?

A) Basic — CloudWatch Logs + Lambda metrics (errors, duration, invocations)
B) Standard — CloudWatch Logs + custom metrics + X-Ray tracing for request flows
C) Comprehensive — CloudWatch + X-Ray + custom dashboards + alerting on error rates and latency
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
How should Lambda cold starts be handled?

A) Accept cold starts — no mitigation, acceptable for MVP
B) Provisioned concurrency — keep warm instances for critical endpoints (auth, curriculum status)
C) Lambda SnapStart — use SnapStart if available for Python runtime
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
What Python web framework approach should be used for Lambda handlers?

A) FastAPI + Mangum — full FastAPI with Mangum adapter for Lambda (rich validation, OpenAPI docs)
B) AWS Lambda Powertools — lightweight handlers with Powertools for logging, tracing, validation
C) Plain handlers — minimal Lambda handlers with Pydantic for validation, no framework overhead
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
How should API rate limiting be configured?

A) API Gateway throttling only — default throttling at API Gateway level (simple, no custom logic)
B) Per-user throttling — API Gateway usage plans with API keys per user tier
C) No rate limiting for MVP — add later when needed
D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 8
What error handling and retry strategy should be used for downstream service calls (DynamoDB, S3, AgentCore)?

A) Simple retry — boto3 default retry with exponential backoff, generic error responses
B) Circuit breaker — implement circuit breaker pattern for AgentCore calls, simple retry for AWS services
C) Retry + dead letter — retry with backoff, failed requests to DLQ for later processing
D) Other (please describe after [Answer]: tag below)

[Answer]: A
