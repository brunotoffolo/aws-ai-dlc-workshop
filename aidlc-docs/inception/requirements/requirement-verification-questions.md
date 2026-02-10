# Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the on-demand tutorial platform. Fill in the letter choice after each `[Answer]:` tag. If none of the options match, choose the last option (Other) and describe your preference.

---

## Section 1: Platform & Users

## Question 1
Who is the primary target audience for this platform?

A) Individual learners seeking professional development / upskilling
B) University students supplementing their degree coursework
C) Corporate employees in training programs
D) Educators / institutions creating curriculum for their students
E) All of the above - a general-purpose learning platform
F) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
How will users authenticate and access the platform?

A) Email/password registration with optional social login
B) OAuth only (Google, LinkedIn, etc.)
C) SSO integration for enterprise/institutional users
D) Combination of email/password + social login + SSO
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
What "degree programs" should the platform support? How formal should accreditation be?

A) Informal certificates of completion (self-issued by the platform, no formal accreditation body)
B) Micro-credentials / digital badges (verifiable but not formally accredited)
C) Formal accreditation aligned with real educational institutions or bodies
D) Tiered system - informal certificates for short courses, micro-credentials for programs
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Section 2: Multi-Agent Architecture & AI

## Question 4
What is your preferred cloud infrastructure for hosting the multi-agent system?

A) AWS fully (Lambda, ECS/EKS, Bedrock, etc.)
B) AWS primarily with some third-party AI services (e.g., OpenAI API)
C) Cloud-agnostic / multi-cloud approach
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
For the multi-agent architecture, what is your preferred orchestration approach?

A) Amazon Bedrock Agents with AgentCore for memory and orchestration
B) Custom agent framework (e.g., LangGraph, CrewAI) deployed on AWS
C) Hybrid - Bedrock Agents for some tasks, custom agents for others
D) Open to recommendation based on best fit
E) Other (please describe after [Answer]: tag below)

[Answer]: Other - Bedrock Agent Core with AWS Strands

## Question 6
What LLM capabilities do you envision for content generation?

A) Amazon Bedrock foundation models only (Claude, Titan, etc.)
B) Mix of Bedrock models and external APIs (OpenAI, etc.)
C) Self-hosted open-source models (Llama, Mistral) on SageMaker
D) Open to recommendation based on quality and cost
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What does "deep research capabilities" mean for your platform?

A) Web search and summarisation of existing educational content on a topic
B) RAG (Retrieval-Augmented Generation) over curated knowledge bases and academic papers
C) Real-time research agent that searches multiple sources, synthesises, and fact-checks
D) All of the above - layered research from simple search to deep synthesis
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Section 3: Content Generation & Curriculum

## Question 8
What types of educational content should be auto-generated?

A) Text-based only (lessons, explanations, reading materials)
B) Text + auto-generated diagrams/charts/visual aids
C) Text + diagrams + auto-generated slide decks / presentations
D) Full multimedia (text, diagrams, slides, and AI-generated audio/video narration)
E) Other (please describe after [Answer]: tag below)

[Answer]: D

## Question 9
How should quizzes and tests be structured?

A) Multiple choice questions only
B) Multiple choice + short answer / essay questions
C) Multiple choice + short answer + practical coding/hands-on exercises
D) Adaptive testing (difficulty adjusts based on learner performance)
E) All of the above with adaptive difficulty
F) Other (please describe after [Answer]: tag below)

[Answer]: E

## Question 10
What "test types" should the platform support (as mentioned in your request)?

A) Quizzes (per-lesson knowledge checks)
B) Quizzes + midterm/final exams (per-module/course assessments)
C) Quizzes + exams + practical assessments (projects, portfolios)
D) Quizzes + exams + practical + certification exams (timed, proctored-style)
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 11
How should personalisation work for learners?

A) Adaptive learning paths based on pre-assessment of knowledge level
B) Content difficulty adjustment based on quiz performance
C) Full personalisation - learning style detection, pace adjustment, content format preferences, knowledge gaps
D) Personalised recommendations only (suggest next topics/courses)
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Section 4: LinkedIn Integration

## Question 12
What level of LinkedIn integration do you need?

A) Post a simple text update with certificate link when user completes a course
B) Post rich media (certificate image + description) to user's LinkedIn feed
C) Full profile integration - update certifications section, post to feed, and add skills
D) LinkedIn Learning-style integration with course catalog visibility
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 13
Should the platform also integrate with other professional/social platforms beyond LinkedIn?

A) LinkedIn only
B) LinkedIn + other professional platforms (e.g., Credly for badges)
C) LinkedIn + general social media (Twitter/X, Facebook)
D) Extensible integration framework to add platforms over time
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Section 5: Technical & Non-Functional Requirements

## Question 14
What is the expected scale of the platform at launch?

A) Small - up to 100 concurrent users
B) Medium - up to 1,000 concurrent users
C) Large - up to 10,000 concurrent users
D) Enterprise - 10,000+ concurrent users
E) Start small with ability to scale (MVP approach)
F) Other (please describe after [Answer]: tag below)

[Answer]: E

## Question 15
What is the preferred frontend technology?

A) React (Next.js)
B) Vue.js (Nuxt.js)
C) Angular
D) No frontend needed - API-only backend (headless)
E) Open to recommendation
F) Other (please describe after [Answer]: tag below)

[Answer]: F - React, Vite, Tailwind, ShadCN

## Question 16
What is the preferred backend language/framework?

A) Python (FastAPI / Flask)
B) TypeScript (Node.js / NestJS)
C) Java (Spring Boot)
D) Go
E) Open to recommendation
F) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 17
What database strategy do you prefer?

A) Relational (PostgreSQL / Aurora)
B) NoSQL (DynamoDB)
C) Hybrid - relational for structured data, NoSQL for content/sessions
D) Open to recommendation
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 18
What is the deployment and infrastructure preference?

A) Serverless (Lambda, API Gateway, DynamoDB)
B) Containerised (ECS/EKS with Fargate)
C) Hybrid - serverless for agents, containers for web app
D) Open to recommendation based on architecture needs
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 19
What are the key non-functional priorities? (Choose the most important)

A) Performance and low latency (fast content generation)
B) Cost optimisation (minimise AI/compute costs)
C) Security and data privacy (especially for learner data)
D) Scalability and reliability
E) All equally important
F) Other (please describe after [Answer]: tag below)

[Answer]: E

---

## Section 6: Scope & MVP

## Question 20
What is the desired scope for the initial build?

A) Full platform with all features (content generation, quizzes, accreditation, LinkedIn, personalisation)
B) MVP - core content generation + quizzes, then iterate to add accreditation and LinkedIn
C) MVP - single agent for content generation, then expand to multi-agent
D) Proof of concept - demonstrate the multi-agent architecture with one topic area
E) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 21
Should the platform support multiple languages for content generation?

A) English only
B) English primarily with future multi-language support planned
C) Multi-language from the start (specify languages after [Answer]: tag)
D) Other (please describe after [Answer]: tag below)

[Answer]: B - focus in English with support for future externalization
