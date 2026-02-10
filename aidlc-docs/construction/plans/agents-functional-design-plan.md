# Functional Design Plan — Unit 4: AI Agents

## Unit Context
- **Unit**: AI Agents (Python, Strands SDK, AgentCore containers)
- **Agents**: Research, Content Generation, Assessment, Personalisation
- **Invoked by**: Step Functions (pipeline), API Services (on-demand grading/personalisation)
- **Dependencies**: Unit 2 (shared models, db, s3, keys)
- **Stories**: US-004, US-007, US-009, US-010, US-011, US-012, US-013

---

## Section 1: Clarifying Questions

### Research Agent

## Question 1
What web search capability should the Research Agent use?

A) Tavily API (purpose-built for AI agents, good summarisation)
B) Bedrock's built-in web search tool (if available in your region)
C) Custom web scraping with BeautifulSoup/requests + Bedrock summarisation
D) No web search for MVP — use Bedrock's training knowledge only, add web search later
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 2
Should the Research Agent use RAG with a knowledge base for MVP, or defer that to a later phase?

A) Include RAG with Amazon Bedrock Knowledge Bases from the start
B) Defer RAG — use Bedrock model knowledge + web search only for MVP
C) Other (please describe after [Answer]: tag below)

[Answer]: B

### Content Generation Agent

## Question 3
What diagram generation approach should the Content Agent use?

A) Generate Mermaid diagram code (rendered by frontend)
B) Generate diagrams via an image generation model (Titan Image Generator)
C) Generate PlantUML code (rendered by frontend or converted server-side)
D) Text-based ASCII diagrams only for MVP
E) Other (please describe after [Answer]: tag below)

[Answer]: D

### Assessment Agent

## Question 4
How should the adaptive difficulty algorithm work?

A) Simple threshold — track rolling accuracy over last 10 questions, adjust up/down
B) Elo-style rating — learner has a skill rating that adjusts per question
C) Bloom's taxonomy levels — questions tagged by cognitive level, progress through levels
D) Open to recommendation
E) Other (please describe after [Answer]: tag below)

[Answer]: D surprise me

### Personalisation Agent

## Question 5
What should AgentCore memory store for each learner?

A) Knowledge profile only (topics mastered, topics weak, skill levels)
B) Knowledge profile + learning style preferences (visual, text, hands-on)
C) Knowledge profile + learning style + full interaction history (all questions asked, responses)
D) Minimal — just pre-assessment results and quiz scores (rest in DynamoDB)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Section 2: Execution Plan

- [x] **Step 1**: Define Research Agent business logic
  - [x] Research pipeline (search → synthesise → fact-check → structure)
  - [x] Output schema (findings, sources, curriculum outline)

- [x] **Step 2**: Define Content Generation Agent business logic
  - [x] Lesson generation pipeline (outline → content → diagrams → subtitles)
  - [x] Output schema (markdown content, diagram code, subtitle text)

- [x] **Step 3**: Define Assessment Agent business logic
  - [x] Quiz generation rules (question types, difficulty mapping)
  - [x] Grading logic (auto-grade MCQ, rubric-evaluate text)
  - [x] Adaptive difficulty algorithm

- [x] **Step 4**: Define Personalisation Agent business logic
  - [x] Pre-assessment analysis rules
  - [x] Adaptive path generation algorithm
  - [x] AgentCore memory schema and usage patterns

- [x] **Step 5**: Define business rules
  - [x] Content quality rules (length, structure, readability)
  - [x] Quiz generation rules (question count, type distribution)
  - [x] Difficulty scaling rules

- [x] **Step 6**: Save artifacts
