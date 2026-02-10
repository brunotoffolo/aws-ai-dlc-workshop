# Infrastructure Design Plan — Unit 1: Infrastructure

## Plan Overview
Define the CDK stack structure and AWS resource configurations for the entire platform.

---

## Section 1: Clarifying Questions

## Question 1
How should the CDK stacks be organised?

A) Single stack — all resources in one CloudFormation stack
B) Multi-stack by layer — separate stacks for data, API, agents, frontend, pipeline
C) Multi-stack by unit — one stack per unit of work (infra mirrors unit boundaries)
D) Other (please describe after [Answer]: tag below)

[Answer]: follow best practices

## Question 2
What environment strategy do you want?

A) Single environment (dev only for now, add staging/prod later)
B) Two environments from the start (dev + prod)
C) Three environments (dev + staging + prod)
D) Other (please describe after [Answer]: tag below)

[Answer]: A, start small

## Question 3
How should API authentication be implemented?

A) Amazon Cognito User Pool (managed auth, JWT tokens)
B) Custom Lambda authorizer with JWT (self-managed tokens, stored in DynamoDB)
C) Amazon Cognito for auth + API Gateway Lambda authorizer for fine-grained permissions
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What DynamoDB capacity mode?

A) On-demand (pay-per-request, auto-scales, best for unpredictable traffic / MVP)
B) Provisioned with auto-scaling (lower cost at steady-state, requires capacity planning)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Section 2: Execution Plan

- [x] **Step 1**: Define CDK stack structure and resource allocation per stack
- [x] **Step 2**: Define infrastructure design (all AWS resources, configurations, IAM policies)
- [x] **Step 3**: Define deployment architecture (environments, CI/CD, deployment strategy)
- [x] **Step 4**: Save artifacts
