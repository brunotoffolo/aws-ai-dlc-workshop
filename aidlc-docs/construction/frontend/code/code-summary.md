# Code Summary — Unit 5: Frontend

## Overview
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + ShadCN UI (Radix primitives)
- **API Layer**: TanStack Query + Axios
- **Routing**: React Router v6 with lazy loading
- **Forms**: React Hook Form + Zod validation
- **Total Files**: 45

## File Inventory

### Configuration (5 files)
- `package.json` — Dependencies and scripts
- `vite.config.ts` — Vite config with path aliases
- `tsconfig.json` — TypeScript config
- `tailwind.config.ts` — Tailwind + ShadCN theme
- `postcss.config.js` — PostCSS config

### ShadCN UI Components (8 files)
- `src/components/ui/button.tsx` — Button with variants
- `src/components/ui/input.tsx` — Input field
- `src/components/ui/card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent
- `src/components/ui/label.tsx` — Form label
- `src/components/ui/select.tsx` — Select dropdown
- `src/components/ui/textarea.tsx` — Textarea
- `src/components/ui/dialog.tsx` — Modal dialog
- `src/components/ui/tabs.tsx` — Tab navigation
- `src/components/ui/toast.tsx` — Toast notifications

### Core Infrastructure (5 files)
- `src/lib/utils.ts` — cn() class merge utility
- `src/lib/api-client.ts` — Axios instance with auth interceptor
- `src/lib/query-client.ts` — TanStack Query client
- `src/contexts/auth-context.tsx` — Auth state management
- `src/config/env.ts` — Environment variable loader

### API Hooks (6 files)
- `src/hooks/api/use-auth.ts` — Register, login, verify, profile hooks
- `src/hooks/api/use-curriculum.ts` — Generate, list, status polling, wizard, assign hooks
- `src/hooks/api/use-content.ts` — Lesson, review queue, review action hooks
- `src/hooks/api/use-assessment.ts` — Quiz, submit answers, pre-assessment hooks
- `src/hooks/api/use-progress.ts` — Progress, complete lesson, resume, dashboard hooks
- `src/hooks/api/use-admin.ts` — Learner overview, course catalog, review backlog hooks

### Auth Components (2 files)
- `src/components/auth/protected-route.tsx` — Route guard
- `src/components/auth/role-guard.tsx` — Role-based access

### Auth Pages (4 files)
- `src/pages/auth/register.tsx` — Registration (US-001)
- `src/pages/auth/login.tsx` — Login (US-002)
- `src/pages/auth/verify-email.tsx` — Email verification (US-001)
- `src/pages/auth/profile.tsx` — Profile management (US-003)

### Learner Pages (4 files)
- `src/pages/learner/dashboard.tsx` — Main dashboard (US-014)
- `src/pages/learner/curriculum-create.tsx` — Curriculum creation (US-004, US-005)
- `src/pages/learner/lesson-view.tsx` — Lesson viewer (US-008)
- `src/pages/learner/quiz.tsx` — Quiz interface (US-011)

### Learner Components (2 files)
- `src/components/learner/curriculum-card.tsx` — Curriculum card
- `src/components/learner/progress-chart.tsx` — Progress bar

### Curriculum Components (3 files)
- `src/components/curriculum/free-text-form.tsx` — Free-text input (US-004)
- `src/components/curriculum/guided-wizard.tsx` — Guided wizard (US-005)
- `src/components/curriculum/generation-status.tsx` — Status polling

### Content Components (2 files)
- `src/components/content/markdown-renderer.tsx` — Markdown display
- `src/components/content/lesson-navigation.tsx` — Prev/Next navigation

### Assessment Components (3 files)
- `src/components/assessment/question-renderer.tsx` — MCQ/short answer/practical
- `src/components/assessment/quiz-results.tsx` — Results display
- `src/components/assessment/pre-assessment.tsx` — Pre-assessment flow (US-009)

### Admin Pages (4 files)
- `src/pages/admin/dashboard.tsx` — Admin overview
- `src/pages/admin/learners.tsx` — Learner overview (US-016)
- `src/pages/admin/courses.tsx` — Course management (US-017)
- `src/pages/admin/review-queue.tsx` — Content review (US-008)

### Admin Components (3 files)
- `src/components/admin/learner-table.tsx` — Learner data table
- `src/components/admin/assignment-dialog.tsx` — Curriculum assignment modal (US-006)
- `src/components/admin/review-item.tsx` — Review card with approve/reject

### Layout Components (3 files)
- `src/components/layout/app-layout.tsx` — Main layout with sidebar
- `src/components/layout/header.tsx` — Header with user menu
- `src/components/layout/sidebar.tsx` — Navigation sidebar

### App Entry (4 files)
- `src/App.tsx` — Root component with providers
- `src/main.tsx` — ReactDOM render
- `src/vite-env.d.ts` — Vite type declarations
- `index.html` — HTML entry point

## Story Coverage
| Story | Status | Components |
|-------|--------|------------|
| US-001 | ✅ | register.tsx, verify-email.tsx |
| US-002 | ✅ | login.tsx |
| US-003 | ✅ | profile.tsx |
| US-004 | ✅ | free-text-form.tsx, generation-status.tsx |
| US-005 | ✅ | guided-wizard.tsx |
| US-006 | ✅ | assignment-dialog.tsx |
| US-007 | ✅ | curriculum-detail.tsx (lesson generation status display) |
| US-008 | ✅ | lesson-view.tsx, review-queue.tsx, review-item.tsx |
| US-009 | ✅ | pre-assessment.tsx |
| US-010 | ✅ | curriculum-detail.tsx (adaptive path banner + reordered lessons) |
| US-011 | ✅ | quiz.tsx, question-renderer.tsx |
| US-012 | ✅ | quiz.tsx (difficulty level indicator), curriculum-detail.tsx (per-lesson difficulty) |
| US-013 | ✅ | question-renderer.tsx (practical type) |
| US-014 | ✅ | dashboard.tsx, progress-chart.tsx |
| US-015 | ✅ | use-progress.ts (resume hooks) |
| US-016 | ✅ | learners.tsx, learner-table.tsx |
| US-017 | ✅ | courses.tsx |

## Automation
All interactive elements include `data-testid` attributes following `{component}-{element-role}` convention.
