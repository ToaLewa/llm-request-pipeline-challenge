# Doctor Assignment Ranking Implementation Plan

## Goal

When routing determines that a request needs doctor assignment, append a structured backend workflow that ranks relevant skills, ranks candidate doctors, and records the final doctor assignment decision.

The workflow task sequence should be:

```txt
1. routing_decision
2. skills_ranking
3. doctor_ranking
4. doctor_assignment
```

The LLM recommends ranked skills and ranked doctors. The backend owns database reads, validation, workflow task persistence, and the final assignment decision.

## Current Codebase Context

- `Workflow`, `WorkflowRequest`, and `WorkflowTask` already exist in Prisma.
- Workflow events are represented as durable `WorkflowTask` rows.
- Routing is implemented in `src/backend/inference/routing.ts`.
- Initial workflow creation is implemented in `src/backend/workflows/workflow.service.ts`.
- Doctor and skill data is normalized through `Doctor`, `Skill`, and `DoctorSkill`.
- Existing candidate search in `src/backend/doctors/candidates.ts` derives skill codes from the routing decision, but this implementation should instead search doctors from LLM-ranked canonical DB skills.
- There is no ticket or assignment table yet, so the first implementation should persist the selected doctor in the `doctor_assignment` workflow task output.

## Updated Backend Flow

```txt
receive request
  -> create routing_decision
  -> create initial workflow and routing task
  -> if route is not doctor_assignment, stop
  -> load canonical skills from DB
  -> LLM ranks relevant DB skills
  -> insert skills_ranking task
  -> backend searches candidate doctors by ranked skill codes
  -> LLM ranks candidate doctors
  -> insert doctor_ranking task
  -> backend validates doctor ranking
  -> insert doctor_assignment task
  -> update workflow status
```

## Task 1: `skills_ranking`

Directly after `routing_decision` outputs `route: "doctor_assignment"`, the backend should load the canonical skills list from the database and ask the LLM to rank the most relevant skills.

Do not search doctors directly from `routingDecision.requiredSkills` or `routingDecision.requiredSpecialties`. Those fields are useful context, but the doctor search should be driven by canonical DB skills selected from the actual `Skill` table.

### Skill Loading

Add a small service or helper to load skills from Prisma:

```ts
type AvailableSkill = {
  id: number;
  name: string;
  skillCode: string;
  category: 'specialty' | 'clinical_skill' | 'case_type';
};
```

Suggested location:

```txt
src/backend/skills/skills.service.ts
```

The query should return all canonical skills ordered deterministically, for example by `category` and `name`.

### Skill Ranking Inference

Create:

```txt
src/backend/inference/skills-ranking.ts
```

Input:

```ts
type SkillsRankingInput = {
  rawRequest: string;
  routingDecision: RoutingDecision;
  availableSkills: AvailableSkill[];
};
```

Expected output:

```ts
type SkillsRanking = {
  rankedSkills: Array<{
    skillId: number;
    skillCode: string;
    score: number;
    reason: string;
  }>;
  confidence: number;
  reason: string;
};
```

Rules for the LLM:

- Rank only skills from the provided `availableSkills` list.
- Never invent skill IDs, skill codes, specialties, case types, or clinical skills.
- Prefer clinically specific matches over broad matches.
- Include a mix of relevant specialty, case type, and clinical skill records when applicable.
- Return an empty ranked list if no canonical skill is relevant.
- Return only valid JSON matching the schema.

Persist as a workflow task:

```ts
{
  taskType: 'skills_ranking',
  sequence: 2,
  status: 'completed' | 'needs_review',
  input: {
    rawRequest,
    routingDecision,
    availableSkills
  },
  output: {
    rankedSkills,
    confidence,
    reason
  },
  reason
}
```

### Skill Ranking Validation

Before accepting the result:

- Every `skillId` must exist in `availableSkills`.
- Every `skillCode` must match the skill with that `skillId`.
- Scores must be finite numbers in the expected range.
- Confidence must be finite and between `0` and `1`.
- Duplicate skills should be rejected or deduplicated deterministically by the backend.

If validation fails, persist `skills_ranking` with `status: 'needs_review'` and stop automatic assignment.

## Task 2: `doctor_ranking`

After `skills_ranking` completes, the backend should search for candidate doctors using the ranked canonical skill codes.

### Candidate Search

Update `src/backend/doctors/candidates.ts` to add a skill-code-driven search function:

```ts
findCandidateDoctorsBySkillCodes(skillCodes: string[], options?)
```

This should reuse the existing normalized doctor-skill query behavior:

- Only active doctors.
- Exclude doctors on PTO.
- Match doctors with at least one ranked skill code.
- Sort by strongest skill overlap first.
- Use lower `currentLoad` as a tie-breaker.
- Limit to a small candidate set, likely `8`.

The existing `findCandidateDoctors(routingDecision)` can remain for compatibility, but the new doctor-assignment workflow should call `findCandidateDoctorsBySkillCodes`.

### Doctor Ranking Inference

Create:

```txt
src/backend/inference/doctor-ranking.ts
```

Input:

```ts
type DoctorRankingInput = {
  rawRequest: string;
  routingDecision: RoutingDecision;
  rankedSkills: RankedSkill[];
  candidateDoctors: CandidateDoctorPayload[];
};
```

Expected output:

```ts
type DoctorRanking = {
  selectedDoctorId: number | null;
  confidence: number;
  assignmentReason: string;
  rankedCandidates: Array<{
    doctorId: number;
    score: number;
    reason: string;
  }>;
  unassignable: boolean;
  unassignableReason: string | null;
};
```

Rules for the LLM:

- Rank only the provided candidate doctors.
- Never select or rank a doctor outside the candidate list.
- Prefer specialty and clinical fit over low workload.
- Use workload as a tie-breaker when expertise is similar.
- Return `unassignable: true` when no candidate is clinically appropriate.
- Return only valid JSON matching the schema.

Persist as a workflow task:

```ts
{
  taskType: 'doctor_ranking',
  sequence: 3,
  status: 'completed' | 'unassignable' | 'needs_review',
  input: {
    rawRequest,
    routingDecision,
    rankedSkills,
    candidateDoctors
  },
  output: {
    selectedDoctorId,
    confidence,
    assignmentReason,
    rankedCandidates,
    unassignable,
    unassignableReason
  },
  reason: assignmentReason ?? unassignableReason
}
```

### Doctor Ranking Validation

Before accepting the doctor ranking:

- `selectedDoctorId` must be present when `unassignable` is false.
- `selectedDoctorId` must be null when `unassignable` is true.
- The selected doctor must exist in `candidateDoctors`.
- Every ranked candidate must exist in `candidateDoctors`.
- The selected doctor must not be on PTO.
- The selected doctor must be active. This is already enforced by the query, but the backend can re-check if the payload exposes `active` later.
- Confidence must meet the assignment threshold, for example `>= 0.7`.
- Scores must be finite numbers in the expected range.

If validation fails, persist `doctor_ranking` with `status: 'needs_review'` and continue to create a final `doctor_assignment` task with `status: 'needs_review'`.

If no candidate doctors are found, persist `doctor_ranking` with `status: 'unassignable'` and continue to create a final `doctor_assignment` task with `status: 'unassignable'`.

## Task 3: `doctor_assignment`

The final assignment task is backend-owned. It should record the final validated outcome from `doctor_ranking`.

The LLM does not create this task directly. The backend creates it after validating the doctor ranking result.

Persist as a workflow task:

```ts
{
  taskType: 'doctor_assignment',
  sequence: 4,
  status: 'completed' | 'unassignable' | 'needs_review',
  input: {
    doctorRankingTaskId,
    selectedDoctorId
  },
  output: {
    assignedDoctorId,
    assignedDoctorName,
    assignmentReason,
    rankingConfidence,
    unassignableReason
  },
  reason: assignmentReason ?? unassignableReason
}
```

Update `Workflow.status` based on the final assignment task:

```txt
assigned
unassignable
needs_review
```

## Orchestration Service

Create:

```txt
src/backend/workflows/doctor-assignment.service.ts
```

Primary function:

```ts
processDoctorAssignmentWorkflow(workflowId: number, options?)
```

Responsibilities:

1. Load workflow, initial request, and routing task.
2. Parse and validate the routing task output as `RoutingDecision`.
3. Stop if `route !== 'doctor_assignment'`.
4. Load all canonical skills from DB.
5. Rank skills with the LLM.
6. Validate and insert `skills_ranking`.
7. Search candidate doctors by ranked skill codes.
8. Rank candidate doctors with the LLM.
9. Validate and insert `doctor_ranking`.
10. Insert final backend-owned `doctor_assignment`.
11. Update `Workflow.status`.

The service should use transactions when appending tasks and updating workflow status so task ordering and final status stay consistent.

## Controller Wiring

Update `src/backend/requests/request.controller.ts` after initial workflow creation:

```ts
const routingDecision = await createRoutingDecision(rawRequest, client);
const workflow = await createInitialWorkflow(rawRequest, routingDecision, { source: 'web' });

if (routingDecision.route === 'doctor_assignment') {
  await processDoctorAssignmentWorkflow(workflow.workflowId);
}
```

For the first implementation, keep the processing synchronous. This keeps API behavior simple and makes the workflow detail immediately show all generated tasks after submission.

If latency becomes a problem, this can later move to an async worker or background queue.

## Workflow Summary Updates

`src/backend/workflows/workflow-list.service.ts` currently extracts summary fields from route-shaped task outputs.

Update summary extraction so workflow list/detail pages can display useful text for new task outputs:

- For `skills_ranking`, show `reason` from the skill ranking output.
- For `doctor_ranking`, show `assignmentReason` or `unassignableReason`.
- For `doctor_assignment`, show `assignmentReason` or `unassignableReason`.
- Preserve route, priority, and case summary from nested `routingDecision` when present.

This avoids requiring a large frontend change for the first backend implementation.

## Testing Plan

Add unit tests for skill ranking inference:

- Sends raw request, routing decision, and available DB skills to the client.
- Parses valid skill ranking output.
- Rejects malformed output.
- Rejects invented skill IDs or mismatched skill codes during backend validation.

Add unit tests for doctor candidate search:

- Searches doctors by explicit ranked skill codes.
- Filters inactive doctors and doctors on PTO.
- Sorts by skill overlap before current load.
- Returns an empty list when no ranked skill codes are provided.

Add unit tests for doctor ranking inference:

- Sends raw request, routing decision, ranked skills, and candidate doctors to the client.
- Parses valid doctor ranking output.
- Rejects malformed output.

Add unit tests for doctor assignment orchestration:

- Appends tasks in order: `skills_ranking`, `doctor_ranking`, `doctor_assignment`.
- Stops when route is not `doctor_assignment`.
- Creates `needs_review` when skill ranking references unknown skills.
- Creates `unassignable` when no ranked skills are relevant.
- Creates `unassignable` when no doctors match ranked skills.
- Creates `needs_review` when doctor ranking selects a non-candidate doctor.
- Creates `needs_review` when doctor ranking confidence is below threshold.
- Creates completed `doctor_assignment` and sets workflow status to `assigned` when validation succeeds.

Run:

```sh
npm test
npm run build
```

## Follow-Up Work

- Add a real ticket or assignment table if assignments need to be queried independently from workflow tasks.
- Add async processing if LLM latency makes request submission too slow.
- Add SSE or polling updates if the frontend should show task progress while ranking is running.
- Add follow-up request support that can re-run `skills_ranking`, `doctor_ranking`, and `doctor_assignment` with new user context.
