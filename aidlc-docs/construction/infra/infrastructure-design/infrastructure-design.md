# Infrastructure Design — Unit 1: Infrastructure

## CDK Stack Structure (Multi-Stack by Layer)

Following CDK best practices: separate stacks per concern for independent deployment and limited blast radius.

```
TutorialPlatformApp (CDK App)
+-- DataStack           — DynamoDB tables, S3 buckets
+-- AuthStack           — Cognito User Pool, identity config
+-- AgentStack          — AgentCore agent definitions, Bedrock permissions
+-- PipelineStack       — Step Functions state machine
+-- ApiStack            — API Gateway, Lambda functions (depends on Data, Auth, Agent, Pipeline)
+-- FrontendStack       — S3 bucket, CloudFront distribution
```

### Stack Dependencies
```
DataStack (no deps)
AuthStack (no deps)
AgentStack (depends on DataStack for S3/DynamoDB access)
PipelineStack (depends on AgentStack, DataStack)
ApiStack (depends on DataStack, AuthStack, AgentStack, PipelineStack)
FrontendStack (depends on ApiStack for API URL output)
```

---

## AWS Resources by Stack

### DataStack
| Resource | Type | Configuration |
|---|---|---|
| `TutorialTable` | DynamoDB Table | Single-table design, on-demand capacity, PK: `PK` (S), SK: `SK` (S), GSI1: `GSI1PK`/`GSI1SK` |
| `ContentBucket` | S3 Bucket | Versioning enabled (current+previous), lifecycle rule to delete old versions after 30 days, encryption: SSE-S3 |

**DynamoDB Access Patterns (Single-Table)**:
| Entity | PK | SK | GSI1PK | GSI1SK |
|---|---|---|---|---|
| User | `USER#<id>` | `PROFILE` | `EMAIL#<email>` | `USER` |
| Curriculum | `CURR#<id>` | `META` | `USER#<userId>` | `CURR#<createdAt>` |
| Lesson | `CURR#<id>` | `LESSON#<order>` | `STATUS#<status>` | `CURR#<id>` |
| Quiz | `CURR#<id>` | `QUIZ#<lessonOrder>` | `STATUS#<status>` | `CURR#<id>` |
| Progress | `USER#<id>` | `PROG#<currId>` | `CURR#<currId>` | `USER#<id>` |
| Assignment | `USER#<id>` | `ASSIGN#<currId>` | `ADMIN#<adminId>` | `ASSIGN#<deadline>` |
| ReviewItem | `REVIEW#<id>` | `META` | `STATUS#<status>` | `REVIEW#<createdAt>` |

### AuthStack
| Resource | Type | Configuration |
|---|---|---|
| `UserPool` | Cognito User Pool | Email sign-in, password policy (min 8, uppercase, number, special), email verification required |
| `UserPoolClient` | Cognito App Client | No secret, auth flows: USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH |
| `UserPoolDomain` | Cognito Domain | Custom prefix for hosted UI (optional) |

### AgentStack
| Resource | Type | Configuration |
|---|---|---|
| `ResearchAgent` | AgentCore Agent | Container image, Bedrock model access, web search tool permissions |
| `ContentAgent` | AgentCore Agent | Container image, Bedrock model access, S3 write to ContentBucket |
| `AssessmentAgent` | AgentCore Agent | Container image, Bedrock model access, DynamoDB read |
| `PersonalisationAgent` | AgentCore Agent | Container image, Bedrock model access, AgentCore memory, DynamoDB read/write |
| `BedrockModelAccess` | IAM Policy | `bedrock:InvokeModel` for Claude/Titan models |

### PipelineStack
| Resource | Type | Configuration |
|---|---|---|
| `CurriculumPipeline` | Step Functions State Machine | Standard workflow, 5-minute timeout per step, 3 retries with exponential backoff |
| `PipelineRole` | IAM Role | Permissions to invoke AgentCore agents, read/write DynamoDB, write S3 |

**State Machine Definition**:
```
StartAt: Research
States:
  Research:
    Type: Task (AgentCore: ResearchAgent)
    Next: GenerateOutline
    Retry: [{ErrorEquals: [States.ALL], MaxAttempts: 3, BackoffRate: 2}]
    Catch: [{ErrorEquals: [States.ALL], Next: PipelineFailed}]
  GenerateOutline:
    Type: Task (Lambda: generate-outline)
    Next: ProcessLessons
  ProcessLessons:
    Type: Map
    Iterator:
      StartAt: GenerateContent
      States:
        GenerateContent:
          Type: Task (AgentCore: ContentAgent)
          Next: GenerateQuiz
        GenerateQuiz:
          Type: Task (AgentCore: AssessmentAgent)
          End: true
    Next: StoreResults
  StoreResults:
    Type: Task (Lambda: store-results)
    Next: PipelineComplete
  PipelineComplete:
    Type: Succeed
  PipelineFailed:
    Type: Fail
```

### ApiStack
| Resource | Type | Configuration |
|---|---|---|
| `Api` | API Gateway REST API | Regional endpoint, Cognito authorizer, CORS enabled |
| `AuthFunction` | Lambda Function | Python 3.12, 256MB, 30s timeout, Cognito admin SDK access |
| `CurriculumFunction` | Lambda Function | Python 3.12, 512MB, 30s timeout, Step Functions start execution, DynamoDB access |
| `ContentFunction` | Lambda Function | Python 3.12, 256MB, 30s timeout, S3 read, DynamoDB access |
| `AssessmentFunction` | Lambda Function | Python 3.12, 512MB, 60s timeout, AgentCore invoke (grading), DynamoDB access |
| `ProgressFunction` | Lambda Function | Python 3.12, 256MB, 30s timeout, DynamoDB access |
| `AdminFunction` | Lambda Function | Python 3.12, 256MB, 30s timeout, DynamoDB access |

**API Routes**:
| Method | Path | Lambda | Auth |
|---|---|---|---|
| POST | `/auth/register` | AuthFunction | None |
| POST | `/auth/login` | AuthFunction | None |
| POST | `/auth/verify` | AuthFunction | None |
| POST | `/auth/refresh` | AuthFunction | None |
| GET/PUT | `/profile` | AuthFunction | Cognito |
| POST | `/curricula/generate` | CurriculumFunction | Cognito |
| GET | `/curricula` | CurriculumFunction | Cognito |
| GET | `/curricula/{id}` | CurriculumFunction | Cognito |
| POST | `/curricula/{id}/assign` | CurriculumFunction | Cognito (admin) |
| GET | `/curricula/wizard/categories` | CurriculumFunction | Cognito |
| GET | `/content/lessons/{id}` | ContentFunction | Cognito |
| GET | `/content/review-queue` | ContentFunction | Cognito (reviewer) |
| POST | `/content/{id}/review` | ContentFunction | Cognito (reviewer) |
| GET | `/assessments/quiz/{id}` | AssessmentFunction | Cognito |
| POST | `/assessments/quiz/{id}/submit` | AssessmentFunction | Cognito |
| GET | `/assessments/pre-assessment/{currId}` | AssessmentFunction | Cognito |
| POST | `/assessments/pre-assessment/{currId}/submit` | AssessmentFunction | Cognito |
| GET | `/progress/dashboard` | ProgressFunction | Cognito |
| GET | `/progress/{currId}` | ProgressFunction | Cognito |
| PUT | `/progress/{currId}/resume-point` | ProgressFunction | Cognito |
| GET | `/admin/learners` | AdminFunction | Cognito (admin) |
| GET | `/admin/courses` | AdminFunction | Cognito (admin) |
| PUT | `/admin/courses/{id}/archive` | AdminFunction | Cognito (admin) |
| GET | `/admin/review-backlog` | AdminFunction | Cognito (admin) |

### FrontendStack
| Resource | Type | Configuration |
|---|---|---|
| `FrontendBucket` | S3 Bucket | Static website hosting, block public access (CloudFront only) |
| `Distribution` | CloudFront Distribution | OAI to S3, HTTPS only, SPA routing (custom error → index.html) |

---

## IAM Least-Privilege Summary

| Role | Permissions |
|---|---|
| Lambda execution roles | DynamoDB CRUD on TutorialTable, S3 read on ContentBucket, CloudWatch Logs |
| CurriculumFunction role | + `states:StartExecution` on CurriculumPipeline |
| AssessmentFunction role | + AgentCore invoke on AssessmentAgent, PersonalisationAgent |
| Step Functions role | AgentCore invoke on Research/Content/Assessment agents, DynamoDB write, S3 write |
| Agent roles | `bedrock:InvokeModel`, S3 write (Content), DynamoDB read/write (Personalisation), AgentCore memory |

## Environment Strategy

- **Dev only** for MVP (single AWS account)
- CDK context parameter `environment` for future multi-env support
- Stack names prefixed with environment: `dev-DataStack`, `dev-ApiStack`, etc.
