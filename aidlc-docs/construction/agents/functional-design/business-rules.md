# Business Rules — Unit 4: AI Agents

## Content Quality Rules

| Rule | Value | Applies To |
|---|---|---|
| Min lesson length | 500 words | Content Agent |
| Max lesson length | 3000 words | Content Agent |
| Required sections | Objectives, Introduction, Core Content, Key Takeaways, Summary | Content Agent |
| ASCII diagram | Include when concept is spatial, relational, or process-based | Content Agent |
| Subtitle text | Generate plain-text narration script for every lesson | Content Agent |
| Language level | Match program_level (beginner=simple, advanced=technical) | Content Agent |

## Quiz Generation Rules

| Rule | Value | Applies To |
|---|---|---|
| Questions per lesson quiz | 5-10 | Assessment Agent |
| Questions per pre-assessment | 15-20 (covering all modules) | Assessment Agent |
| MCQ options | 4 options per question | Assessment Agent |
| Question type distribution (quiz) | 60% MCQ, 30% short answer, 10% practical | Assessment Agent |
| Question type distribution (practical) | 20% MCQ, 30% short answer, 50% practical | Assessment Agent |
| Passing score | 60% | Assessment Agent |
| Rubric required | All non-MCQ questions must have grading rubric | Assessment Agent |

## Adaptive Difficulty Rules

| Rule | Value |
|---|---|
| Starting Bloom's level (no pre-assessment) | 1 (Remember) |
| Rolling window size | Last 10 questions |
| Advance threshold | >80% accuracy at current level |
| Drop threshold | <50% accuracy at current level |
| Min questions before level change | 5 questions at current level |
| Max Bloom's level | 6 (Create) |
| Min Bloom's level | 1 (Remember) |

## Personalisation Rules

| Rule | Value |
|---|---|
| Skip threshold | Pre-assessment score >90% on topic → mark lesson "optional" |
| Focus threshold | Pre-assessment score <40% on topic → mark lesson "required" + add remedial |
| Path recalculation trigger | Quiz score deviates >20% from predicted performance |
| Memory update frequency | After every quiz submission |
| Default path (no pre-assessment) | All lessons "required", start from beginning |

## Research Rules

| Rule | Value |
|---|---|
| Min modules per curriculum | 3 |
| Max modules per curriculum | 8 |
| Min lessons per module | 2 |
| Max lessons per module | 5 |
| Curriculum structure | Beginner: 3-4 modules, Intermediate: 4-6, Advanced: 5-8 |
