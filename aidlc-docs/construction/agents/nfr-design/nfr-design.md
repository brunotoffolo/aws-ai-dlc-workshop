# NFR Design — Unit 4: AI Agents

## Performance Patterns

### Parallelisation (Step Functions Map)
Update PipelineStack `MaxConcurrency` from 3 to 5 to hit 2-minute target:
```
ProcessLessons:
  Type: Map
  MaxConcurrency: 5    # 15 lessons / 5 parallel = 3 batches × 20s = 60s
```

### Streaming Responses
Agents use `bedrock:InvokeModelWithResponseStream` for long content generation to reduce perceived latency and enable progress tracking.

### Research Caching
Before invoking Research Agent, check DynamoDB for cached research on same topic + program_level:
- Key: `CACHE#topic#{hash(topic+level)}`, SK: `RESEARCH`
- TTL: 24 hours
- Hit: skip Research Agent, use cached findings
- Miss: invoke Research Agent, cache result

## Reliability Patterns

### Model Fallback
Each agent wraps Bedrock calls with fallback logic:
```python
async def invoke_model(prompt, primary="claude-sonnet-4-5", fallback="claude-haiku"):
    try:
        return await bedrock.invoke(model=primary, prompt=prompt)
    except ThrottlingException:
        logger.warning("Primary model throttled, falling back")
        return await bedrock.invoke(model=fallback, prompt=prompt)
```

### Idempotency
Each agent checks if output already exists before generating:
- Content Agent: check S3 for `{curriculum_id}/lessons/{lesson_order}.md`
- Assessment Agent: check DynamoDB for `CURR#{id}` / `QUIZ#{order}`
- If exists and status != REJECTED: skip generation (idempotent retry)

## Security Patterns

### Input Sanitisation
```python
def sanitise_topic(topic: str) -> str:
    topic = topic[:500]
    for pattern in ["ignore previous", "system:", "assistant:", "<|", "|>"]:
        topic = topic.replace(pattern, "")
    return topic.strip()
```

### Bedrock Guardrails
- Content filters: hate, violence, sexual, misconduct
- PII detection: mask any PII in generated content
- Topic denial: block off-topic or harmful content generation
- Apply guardrail ID to all agent Bedrock invocations

## Observability Patterns

### Structured Logging
```json
{
    "agent": "content",
    "curriculum_id": "c123",
    "lesson_order": 3,
    "model": "claude-sonnet-4-5",
    "input_tokens": 1500,
    "output_tokens": 3200,
    "latency_ms": 18500,
    "status": "success"
}
```

### CloudWatch Metrics
- `AgentInvocationCount` (per agent, per model)
- `AgentLatency` (per agent, p50/p90/p99)
- `AgentTokenUsage` (per agent, input/output)
- `AgentErrorCount` (per agent, per error type)
- `PipelineCompletionTime` (end-to-end)
