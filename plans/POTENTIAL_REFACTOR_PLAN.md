# Refactor Plan

This plan focuses on code duplication and refactoring opportunities in application source and tests. It intentionally ignores Prisma seed data, generated Prisma client files, `dist`, and `node_modules`.

## Highest-Value Refactors

1. Extract backend HTTP JSON helpers.
2. Extract shared OpenAI JSON client/request utility.
3. Extract workflow processing types, include/order constants, `loadWorkflowForProcessing`, and `nextSequence`.
4. Move frontend date formatting into `src/frontend/format.ts`.
5. Add workflow test client helpers if test growth continues.

## Detailed Opportunities

### 1. Backend HTTP Helpers

`sendJson` is duplicated in:

- `src/backend/workflows/workflow.controller.ts`
- `src/backend/requests/request.controller.ts`
- `src/backend/doctors/pool.controller.ts`

`readJsonBody` is duplicated in:

- `src/backend/workflows/workflow.controller.ts`
- `src/backend/requests/request.controller.ts`

Refactor: add `src/backend/http/json.ts` with `sendJson`, `readJsonBody`, and possibly `sendError`.

### 2. OpenAI JSON Client Setup

OpenAI setup and JSON parsing are repeated across:

- `src/backend/inference/routing.ts`
- `src/backend/inference/skills-ranking.ts`
- `src/backend/inference/doctor-ranking.ts`
- `src/backend/inference/workflow-action.ts`
- `src/backend/inference/assignment-summary.ts`

Each module repeats environment loading, API key lookup, model resolution, `new OpenAI({ apiKey })`, `responses.create(...)`, and `JSON.parse(response.output_text)`.

Refactor: extract a small shared utility, for example `src/backend/inference/openai-json.ts`, with helpers such as `createOpenAIClient(options)` and `requestJson({ model, systemPrompt, payload })`. Keep domain-specific client classes thin.

### 3. Workflow Types And Query Constants

Similar workflow request/task/persistence types appear in:

- `src/backend/workflows/workflow-list.service.ts`
- `src/backend/workflows/workflow-action.service.ts`
- `src/backend/workflows/doctor-assignment.service.ts`
- `src/backend/workflows/workflow.service.ts`

Refactor: extract shared workflow persistence types like `WorkflowRequestRecord`, `WorkflowTaskRecord`, and `WorkflowTaskCreateData` into `src/backend/workflows/workflow-types.ts`.

### 4. Workflow Loading

Workflow processing loads are duplicated in:

- `src/backend/workflows/workflow-action.service.ts`
- `src/backend/workflows/doctor-assignment.service.ts`

Both use the same request/task ordering and similar not-found handling.

Refactor: create `loadWorkflowForProcessing(workflowId, client)` and shared constants for workflow include/order clauses.

### 5. Workflow Task Creation

Workflow task creation payloads are verbose and repeated throughout:

- `src/backend/workflows/doctor-assignment.service.ts`
- `src/backend/workflows/workflow-action.service.ts`

Refactor: add a small `createWorkflowTaskData(...)` helper or named builders for common task kinds such as `workflow_action`, `doctor_assignment`, and `unknown_human_review`.

### 6. Workflow Sequence Handling

`nextSequence` exists in `src/backend/workflows/workflow-action.service.ts`, but doctor assignment uses hardcoded sequences `2`, `3`, `4`, and `5`.

Refactor: extract `nextSequence(tasks)` and consider symbolic task sequence helpers/constants. This reduces the risk of sequence conflicts if workflows gain intermediate tasks.

### 7. Assignment Output Mapping

`toFinalAssignment` in `src/backend/workflows/doctor-assignment.service.ts` has nearly identical branches for `needs_review` and `unassignable`.

Refactor: collapse these into one shared non-completed path.

### 8. Frontend API Loading State

Similar `useEffect`, cancellation flag, `fetch`, and error-state logic appears in:

- `src/frontend/main.tsx`
- `src/frontend/components/WorkflowsPage.tsx`
- `src/frontend/components/WorkflowDetailPage.tsx`

Refactor: add endpoint-specific hooks such as `useClinicalTeam`, `useWorkflows`, and `useWorkflowDetails`. Prefer endpoint-specific hooks over a generic abstraction while the app is small.

### 9. Frontend Date Formatting

`formatDate` is duplicated in:

- `src/frontend/components/WorkflowDetailPage.tsx`
- `src/frontend/components/WorkflowsPage.tsx`

Refactor: move `formatDate` into `src/frontend/format.ts` beside `formatLabel`.

### 10. Frontend Page Hero Markup

Hero/header markup repeats in:

- `src/frontend/components/DoctorsPage.tsx`
- `src/frontend/components/WorkflowsPage.tsx`
- `src/frontend/components/WorkflowDetailPage.tsx`

Refactor: consider a lightweight `PageHero` component for eyebrow/logo/title/intro/summary-card structure. Keep it simple to avoid over-abstracting page-specific layouts.

### 11. Workflow Test Helpers

In-memory workflow client builders are similar in:

- `src/backend/workflows/workflow-action.service.test.ts`
- `src/backend/workflows/doctor-assignment.service.test.ts`

Refactor: create test helpers under `src/backend/test-utils/workflow-client.ts` or `src/backend/workflows/test-utils.ts` for workflow fixtures, transaction mocks, `workflowTask.create`, `assignment.create`, and `workflow.update`.

## Suggested Order

1. Start with `sendJson` and `readJsonBody`; low risk and immediately reduces controller duplication.
2. Move `formatDate`; low risk and easy to verify.
3. Extract workflow types and load helpers; moderate risk because workflow services are central.
4. Extract OpenAI JSON helper; higher value, but verify all inference tests after this change.
5. Refactor workflow task builders and test utilities once the shared workflow shape is stable.
