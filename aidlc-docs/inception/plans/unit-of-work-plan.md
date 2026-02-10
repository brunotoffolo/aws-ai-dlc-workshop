# Unit of Work Plan

## Plan Overview
This plan decomposes the on-demand tutorial platform into independently developable units of work based on the approved application design (components, services, and dependencies).

---

## Section 1: Clarifying Questions

### Code Organisation

## Question 1
What project structure do you prefer for the backend services?

A) Monorepo — single repository with all Lambda services, agents, and shared code in one project
B) Multi-repo — separate repository per service/agent
C) Monorepo with workspace packages — single repo, but each service is a separate Python package with shared libraries
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should the agents be packaged for deployment?

A) Each agent as its own Lambda function (independent deployment)
B) All agents in a single Lambda function with routing logic
C) Agents as a shared library invoked by the service Lambdas that need them (e.g., Curriculum Service Lambda imports and calls Orchestrator Agent directly)
D) Other (please describe after [Answer]: tag below)

[Answer]: D - Leverage AgentCore runtime. Each agent as a separate container.

## Question 3
Should the frontend and backend be developed as separate units (independent deployment) or together?

A) Separate units — frontend deployed to S3/CloudFront independently from backend
B) Together — single deployment pipeline for both
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
What Infrastructure as Code tool do you prefer?

A) AWS CDK (Python)
B) AWS CDK (TypeScript)
C) AWS CloudFormation (YAML/JSON)
D) Terraform
E) AWS SAM
F) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Section 2: Unit Generation Execution Plan

Once questions are answered, the following steps will be executed:

- [x] **Step 1**: Define units of work based on answers and application design
  - [x] Identify unit boundaries (services, agents, frontend, infrastructure)
  - [x] Define each unit's scope, responsibilities, and deliverables
  - [x] Document code organisation strategy

- [x] **Step 2**: Create unit dependency matrix
  - [x] Map dependencies between units
  - [x] Identify build order and integration points
  - [x] Define development sequence (which units can be parallel vs sequential)

- [x] **Step 3**: Map user stories to units
  - [x] Assign each MVP story to its primary unit
  - [x] Identify cross-unit stories that span multiple units
  - [x] Verify complete story coverage

- [x] **Step 4**: Save artifacts
  - [x] Save `aidlc-docs/inception/application-design/unit-of-work.md`
  - [x] Save `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
  - [x] Save `aidlc-docs/inception/application-design/unit-of-work-story-map.md`
