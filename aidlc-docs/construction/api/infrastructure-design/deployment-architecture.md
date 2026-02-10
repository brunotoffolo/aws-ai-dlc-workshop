# Deployment Architecture — Unit 3: API Services

## Deployment Diagram

```
+------------------------------------------------------------------+
|                     CDK App (cdk deploy)                         |
+------------------------------------------------------------------+
         |                    |                    |
   +-----+------+    +-------+--------+    +------+-------+
   |  DataStack  |    |   AuthStack    |    | AgentStack   |
   | (DynamoDB,  |    | (Cognito Pool, |    | (Agent IAM   |
   |  S3 Bucket) |    |  App Client)   |    |  roles)      |
   +-----+------+    +-------+--------+    +------+-------+
         |                    |                    |
         +--------------------+--------------------+
                              |
                    +---------+---------+
                    |    PipelineStack   |
                    | (Step Functions)   |
                    +---------+---------+
                              |
                    +---------+---------+
                    |     ApiStack       |
                    +--------------------+
                    | API Gateway (REST) |
                    | Cognito Authorizer |
                    | SharedLayer (auto) |
                    | 6 Lambda Functions |
                    |  + env vars from   |
                    |    stack outputs    |
                    +---------+----------+
                              |
                    +---------+---------+
                    |  FrontendStack    |
                    | (S3 + CloudFront) |
                    +-------------------+
```

## Build and Deploy Process

### Step 1: Install CDK Dependencies
```bash
cd infra && npm install
```

### Step 2: Install Python Dependencies (Lambda Layer auto-builds)
```bash
cd backend/shared && pip install -e .   # local dev only
```

### Step 3: Deploy All Stacks
```bash
cd infra && npx cdk deploy --all --context env=dev
```

CDK automatically:
- Builds SharedLayer from `backend/shared/` (PythonLayerVersion)
- Bundles each Lambda function from `backend/api/{service}/`
- Passes cross-stack outputs as environment variables
- Deploys in dependency order (Data → Auth → Agent → Pipeline → Api → Frontend)

## Local Development

| Tool | Purpose |
|---|---|
| `pytest` | Unit tests with moto (mocked AWS) |
| `sam local invoke` | Local Lambda invocation for integration testing |
| `sam local start-api` | Local API Gateway for frontend development |

## File Structure (Code Artifacts)

```
backend/
+-- shared/                     # Lambda Layer source (auto-built by CDK)
|   +-- shared/
|   |   +-- __init__.py
|   |   +-- auth/
|   |   +-- db/
|   |   +-- s3/
|   |   +-- models/
|   |   +-- config/
|   +-- pyproject.toml
+-- api/                        # Lambda function code
    +-- auth/
    |   +-- handler.py
    |   +-- schemas.py
    |   +-- service.py
    +-- curriculum/
    |   +-- handler.py
    |   +-- schemas.py
    |   +-- service.py
    |   +-- categories.json
    +-- content/
    |   +-- handler.py
    |   +-- schemas.py
    |   +-- service.py
    +-- assessment/
    |   +-- handler.py
    |   +-- schemas.py
    |   +-- service.py
    +-- progress/
    |   +-- handler.py
    |   +-- schemas.py
    |   +-- service.py
    +-- admin/
        +-- handler.py
        +-- schemas.py
        +-- service.py
```
