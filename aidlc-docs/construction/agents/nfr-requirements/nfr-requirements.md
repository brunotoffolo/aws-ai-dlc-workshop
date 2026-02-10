# NFR Requirements — Unit 4: AI Agents

## Performance Requirements

| Requirement | Target | Notes |
|---|---|---|
| Full curriculum generation (end-to-end) | < 2 minutes | Research + all lessons (content + quiz) |
| Research Agent single invocation | < 30 seconds | Single Bedrock call for topic analysis + outline |
| Content Agent per lesson | < 20 seconds | Parallelised across lessons in Step Functions Map |
| Assessment Agent per lesson quiz | < 15 seconds | Parallelised alongside content generation |
| Grading (on-demand) | < 10 seconds | Direct AgentCore invocation from API |
| Personalisation path calculation | < 5 seconds | Direct AgentCore invocation from API |

### Parallelisation Strategy
To hit the 2-minute target with a curriculum of ~15 lessons (5 modules × 3 lessons):
- Research: ~30s (sequential, single call)
- Outline generation: ~5s (Lambda)
- Content + Quiz per lesson: ~20s each, parallelised with `MaxConcurrency: 5` in Step Functions Map
- 15 lessons / 5 parallel = 3 batches × 20s = ~60s
- Store results: ~5s
- **Total estimate: ~100 seconds** (within 2-minute target)

## Reliability Requirements

| Requirement | Implementation |
|---|---|
| Retry policy | 3 retries with exponential backoff (2s, 4s, 8s) per Step Functions step |
| Model fallback | If Claude Sonnet 4.5 is throttled after retries, fall back to Claude Haiku |
| Partial failure handling | Step Functions Catch: skip failed lessons, mark as failed, continue pipeline |
| Agent health | AgentCore container health checks, auto-restart on failure |
| Idempotency | Each agent invocation uses curriculum_id + lesson_order as idempotency key |

## Cost Optimisation Requirements

| Requirement | Implementation |
|---|---|
| Primary model | Claude Sonnet 4.5 (all agents) |
| Fallback model | Claude Haiku (on throttling) |
| Token budget per curriculum | Monitor and log token usage per generation |
| Prompt efficiency | Use structured prompts with clear output schemas to minimise token waste |
| Caching | Cache research findings per topic (DynamoDB TTL) to avoid re-research for same topic |

## Security Requirements

| Requirement | Implementation |
|---|---|
| Prompt injection protection | Sanitise user topic input before passing to agents |
| Content safety | Bedrock guardrails for content filtering (hate, violence, PII) |
| Data isolation | Each agent invocation scoped to single curriculum, no cross-tenant data access |
| Credential management | Agent roles use IAM least-privilege, no hardcoded credentials |
| Audit logging | Log all agent invocations with input/output metadata (not full content) to CloudWatch |

## Observability Requirements

| Requirement | Implementation |
|---|---|
| Logging | Structured JSON logs per agent invocation (CloudWatch Logs) |
| Metrics | Token usage, latency, error rate per agent (CloudWatch Metrics) |
| Tracing | Step Functions execution history for pipeline debugging |
| Alerting | Alarm on error rate > 5% or latency > 2 minutes |
