# Logical Components — Unit 3: API Services

## Component Diagram

```
+------------------------------------------------------------------+
|                        API Gateway (REST)                        |
|  Cognito Authorizer | CORS | Routes to 6 Lambda Functions       |
+----------------------------------+-------------------------------+
                                   |
                          Lambda Invoke
                                   |
     +--------+--------+--------+--------+--------+--------+
     |  Auth  | Curric | Content| Assess | Progr  | Admin  |
     | Lambda | Lambda | Lambda | Lambda | Lambda | Lambda |
     +---+----+---+----+---+----+---+----+---+----+---+----+
         |        |        |        |        |        |
         +--------+--------+--------+--------+--------+
                           |
                    Lambda Layer
              (shared library + deps)
                           |
         +--------+--------+--------+--------+
         | auth/  |  db/   |  s3/   |models/ |
         | utils  | access | access | schemas|
         +--------+--------+--------+--------+
                           |
              +------------+------------+
              |            |            |
         DynamoDB       S3 Bucket   AgentCore
        (single-table)  (content)   (grading)
```

## Lambda Layer: Shared Dependencies

**Purpose**: Single Lambda Layer containing shared library (Unit 2) and common Python dependencies.

**Contents**:
- `shared/` — shared library package (auth, db, s3, models, config)
- `aws-lambda-powertools` — logging, event handler, validation
- `pydantic` — data validation
- `ulid-py` — ID generation
- `boto3` stubs (boto3 itself is bundled in Lambda runtime)

**Deployment**: Layer built and deployed via CDK (Unit 1 infra). All 6 Lambda functions reference this layer.

## Lambda Functions (6)

### Auth Lambda
- **Handler**: `backend/api/auth/handler.py`
- **Routes**: `/auth/register`, `/auth/login`, `/auth/verify`, `/auth/refresh`, `/auth/profile`
- **IAM**: Cognito AdminInitiateAuth, DynamoDB read/write (users)
- **Patterns**: Logger (service=auth-service), error envelope, Pydantic validation

### Curriculum Lambda
- **Handler**: `backend/api/curriculum/handler.py`
- **Routes**: `/curricula/generate`, `/curricula/{id}`, `/curricula/{id}/status`, `/curricula/wizard/categories`, `/curricula/assign`, `/curricula/{id}/archive`
- **IAM**: DynamoDB read/write (curricula, assignments), Step Functions StartExecution, DescribeExecution
- **Patterns**: Logger (service=curriculum-service), error envelope, auth middleware, Pydantic validation

### Content Lambda
- **Handler**: `backend/api/content/handler.py`
- **Routes**: `/content/{id}`, `/content/review-queue`, `/content/{id}/review`, `/content/{id}/regenerate`, `/content/{id}/versions`
- **IAM**: DynamoDB read/write (content_metadata), S3 GetObject/PutObject, AgentCore InvokeAgent (for regeneration)
- **Patterns**: Logger (service=content-service), error envelope, auth middleware (reviewer/admin), Pydantic validation

### Assessment Lambda
- **Handler**: `backend/api/assessment/handler.py`
- **Routes**: `/quizzes/{id}`, `/quizzes/{id}/submit`, `/curricula/{id}/pre-assessment`, `/curricula/{id}/pre-assessment/submit`
- **IAM**: DynamoDB read/write (quizzes, progress), AgentCore InvokeAgent (for short-answer grading)
- **Patterns**: Logger (service=assessment-service), error envelope, auth middleware, Pydantic validation

### Progress Lambda
- **Handler**: `backend/api/progress/handler.py`
- **Routes**: `/progress/{curriculum_id}`, `/progress/{curriculum_id}/resume`, `/progress/{curriculum_id}/lessons/{lesson_id}/complete`, `/dashboard`
- **IAM**: DynamoDB read/write (progress)
- **Patterns**: Logger (service=progress-service), error envelope, auth middleware, Pydantic validation

### Admin Lambda
- **Handler**: `backend/api/admin/handler.py`
- **Routes**: `/admin/learners`, `/admin/courses`, `/admin/review-backlog`
- **IAM**: DynamoDB read (all entities via GSI queries)
- **Patterns**: Logger (service=admin-service), error envelope, auth middleware (admin only), Pydantic validation
