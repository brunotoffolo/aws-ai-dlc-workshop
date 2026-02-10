# Deployment Architecture — Unit 1: Infrastructure

## Environment Strategy
- **MVP**: Single `dev` environment
- **Future**: Add `staging` and `prod` via CDK context parameter
- Stack naming: `{env}-{StackName}` (e.g., `dev-DataStack`)

## Deployment Model

```
+-------------------+     +-------------------+     +-------------------+
|   DataStack       |     |   AuthStack       |     |   AgentStack      |
| - DynamoDB Table  |     | - Cognito Pool    |     | - 4x AgentCore    |
| - S3 Bucket       |     | - App Client      |     |   containers      |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                          |
         +------------+------------+------------+-------------+
                      |                         |
              +-------+--------+       +--------+--------+
              | PipelineStack  |       |   ApiStack      |
              | - Step Funcs   |       | - API Gateway   |
              |   state machine|       | - 6x Lambda fns |
              +----------------+       +--------+--------+
                                                |
                                       +--------+--------+
                                       | FrontendStack   |
                                       | - S3 + CloudFront|
                                       +-----------------+
```

## CDK Deployment Command
```bash
cd infra
npx cdk deploy --all --context environment=dev
```

## Stack Deployment Order (CDK resolves automatically via dependencies)
1. DataStack + AuthStack (parallel, no deps)
2. AgentStack (depends on DataStack)
3. PipelineStack (depends on AgentStack, DataStack)
4. ApiStack (depends on all above)
5. FrontendStack (depends on ApiStack)

## Outputs (Cross-Stack References)
| Stack | Output | Consumed By |
|---|---|---|
| DataStack | Table name, S3 bucket name | AgentStack, PipelineStack, ApiStack |
| AuthStack | User Pool ID, Client ID | ApiStack, FrontendStack |
| AgentStack | Agent ARNs | PipelineStack, ApiStack |
| PipelineStack | State Machine ARN | ApiStack |
| ApiStack | API URL | FrontendStack |
| FrontendStack | CloudFront URL | — |
