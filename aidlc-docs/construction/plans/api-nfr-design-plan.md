# NFR Design Plan — Unit 3: API Services

## Unit Context
- **Unit**: API Services (Python/Lambda Powertools)
- **NFR Profile**: MVP-minimal — relaxed latency, 50 users, basic observability, no rate limiting, boto3 default retry
- **Key Patterns Needed**: Structured logging, error response standardisation, auth middleware, Lambda Layer packaging

---

## NFR Design Steps

- [x] **Step 1**: Define cross-cutting patterns (logging, error handling, auth middleware)
- [x] **Step 2**: Define logical components (Lambda Layer, shared utilities integration)
- [x] **Step 3**: Generate NFR design artifacts

---

## Questions

Please answer the following questions to clarify NFR design patterns for the API Services unit.

## Question 1
How should structured logging be configured across all 6 Lambda functions?

A) Minimal — Lambda Powertools Logger with service name and log level only (INFO in prod, DEBUG in dev)
B) Standard — Logger with service name, correlation ID injection from API Gateway request ID, and cold start detection
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
How should the shared library (Unit 2) be packaged for Lambda consumption?

A) Lambda Layer — shared library packaged as a Lambda Layer, referenced by all 6 functions
B) Bundled — shared library copied into each Lambda function's deployment package
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should API error responses be structured across all services?

A) Simple — `{error: "message", status_code: 400}` flat structure
B) Envelope — `{success: false, error: {code: "VALIDATION_ERROR", message: "...", details: [...]}}` with error codes
C) Other (please describe after [Answer]: tag below)

[Answer]: B

