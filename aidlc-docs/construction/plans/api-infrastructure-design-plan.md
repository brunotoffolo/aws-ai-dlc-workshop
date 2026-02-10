# Infrastructure Design Plan — Unit 3: API Services

## Unit Context
- **Unit**: API Services (Python/Lambda Powertools)
- **Existing Infra**: Unit 1 CDK already defines ApiStack with API Gateway, 6 Lambda functions, Cognito authorizer, routes
- **NFR Design**: Lambda Layer for shared deps, 256MB memory, 30s timeout, arm64, zip packaging
- **Scope**: Map Unit 3 code artifacts to existing infrastructure definitions; clarify any gaps

---

## Infrastructure Design Steps

- [x] **Step 1**: Map API service code to existing CDK Lambda definitions
- [x] **Step 2**: Define Lambda Layer build and packaging process
- [x] **Step 3**: Define environment variables and configuration
- [x] **Step 4**: Generate infrastructure design artifacts

---

## Questions

Please answer the following questions to clarify infrastructure details for the API Services unit.

## Question 1
How should environment-specific configuration (table name, bucket name, Cognito pool ID) be passed to Lambda functions?

A) Environment variables — CDK passes stack outputs as Lambda environment variables (simplest, standard approach)
B) SSM Parameter Store — Lambda reads config from SSM at cold start (centralised, slightly slower)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should the Lambda Layer be built and updated during development?

A) Manual — developer runs a build script to package shared library into a Layer zip, CDK deploys it
B) CDK bundling — CDK `PythonLayerVersion` construct auto-builds the Layer from `backend/shared/` on `cdk deploy`
C) Other (please describe after [Answer]: tag below)

[Answer]: B

