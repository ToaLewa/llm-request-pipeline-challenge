# Stage 1 Plan: LLM Routing and Doctor Assignment

## Goal

Build an event-routed request pipeline where a raw, unstructured request string is interpreted by an LLM, routed to the correct workflow, and, when appropriate, assigned to the best available doctor.

The first complete workflow will be doctor assignment. Other workflows can be classified but left as placeholders until later.

## Core Idea

Use two separate LLM-assisted stages:

1. Route/classify the incoming request.
2. Rank candidate doctors selected by the backend.

The backend remains responsible for database access, validation, persistence, and ticket creation. The LLM recommends and explains decisions, but it does not directly mutate application state.

```txt
Raw request string
  -> LLM route/classify request
  -> If doctor-work case: backend loads candidate doctors
  -> LLM ranks candidates
  -> Backend validates result
  -> Backend creates assignment ticket
```

## Stage 1: Request Routing

The first LLM call receives only the raw request string. It decides what kind of workflow the request belongs to.

Example input:

```txt
Patient has worsening creatinine and possible lupus nephritis. Need review of renal biopsy.
```

Expected structured output:

```json
{
  "route": "doctor_assignment",
  "confidence": 0.94,
  "reason": "The request describes a clinical case requiring specialist review.",
  "caseSummary": "Possible lupus nephritis with renal biopsy review needed.",
  "caseType": "renal biopsy",
  "priority": "normal",
  "requiredSpecialties": ["renal pathology", "nephropathology"],
  "requiredSkills": ["lupus nephritis", "renal biopsy"],
  "patientContext": {
    "condition": "worsening creatinine",
    "suspectedDiagnosis": "lupus nephritis"
  }
}
```

Potential route values:

```ts
type RequestRoute =
  | "doctor_assignment"
  | "billing"
  | "records_request"
  | "scheduling"
  | "unknown";
```

For the first implementation, `doctor_assignment` should be fully handled. Other routes can produce timeline events explaining that no automated handler exists yet.

Example non-doctor result:

```json
{
  "route": "records_request",
  "confidence": 0.88,
  "reason": "The request is administrative and does not require doctor assignment.",
  "caseSummary": "Request is about missing paperwork.",
  "caseType": null,
  "priority": "normal",
  "requiredSpecialties": [],
  "requiredSkills": []
}
```

## Stage 2: Candidate Doctor Retrieval

After the LLM routes a request to `doctor_assignment`, the backend queries Postgres for candidate doctors.

The LLM should not receive every doctor unless the dataset is very small. The backend should narrow candidates using structured fields from the routing stage.

Candidate search priorities:

1. Exact specialty or case type match.
2. Skill overlap match.
3. Same broad department or general category.
4. Available generalist fallback.
5. Mark unassignable if no reasonable candidate exists.

Example Prisma-style query:

```ts
const candidates = await prisma.doctor.findMany({
  where: {
    active: true,
    ptoStatus: false,
    OR: [
      { specialties: { hasSome: routing.requiredSpecialties } },
      { skills: { hasSome: routing.requiredSkills } },
      { caseTypes: { has: routing.caseType } }
    ]
  },
  orderBy: [{ currentLoad: "asc" }],
  take: 8
});
```

Useful timeline output from this stage:

```txt
Searched for renal pathology + renal biopsy.
Found 3 available candidates.
Excluded 1 doctor due to PTO.
```

## Stage 3: LLM Doctor Ranking

The second LLM call receives:

- The raw request string.
- The structured routing output.
- Candidate doctors returned by the backend.
- Assignment rules.

Example ranking input:

```json
{
  "rawRequest": "Patient has worsening creatinine and possible lupus nephritis. Need review of renal biopsy.",
  "routing": {
    "caseType": "renal biopsy",
    "priority": "normal",
    "requiredSpecialties": ["renal pathology", "nephropathology"],
    "requiredSkills": ["lupus nephritis", "renal biopsy"]
  },
  "assignmentRules": [
    "Prefer exact specialty match.",
    "Prefer doctors with relevant case experience.",
    "Do not assign doctors on PTO.",
    "Prefer lower current workload when expertise is similar.",
    "Return unassignable if no candidate is clinically appropriate."
  ],
  "candidateDoctors": [
    {
      "id": "doc_chen",
      "name": "Dr. Emily Chen",
      "specialties": ["renal pathology", "nephropathology"],
      "skills": ["renal biopsy", "lupus nephritis", "glomerulonephritis"],
      "description": "Renal pathologist focused on autoimmune kidney disease and complex biopsy interpretation.",
      "ptoStatus": false,
      "currentLoad": 4
    },
    {
      "id": "doc_patel",
      "name": "Dr. Ravi Patel",
      "specialties": ["general surgical pathology"],
      "skills": ["biopsy review", "GI pathology"],
      "description": "General pathologist with broad biopsy review experience.",
      "ptoStatus": false,
      "currentLoad": 1
    }
  ]
}
```

Expected ranking output:

```json
{
  "selectedDoctorId": "doc_chen",
  "confidence": 0.93,
  "assignmentReason": "Dr. Chen is the strongest match because she specializes in renal pathology, renal biopsy interpretation, and lupus nephritis. Although Dr. Patel has lower workload, his expertise is less specific.",
  "rankedCandidates": [
    {
      "doctorId": "doc_chen",
      "score": 93,
      "reason": "Exact match for renal pathology, lupus nephritis, and renal biopsy."
    },
    {
      "doctorId": "doc_patel",
      "score": 48,
      "reason": "Available and has biopsy experience, but lacks renal-specific expertise."
    }
  ],
  "unassignable": false,
  "unassignableReason": null
}
```

## Backend Validation

Before creating a ticket, the backend must validate the LLM ranking result.

Validation rules:

- The selected doctor ID exists.
- The selected doctor was present in the candidate list.
- The doctor is active.
- The doctor is not on PTO.
- The request was routed to `doctor_assignment`.
- Confidence is above the chosen threshold.

If validation succeeds, create a ticket and mark the request as assigned.

If validation fails, mark the request as `needs_review` or `unassignable` and do not create an automatic assignment.

## Data Model Draft

Doctor:

```ts
{
  id: string;
  name: string;
  specialties: string[];
  skills: string[];
  caseTypes: string[];
  description: string;
  ptoStatus: boolean;
  currentLoad: number;
  active: boolean;
}
```

Request:

```ts
{
  id: string;
  rawInput: string;
  route: string;
  structuredState: Json;
  status: "received" | "routing" | "ranking" | "assigned" | "unassignable" | "needs_review";
}
```

Ticket:

```ts
{
  id: string;
  requestId: string;
  doctorId: string;
  status: "open" | "assigned";
  priority: string;
  assignmentReason: string;
}
```

Pipeline event:

```ts
{
  id: string;
  requestId: string;
  type: string;
  title: string;
  payload: Json;
  createdAt: Date;
}
```

## Event Timeline

Each pipeline stage should emit events so the UI can show real-time progress.

Recommended event types:

```txt
request.received
llm.routing.started
llm.routing.completed
doctor.search.started
doctor.search.completed
llm.ranking.started
llm.ranking.completed
ticket.created
request.completed
request.unassignable
request.routed_to_unhandled_workflow
```

Example UI timeline:

```txt
1. Request received
   Raw text captured.

2. LLM classified request
   Route: doctor_assignment
   Case type: renal biopsy
   Priority: normal

3. Candidate search completed
   Found 3 doctors
   Excluded 1 doctor due to PTO

4. LLM ranked candidates
   Dr. Chen: 93
   Dr. Patel: 48
   Dr. Gomez: 41

5. Ticket created
   Assigned to Dr. Chen
   Reason: renal biopsy + lupus nephritis expertise
```

## Prompt Drafts

Routing prompt:

```txt
You are routing incoming operational requests.
Classify the request into one route.
If it describes a clinical case, lab order, biopsy, diagnosis, patient condition, or specialist review need, route to doctor_assignment.

Return only valid JSON matching the schema.
Do not invent facts that are not present.
Use null or empty arrays when unknown.
```

Ranking prompt:

```txt
You are assigning a clinical work item to the best available doctor.
You will receive a raw request, extracted routing fields, and candidate doctors from the database.

Rank only the provided candidates.
Never select a doctor who is not in the candidate list.
Prefer specialty and skill match over low workload.
Use workload as a tie-breaker.
Return unassignable if no candidate is appropriate.
Return only valid JSON matching the schema.
```

## API Shape Draft

```txt
POST /api/requests
  Creates a request and starts the pipeline.

GET /api/requests/:id/events
  Streams pipeline events with SSE.

GET /api/requests/:id
  Returns current request state, ticket, and ranked candidates.

POST /api/requests/:id/follow-up
  Updates request state and reruns routing/ranking.
```

## Backend Pipeline Draft

```txt
receiveRequest(rawInput)
classifyRouteWithLlm(rawInput)

if route !== doctor_assignment:
  mark routed_to_unhandled_workflow
  stop

findCandidateDoctors(structuredRoute)
rankDoctorsWithLlm(rawInput, structuredRoute, candidates)
validateRanking(ranking, candidates)
createTicket(...)
emit every event
```

## Follow-Up Query Design

Maintain an explicit mutable state object on the request.

Initial state example:

```json
{
  "caseType": "renal biopsy",
  "priority": "routine",
  "requiredSkills": ["renal pathology"],
  "excludedDoctorIds": [],
  "preferredDoctorIds": []
}
```

Follow-up example:

```txt
Actually this is urgent and Dr. Chen is out.
```

State update:

```json
{
  "priority": "urgent",
  "excludedDoctorIds": ["doc_chen"]
}
```

After a follow-up, rerun candidate search and doctor ranking using the updated state.

## Implementation Recommendation

Implement the `doctor_assignment` workflow completely first.

For other route types, only classify and display that the request was routed to an unhandled workflow. This keeps the project focused while still demonstrating that routing exists.

## Design Rule

The LLM recommends and explains. The backend queries, validates, persists, and creates tickets.
