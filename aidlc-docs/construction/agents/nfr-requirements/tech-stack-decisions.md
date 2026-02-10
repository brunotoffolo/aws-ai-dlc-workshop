# Tech Stack Decisions — Unit 4: AI Agents

| Decision | Choice | Rationale |
|---|---|---|
| Agent framework | Strands Agents SDK | AWS-native, integrates with AgentCore and Bedrock |
| Runtime | AgentCore containers | Managed container runtime for agents, built-in memory |
| Primary LLM | Claude Sonnet 4.5 (via Bedrock) | Best quality for educational content generation |
| Fallback LLM | Claude Haiku (via Bedrock) | Fast/cheap fallback on throttling |
| Orchestration | AWS Step Functions | Deterministic pipeline, native retries/parallelisation |
| Memory | AgentCore memory (minimal) | Pre-assessment scores + quiz scores per learner-curriculum |
| Content storage | S3 via shared library | Markdown lessons, quiz JSON |
| Metadata storage | DynamoDB via shared library | Progress, difficulty state, review status |
| Observability | CloudWatch Logs + Metrics | Structured logging, token usage tracking |
| Content safety | Bedrock Guardrails | Filter harmful/inappropriate generated content |
