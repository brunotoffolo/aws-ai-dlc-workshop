# Code Summary — Unit 1: Infrastructure

## Files Generated

| File | Purpose |
|---|---|
| `infra/package.json` | CDK project dependencies |
| `infra/tsconfig.json` | TypeScript configuration |
| `infra/cdk.json` | CDK app config with environment context |
| `infra/bin/app.ts` | CDK app entry point — instantiates and wires all stacks |
| `infra/lib/data-stack.ts` | DynamoDB single-table (on-demand, PK/SK/GSI1) + S3 content bucket |
| `infra/lib/auth-stack.ts` | Cognito User Pool + App Client |
| `infra/lib/agent-stack.ts` | 4 AgentCore agent IAM roles with least-privilege permissions |
| `infra/lib/pipeline-stack.ts` | Step Functions state machine (curriculum generation pipeline) |
| `infra/lib/api-stack.ts` | API Gateway REST API + 6 Lambda functions + 24 routes + Cognito authorizer |
| `infra/lib/frontend-stack.ts` | S3 static hosting + CloudFront distribution with SPA routing |

## Notes
- AgentStack uses placeholder IAM roles — actual AgentCore agent resources to be created via AgentCore console/CLI and wired in
- PipelineStack uses placeholder task resource ARNs in the state machine definition — replace with actual agent/Lambda ARNs after deployment
- Lambda `code` paths point to `../backend/api/{service}/` — will be populated in Unit 3 (API Services)
- Environment prefix (`dev-`) applied to all stack names via CDK context
