# Code Generation Plan — Unit 4: AI Agents

## Unit Context
- **Unit**: AI Agents (Python, Strands SDK, AgentCore)
- **Location**: `backend/agents/` in workspace root
- **Agents**: Research, Content Generation, Assessment, Personalisation
- **Model**: Claude Sonnet 4.5 (primary), Claude Haiku (fallback)
- **Design refs**: functional-design/, nfr-requirements/, nfr-design/

## Code Generation Steps

- [ ] **Step 1**: Initialize agents package with shared utilities
  - [ ] `pyproject.toml`, `__init__.py`
  - [ ] `tools/bedrock.py` — model invocation with fallback logic
  - [ ] `tools/sanitise.py` — input sanitisation

- [ ] **Step 2**: Create Research Agent
  - [ ] `research/agent.py` — topic analysis + curriculum outline generation
  - [ ] `research/prompts.py` — system/user prompt templates

- [ ] **Step 3**: Create Content Generation Agent
  - [ ] `content_gen/agent.py` — lesson content + ASCII diagrams + subtitles
  - [ ] `content_gen/prompts.py` — prompt templates

- [ ] **Step 4**: Create Assessment Agent
  - [ ] `assessment/agent.py` — quiz generation + grading
  - [ ] `assessment/prompts.py` — prompt templates
  - [ ] `assessment/difficulty.py` — Bloom's taxonomy adaptive algorithm

- [ ] **Step 5**: Create Personalisation Agent
  - [ ] `personalisation/agent.py` — pre-assessment analysis + adaptive path
  - [ ] `personalisation/prompts.py` — prompt templates

- [ ] **Step 6**: Test all agents
- [ ] **Step 7**: Generate code summary
