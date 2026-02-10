# Code Generation Plan — Unit 1: Infrastructure

## Unit Context
- **Unit**: Infrastructure (CDK TypeScript)
- **Location**: `infra/` in workspace root
- **Dependencies**: None (foundation unit)
- **Deliverables**: 6 CDK stacks (Data, Auth, Agent, Pipeline, Api, Frontend)
- **Design Reference**: `aidlc-docs/construction/infra/infrastructure-design/infrastructure-design.md`

## Stories Covered
- Supports all MVP stories indirectly (infrastructure foundation)
- US-001 (Registration): AuthStack (Cognito), ApiStack (auth routes)
- US-004 (Curriculum Gen): PipelineStack (Step Functions), AgentStack, ApiStack
- US-007 (Content Gen): DataStack (S3), AgentStack
- US-014 (Dashboard): ApiStack (progress routes)

---

## Code Generation Steps

- [x] **Step 1**: Initialize CDK project
  - [x] Create `infra/` directory with CDK TypeScript boilerplate
  - [x] Configure `cdk.json`, `tsconfig.json`, `package.json`
  - [x] Set up environment context parameter

- [x] **Step 2**: Create DataStack
  - [x] DynamoDB single-table (on-demand, PK/SK/GSI1)
  - [x] S3 content bucket (versioning, encryption, lifecycle)
  - [x] Export table name and bucket name as stack outputs

- [x] **Step 3**: Create AuthStack
  - [x] Cognito User Pool (email sign-in, password policy, email verification)
  - [x] Cognito App Client (no secret, auth flows)
  - [x] Export User Pool ID and Client ID as stack outputs

- [x] **Step 4**: Create AgentStack
  - [x] Define 4 AgentCore agent resources (Research, Content, Assessment, Personalisation)
  - [x] IAM roles with Bedrock InvokeModel, S3, DynamoDB permissions per agent
  - [x] Export agent ARNs as stack outputs

- [x] **Step 5**: Create PipelineStack
  - [x] Step Functions state machine definition (Research → Outline → Map[Content+Quiz] → Store)
  - [x] Pipeline IAM role (invoke agents, DynamoDB, S3)
  - [x] Export state machine ARN as stack output

- [x] **Step 6**: Create ApiStack
  - [x] API Gateway REST API with Cognito authorizer
  - [x] 6 Lambda function definitions (Auth, Curriculum, Content, Assessment, Progress, Admin)
  - [x] Lambda IAM roles with least-privilege per function
  - [x] API routes (24 endpoints mapped to Lambda functions)
  - [x] CORS configuration
  - [x] Export API URL as stack output

- [x] **Step 7**: Create FrontendStack
  - [x] S3 bucket for static hosting (block public access)
  - [ ] CloudFront distribution with OAI, HTTPS, SPA routing
  - [ ] Export CloudFront URL as stack output

- [x] **Step 8**: Create CDK App entry point
  - [x] `bin/app.ts` — instantiate all stacks with dependency wiring
  - [x] Environment context parameter support

- [x] **Step 9**: Generate code summary documentation
  - [x] Save `aidlc-docs/construction/infra/code/code-summary.md`
