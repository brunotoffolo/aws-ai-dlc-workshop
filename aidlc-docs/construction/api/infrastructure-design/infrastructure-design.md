# Infrastructure Design — Unit 3: API Services

## Code-to-Infrastructure Mapping

Unit 3 code maps to the existing ApiStack defined in Unit 1 CDK. No new stacks needed — only code artifacts that the existing Lambda definitions point to.

### Lambda Function Mapping

| Lambda (CDK) | Code Path | Handler | Environment Variables |
|---|---|---|---|
| `AuthFunction` | `backend/api/auth/` | `handler.lambda_handler` | `TABLE_NAME`, `USER_POOL_ID`, `USER_POOL_CLIENT_ID` |
| `CurriculumFunction` | `backend/api/curriculum/` | `handler.lambda_handler` | `TABLE_NAME`, `PIPELINE_STATE_MACHINE_ARN` |
| `ContentFunction` | `backend/api/content/` | `handler.lambda_handler` | `TABLE_NAME`, `CONTENT_BUCKET_NAME`, `CONTENT_AGENT_ARN` |
| `AssessmentFunction` | `backend/api/assessment/` | `handler.lambda_handler` | `TABLE_NAME`, `ASSESSMENT_AGENT_ARN` |
| `ProgressFunction` | `backend/api/progress/` | `handler.lambda_handler` | `TABLE_NAME` |
| `AdminFunction` | `backend/api/admin/` | `handler.lambda_handler` | `TABLE_NAME` |

### Environment Variables (CDK → Lambda)

All environment variables are passed from CDK stack outputs:

| Variable | Source | Used By |
|---|---|---|
| `TABLE_NAME` | `DataStack.tableName` | All 6 functions |
| `CONTENT_BUCKET_NAME` | `DataStack.contentBucketName` | Content |
| `USER_POOL_ID` | `AuthStack.userPoolId` | Auth |
| `USER_POOL_CLIENT_ID` | `AuthStack.userPoolClientId` | Auth |
| `PIPELINE_STATE_MACHINE_ARN` | `PipelineStack.stateMachineArn` | Curriculum |
| `CONTENT_AGENT_ARN` | `AgentStack.contentAgentArn` | Content |
| `ASSESSMENT_AGENT_ARN` | `AgentStack.assessmentAgentArn` | Assessment |
| `LOG_LEVEL` | CDK context (`dev` → DEBUG, `prod` → INFO) | All 6 functions |

## Lambda Layer (CDK Auto-Build)

**Construct**: `PythonLayerVersion` from `@aws-cdk/aws-lambda-python-alpha`

**Source**: `backend/shared/` directory with `pyproject.toml` or `requirements.txt`

**Contents built automatically**:
- `shared/` package (auth, db, s3, models, config)
- `aws-lambda-powertools`
- `pydantic`
- `ulid-py`

**CDK Integration**:
```
SharedLayer = PythonLayerVersion(
  entry="backend/shared/",
  compatible_runtimes=[Runtime.PYTHON_3_12],
  compatible_architectures=[Architecture.ARM_64]
)
// All 6 Lambda functions reference SharedLayer
```

## Lambda Configuration (All Functions)

| Setting | Value |
|---|---|
| Runtime | Python 3.12 |
| Architecture | arm64 (Graviton2) |
| Memory | 256 MB |
| Timeout | 30 seconds |
| Packaging | Zip (CDK auto-bundles from code path) |
| Layer | SharedLayer (shared library + deps) |

## API Gateway Configuration (Existing from Unit 1)

| Setting | Value |
|---|---|
| Type | REST API |
| Authorizer | Cognito User Pool Authorizer |
| CORS | Enabled (frontend origin) |
| Stage | `dev` (from CDK context) |

## CDK Changes Required (Unit 1 Updates)

The existing ApiStack needs minor updates to support Unit 3:

1. **Add `PythonLayerVersion`** construct for shared library auto-build
2. **Update Lambda `code` paths** to point to `backend/api/{service}/`
3. **Add environment variables** per function (table name, bucket name, etc.)
4. **Attach SharedLayer** to all 6 Lambda functions

These changes will be applied during Code Generation.
