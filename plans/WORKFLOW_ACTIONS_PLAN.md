# Workflow Actions Plan

## Goal

Add a generic workflow action entry point that accepts free-text user instructions from the workflow detail page. The first implemented action will support doctor reassignment, while unsupported future actions are persisted for auditability.

## API

Add a generic endpoint:

```http
POST /api/workflows/:workflowId/actions
```

Request body:

```json
{
  "message": "Please assign this to Dr. Emily Chen"
}
```

Example successful response:

```json
{
  "workflowId": 12,
  "actionTaskId": 9,
  "resultTaskId": 10,
  "action": "reassign_doctor",
  "status": "completed",
  "message": "Assigned to Dr. Emily Chen."
}
```

Example unsupported response:

```json
{
  "workflowId": 12,
  "actionTaskId": 9,
  "action": "close_assignment",
  "status": "unsupported",
  "message": "This workflow action is not implemented yet."
}
```

## Supported Action Types

The action classifier should initially recognize:

- `reassign_doctor`
- `close_assignment`
- `send_to_human_review`
- `reassign_non_doctor`
- `unknown`

Only `reassign_doctor` will be executable at first. The others should be persisted with status `unsupported`.

## Backend Changes

1. Add workflow action inference.

   New file: `src/backend/inference/workflow-action.ts`

   The LLM should classify free-text input into a structured action result containing:

   ```ts
   type WorkflowAction = {
     action: 'reassign_doctor' | 'close_assignment' | 'send_to_human_review' | 'reassign_non_doctor' | 'unknown';
     requestedAssigneeName: string | null;
     reason: string;
     confidence: number;
   };
   ```

2. Add a workflow action service.

   New file: `src/backend/workflows/workflow-action.service.ts`

   Responsibilities:

   - Validate non-empty user message.
   - Load workflow context, including requests and tasks.
   - Compute the next task sequence using `max(existing.sequence) + 1`.
   - Persist a `workflow_action` task for every submitted action.
   - Dispatch supported actions to specific handlers.
   - Persist unsupported recognized actions with status `unsupported`.

3. Implement doctor reassignment handling.

   For `reassign_doctor`:

   - Use the classified `requestedAssigneeName`.
   - Find active, non-PTO doctors by name.
   - Ask the LLM to select only from those candidate doctors.
   - Validate the selected doctor is in the candidate list.
   - Append a `doctor_reassignment` task.
   - Create an `Assignment` linked to that reassignment task.
   - Update workflow status to `assigned`.

4. Add name-based doctor lookup.

   Extend doctor lookup utilities with a function such as:

   ```ts
   findCandidateDoctorsByName(name: string): Promise<CandidateDoctorPayload[]>
   ```

   It should return the same candidate payload shape used by the existing doctor assignment ranking flow.

5. Add controller support.

   In `src/backend/workflows/workflow.controller.ts`, add a controller such as:

   ```ts
   createWorkflowActionController(request, response, workflowId)
   ```

   It should:

   - Parse JSON body.
   - Validate `message`.
   - Call `processWorkflowAction`.
   - Return JSON status/result.

6. Wire the backend route.

   In `src/backend/main.ts`, add route handling for:

   ```ts
   /^\/api\/workflows\/(\d+)\/actions$/
   ```

   Allow only `POST`.

## Task Persistence

Use existing Prisma models. No schema change is required for the first implementation.

Persist every submitted text instruction as a `WorkflowTask` with:

```ts
taskType: 'workflow_action'
status: 'completed' | 'unsupported' | 'needs_review'
input: {
  message: string
}
output: {
  action: string
  requestedAssigneeName: string | null
  confidence: number
  reason: string
}
reason: string
```

For successful doctor reassignment, append another task:

```ts
taskType: 'doctor_reassignment'
status: 'completed'
input: {
  actionTaskId: number
  message: string
  requestedDoctorName: string
  previousAssignmentTaskId: number | null
  previousDoctorId: number | null
  previousDoctorName: string | null
  candidateDoctors: CandidateDoctorPayload[]
}
output: {
  assignedDoctorId: number
  assignedDoctorName: string
  assignmentReason: string
  confidence: number
}
reason: string
```

Unsupported actions should persist only the `workflow_action` task with status `unsupported`.

## Frontend Changes

Update the collapsible panel on `src/frontend/components/WorkflowDetailPage.tsx`:

- Rename the UI from task-specific copy to generic workflow action copy.
- Submit to `/api/workflows/${workflowId}/actions`.
- Enable the submit button when the text input is non-empty.
- Show submitting, success, unsupported, and error states.
- Clear input after a successful response.
- Reload workflow details after a successful response so the new task appears in the task list.

Update frontend types and workflow detail mapping to expose useful assignment metadata:

- `assignedDoctorId`
- `assignedDoctorName`
- `confidence`

Extract these fields from `doctor_assignment` and `doctor_reassignment` task outputs.

## Testing

Add or update tests for:

- Workflow action parsing and validation.
- Unsupported actions are persisted with status `unsupported`.
- Doctor reassignment appends after the current max task sequence.
- Doctor reassignment creates both `doctor_reassignment` and `Assignment` records.
- The LLM cannot select a doctor outside the provided candidate list.
- Workflow detail mapping includes assignment output fields.
- Frontend build/typecheck succeeds.

Run:

```sh
npm test
npm run build
```
