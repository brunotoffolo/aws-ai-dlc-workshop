# NFR Requirements Plan — Unit 4: AI Agents

## Unit Context
- **Unit**: AI Agents (4 agents on AgentCore containers, Strands SDK, Bedrock LLM)
- **Key NFR concerns**: LLM latency, token costs, Bedrock throttling, agent reliability, content quality

---

## Section 1: Clarifying Questions

## Question 1
What is the acceptable latency for full curriculum generation (Research → Content → Assessment for all lessons)?

A) Under 2 minutes total (fast, may need aggressive parallelisation)
B) Under 5 minutes total (reasonable for background generation)
C) Under 10 minutes total (relaxed, user gets notified when ready)
D) No hard limit — user submits request and gets notified via dashboard when complete
E) Other (please describe after [Answer]: tag below)

[Answer]: 2 minutes

## Question 2
What Bedrock model should the agents use?

A) Claude 3.5 Sonnet (best quality, higher cost)
B) Claude 3 Haiku (fastest, cheapest, lower quality)
C) Different models per agent — Sonnet for content/research, Haiku for assessment/personalisation
D) Other (please describe after [Answer]: tag below)

[Answer]: sonnet 4.5

## Question 3
How should the system handle Bedrock throttling or transient failures?

A) Retry with exponential backoff (already in Step Functions), fail after 3 attempts
B) Retry + fallback to a cheaper/faster model if primary model is throttled
C) Queue requests and process when capacity is available
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Section 2: Execution Plan

- [x] **Step 1**: Define performance requirements (latency, throughput per agent)
- [x] **Step 2**: Define reliability requirements (error handling, retries, fallbacks)
- [x] **Step 3**: Define cost optimisation requirements (token budgets, model selection)
- [x] **Step 4**: Define security requirements (prompt injection protection, content safety)
- [x] **Step 5**: Define tech stack decisions specific to agents
- [x] **Step 6**: Save artifacts
