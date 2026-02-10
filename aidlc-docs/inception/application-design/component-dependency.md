# Component Dependencies

## Dependency Matrix

| Component | Depends On | Communication | Data Flow |
|---|---|---|---|
| **Frontend (FC-01)** | API Gateway (AC-01) | HTTPS/REST | Request/Response JSON |
| **API Gateway (AC-01)** | All Lambda Services (AC-02 to AC-07) | Lambda invoke | Event payload |
| **Auth Service (AC-02)** | DynamoDB (DC-01: users) | AWS SDK | Read/Write user records |
| **Curriculum Service (AC-03)** | Orchestrator Agent (AG-01), DynamoDB (DC-01: curricula, assignments) | Strands SDK (sync), AWS SDK | Agent invocation, DB read/write |
| **Content Service (AC-04)** | S3 (DC-02), DynamoDB (DC-01: content_metadata, review_queue) | AWS SDK | S3 get/put, DB read/write |
| **Assessment Service (AC-05)** | Assessment Agent (AG-04), DynamoDB (DC-01: progress) | Strands SDK (sync), AWS SDK | Agent invocation, DB read/write |
| **Progress Service (AC-06)** | DynamoDB (DC-01: progress) | AWS SDK | DB read/write |
| **Admin Service (AC-07)** | DynamoDB (DC-01: all tables) | AWS SDK | DB read (aggregation queries) |
| **Orchestrator Agent (AG-01)** | Research (AG-02), Content (AG-03), Assessment (AG-04) | Strands SDK (sync) | Sequential pipeline |
| **Research Agent (AG-02)** | Bedrock (LLM), Web search tools | Bedrock API, HTTP | LLM invocation, web requests |
| **Content Agent (AG-03)** | Bedrock (LLM), S3 (DC-02) | Bedrock API, AWS SDK | LLM invocation, S3 write |
| **Assessment Agent (AG-04)** | Bedrock (LLM) | Bedrock API | LLM invocation |
| **Personalisation Agent (AG-05)** | Bedrock (LLM), AgentCore Memory (DC-03), DynamoDB (DC-01: progress) | Bedrock API, AgentCore API, AWS SDK | LLM invocation, memory read/write |

## Data Flow Diagram

```
+------------------+       HTTPS/REST        +------------------+
|                  | -----------------------> |                  |
|    Frontend      |                          |   API Gateway    |
|    (React SPA)   | <----------------------- |   (AWS APIGW)    |
|                  |       JSON Response      |                  |
+------------------+                          +--------+---------+
                                                       |
                                              Lambda Invoke
                                                       |
                    +----------------------------------+----------------------------------+
                    |              |              |              |              |           |
              +-----+----+  +----+-----+  +-----+----+  +-----+----+  +-----+----+ +----+-----+
              |  Auth    |  |Curriculum|  | Content  |  |Assessment|  |Progress  | |  Admin   |
              | Service  |  | Service  |  | Service  |  | Service  |  | Service  | | Service  |
              +-----+----+  +----+-----+  +----+-----+  +----+-----+  +----+-----+ +----+-----+
                    |             |              |              |              |           |
                    |        Strands SDK         |         Strands SDK        |           |
                    |        (sync)              |         (sync)             |           |
                    |             |              |              |              |           |
                    |      +------+-------+     |       +------+------+      |           |
                    |      | Orchestrator |     |       |  Assessment |      |           |
                    |      |    Agent     |     |       |    Agent    |      |           |
                    |      +------+-------+     |       +-------------+      |           |
                    |             |              |                            |           |
                    |    Strands SDK (sync)      |                            |           |
                    |      +------+-------+     |                            |           |
                    |      |              |     |                            |           |
                    | +----+----+  +------+---+ |                            |           |
                    | |Research |  | Content  | |                            |           |
                    | | Agent  |  |  Agent   | |                            |           |
                    | +----+----+  +----+-----+ |                            |           |
                    |      |            |       |                            |           |
                    |  Bedrock API   Bedrock API |                            |           |
                    |      |         + S3 write  |                            |           |
                    |      |            |       |                            |           |
              +-----+------+------------+-------+----------------------------+-----------+--+
              |                          DynamoDB Tables                                    |
              |  users | curricula | content_metadata | progress | assignments | review_queue|
              +--------+----------+------------------+----------+-------------+-------------+
                                         |
                                  +------+------+
                                  |  S3 Bucket  |
                                  | (content +  |
                                  |   media)    |
                                  +-------------+
                                         |
                                  +------+------+
                                  |  AgentCore  |
                                  |   Memory    |
                                  +-------------+
```

## Communication Patterns

All agent communication is **synchronous request-response**:

1. **Curriculum Service → Orchestrator Agent**: Sync invocation via Strands SDK
2. **Orchestrator → Research Agent**: Sync call, waits for research findings
3. **Orchestrator → Content Agent**: Sync call per lesson, waits for content
4. **Orchestrator → Assessment Agent**: Sync call per lesson, waits for quiz
5. **Assessment Service → Assessment Agent**: Sync call for grading
6. **Personalisation Agent**: Invoked by Assessment Service after quiz submission for path adjustment

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Agent communication | Synchronous | Simpler error handling, sequential pipeline, user waits for result |
| Content storage | DynamoDB + S3 | DynamoDB for fast metadata queries, S3 for large content bodies |
| Content versioning | Current + previous | Balance between audit trail and storage cost |
| API style | REST | Simple, well-understood, sufficient for CRUD operations |
| Frontend state | TanStack Query | Server-state focused, minimal boilerplate, built-in caching |
| Single-table DynamoDB | Yes | Cost-efficient, fast access patterns with composite keys |
