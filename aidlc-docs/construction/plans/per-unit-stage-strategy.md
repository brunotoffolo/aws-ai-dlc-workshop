# Construction Phase — Per-Unit Stage Execution Strategy

## Stage Execution Matrix

| Stage | Unit 1: Infra | Unit 2: Shared | Unit 3: API | Unit 4: Agents | Unit 5: Frontend |
|---|---|---|---|---|---|
| Functional Design | SKIP | SKIP | EXECUTE | EXECUTE | EXECUTE |
| NFR Requirements | SKIP | SKIP | EXECUTE | EXECUTE | EXECUTE |
| NFR Design | SKIP | SKIP | EXECUTE | EXECUTE | EXECUTE |
| Infrastructure Design | EXECUTE | SKIP | EXECUTE | EXECUTE | EXECUTE |
| Code Generation | EXECUTE | EXECUTE | EXECUTE | EXECUTE | EXECUTE |

## Rationale for Skips

- **Unit 1 (Infrastructure)**: Pure CDK/IaC — no business logic, no domain models. Goes straight to Infrastructure Design (defining the stacks) then Code Generation
- **Unit 2 (Shared Library)**: Data access layer and common utilities — its design is driven by Units 3/4/5 needs. Goes straight to Code Generation (schemas and utilities defined by consuming units)

## Execution Order

1. **Unit 1 (Infrastructure)** first → defines all AWS resources
2. **Unit 2 (Shared Library)** second → defines shared models/schemas used by all other units
3. **Units 3 (API), 4 (Agents), 5 (Frontend)** in parallel → full treatment with all stages
