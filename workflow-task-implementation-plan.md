# Workflow And Task Implementation Plan

## Goal

Add a durable workflow model that can evolve over time. A workflow can have many ordered tasks, and multiple separate requests can create or modify the workflow by adding more tasks later.

The first task in a new workflow is always the routing decision. After routing completes, create a workflow row and link the routing decision task to it.

## Design Decisions

- `Workflow` is the long-lived process container.
- `Workflow` should not store the raw request text.
- `Workflow` should not store `route` initially, because route is the output of the routing decision task.
- `WorkflowRequest` stores each inbound request that creates or modifies a workflow.
- `WorkflowTask` stores ordered work units attached to a workflow.
- `WorkflowTask.requestId` should be optional so automated/internal tasks can be added without pretending they were directly caused by a new user request.
- `WorkflowTask.taskType` should be a string initially so new task types can be added without database migrations.

## Proposed Data Model

```prisma
model Workflow {
  id        String            @id @default(cuid())
  status    String            @default("active")

  requests  WorkflowRequest[]
  tasks     WorkflowTask[]

  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  @@index([status])
}

model WorkflowRequest {
  id         String          @id @default(cuid())
  workflowId String?
  rawRequest String
  source     String          @default("user")

  workflow   Workflow?       @relation(fields: [workflowId], references: [id], onDelete: SetNull)
  tasks      WorkflowTask[]

  createdAt  DateTime        @default(now())

  @@index([workflowId])
}

model WorkflowTask {
  id         String           @id @default(cuid())
  workflowId String
  requestId  String?
  taskType   String
  sequence   Int
  status     String           @default("completed")
  input      Json?
  output     Json?
  reason     String?

  workflow   Workflow         @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  request    WorkflowRequest? @relation(fields: [requestId], references: [id], onDelete: SetNull)

  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@unique([workflowId, sequence])
  @@index([workflowId])
  @@index([requestId])
  @@index([taskType])
}
```

## Initial Workflow Creation Flow

1. Receive a raw request.
2. Create a `WorkflowRequest` row with the raw request.
3. Run the existing routing decision inference.
4. Create a `Workflow` row.
5. Link the `WorkflowRequest` to the new workflow.
6. Create the first `WorkflowTask` row:

```txt
workflowId: new workflow id
requestId: initial workflow request id
sequence: 1
status: completed
input: { rawRequest }
output: routing decision JSON
reason: routingDecision.reason
```

This should happen in a transaction once the routing decision has been produced.

## Example Workflow

```txt
Workflow 1

Requests:
1. Initial user request

Tasks:
1. routing_decision
2. doctor_analysis
3. doctor_assignment
4. scheduling
```

## Follow-Up Request Flow

If another request modifies an existing workflow:

1. Create a new `WorkflowRequest` linked to the existing workflow.
2. Determine which tasks need to be added.
3. Append new `WorkflowTask` rows using the next sequence numbers.
4. Link tasks to the request when the task was directly caused by that request.

Example:

```txt
Workflow 1

Requests:
1. Initial user request
2. Follow-up scheduling change

Tasks:
1. routing_decision
2. doctor_analysis
3. doctor_assignment
4. scheduling
5. rescheduling
```

## Implementation Steps

1. Update `prisma/schema.prisma` with `Workflow`, `WorkflowRequest`, and `WorkflowTask`.
2. Add a Prisma migration for the new tables, indexes, and foreign keys.
3. Regenerate the Prisma client.
4. Add a workflow service that creates the initial workflow and routing task after routing completes.
5. Update `src/scripts/route-request.ts` to persist the workflow and print the workflow/task IDs with the routing decision.
6. Add tests for initial workflow creation with a mocked Prisma-like client.
7. Run `npm test` and `npm run build`.

## Future Considerations

- Add a denormalized `currentRoute` field to `Workflow` only if fast route filtering becomes necessary.
- Promote `status` and `taskType` strings to enums only after the workflow vocabulary stabilizes.
- Add optimistic locking or transaction-level sequence assignment if multiple requests can append tasks to the same workflow concurrently.
