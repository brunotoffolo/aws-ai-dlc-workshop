# Code Generation Plan — Unit 4: AI Agents

## Unit Context
- **Unit**: AI Agents (Python, Strands SDK, AgentCore)
- **Location**: `backend/agents/` in workspace root
- **Agents**: Research, Content Generation, Assessment, Personalisation
- **Model**: Claude Sonnet 4.5 (primary), Claude Haiku (fallback)
- **Design refs**: functional-design/, nfr-requirements/, nfr-design/

## Code Generation Steps

- [x] **Step 1**: Initialize agents package with shared utilities
  - [x] `pyproject.toml`, `__init__.py`
  - [x] `tools/bedrock.py` — model invocation with fallback logic
  - [x] `tools/sanitise.py` — input sanitisation

- [x] **Step 2**: Create Research Agent
  - [x] `research/agent.py` — topic analysis + curriculum outline generation
  - [x] `research/prompts.py` — system/user prompt templates

- [x] **Step 3**: Create Content Generation Agent
  - [x] `content_gen/agent.py` — lesson content + ASCII diagrams + subtitles
  - [x] `content_gen/prompts.py` — prompt templates

- [x] **Step 4**: Create Assessment Agent
  - [x] `assessment/agent.py` — quiz generation + grading
  - [x] `assessment/prompts.py` — prompt templates
  - [x] `assessment/difficulty.py` — Bloom's taxonomy adaptive algorithm

- [x] **Step 5**: Create Personalisation Agent
  - [x] `personalisation/agent.py` — pre-assessment analysis + adaptive path
  - [x] `personalisation/prompts.py` — prompt templates

- [x] **Step 6**: Test all agents
- [x] **Step 7**: Generate code summary
