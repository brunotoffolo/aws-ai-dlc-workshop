# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Dependency Type | Notes |
|---|---|---|---|
| **Unit 1: Infrastructure** | None | — | Foundation — must be built first |
| **Unit 2: Shared Library** | Unit 1 (for DynamoDB/S3 resource names) | Build-time config | Needs table names, bucket names from infra |
| **Unit 3: API Services** | Unit 1 (Lambda/APIGW/Step Functions), Unit 2 (shared models/db) | Build-time + Runtime | Imports shared library, deployed to Lambda, starts Step Functions |
| **Unit 4: AI Agents** | Unit 1 (AgentCore config), Unit 2 (shared models/db/s3) | Build-time + Runtime | Imports shared library, deployed to AgentCore, invoked by Step Functions |
| **Unit 5: Frontend** | Unit 1 (CloudFront/S3), Unit 3 (API contracts) | Build-time + Runtime | Calls API endpoints, deployed to S3/CloudFront |

## Build Order

```
1. Unit 1: Infrastructure (no dependencies)
   |
   v
2. Unit 2: Shared Library (depends on Unit 1 config)
   |
   +---> 3a. Unit 3: API Services (parallel)
   |
   +---> 3b. Unit 4: AI Agents (parallel)
   |
   +---> 3c. Unit 5: Frontend (parallel, needs API contracts from Unit 3)
```

## Integration Points

| From | To | Integration Type | Contract |
|---|---|---|---|
| Frontend → API | Unit 5 → Unit 3 | REST API (HTTPS) | OpenAPI/JSON schema |
| API → Step Functions | Unit 3 → Unit 1 | Start execution (AWS SDK) | State machine input schema |
| Step Functions → Agents | Unit 1 → Unit 4 | AgentCore task invocations | Agent tool schemas |
| API → Agents (direct) | Unit 3 → Unit 4 | AgentCore invocation | Agent tool schemas (grading, personalisation) |
| API → Data | Unit 3 → Unit 2 | Python import | Shared models/db layer |
| Agents → Data | Unit 4 → Unit 2 | Python import | Shared models/db/s3 layer |
| Agents → Bedrock | Unit 4 → AWS | Bedrock API | Model invocation |
| Agents → AgentCore Memory | Unit 4 → AWS | AgentCore API | Memory read/write |

## Development Parallelisation

| Phase | Units | Can Parallel? | Notes |
|---|---|---|---|
| Phase A | Unit 1 → Unit 2 | Sequential | Unit 2 needs infra config |
| Phase B | Units 3, 4, 5 | Yes (all three) | All depend on Unit 2, independent of each other |
| Phase C | Integration | Sequential | Test all units together |

## Risk Considerations

- **Unit 3 ↔ Unit 4 contract**: API services invoke agents directly (grading, personalisation) via AgentCore SDK. Curriculum generation goes through Step Functions. Agent tool schemas must be defined early.
- **Unit 1 Step Functions ↔ Unit 4 contract**: Step Functions state machine invokes agents as AgentCore tasks. Agent input/output schemas must be defined in infrastructure.
- **Unit 5 ↔ Unit 3 contract**: Frontend needs API endpoint definitions. API response schemas should be defined in Unit 2 (shared) so frontend can develop against them.
- **Unit 4 AgentCore deployment**: AgentCore container configuration is newer — may need iteration on agent packaging and deployment.
