# LLM Request Pipeline Challenge

LLM Request Pipeline Challenge is a TypeScript application that evaluates incoming clinical requests, creates workflow tasks, and assigns work to clinical team members based on specialty, skills, availability, and current workload.

The app provides a React frontend for submitting requests and reviewing workflows, an Express backend API for orchestration, and a PostgreSQL database managed by Prisma. OpenAI-backed inference can be enabled for request routing, workflow action selection, skills ranking, doctor ranking, and assignment summaries.

## Demo Video Link
https://youtu.be/Zkh8x7maMNw

### Video Errata
I did not walk through generating the Prisma client in the video. Be sure to run `npm run db:generate` first before the migration.

## What It Includes

- A Vite + React frontend on port `5173`
- A Node HTTP backend on port `3000`
- A PostgreSQL database managed with Prisma
- Seed data for clinical team members, skills, requests, workflows, and assignments
- Vitest coverage for routing, ranking, workflow, and team services

## Requirements

- Node.js 22+
- npm
- PostgreSQL, or Docker for the bundled Postgres service

## Environment

Create a local `.env` file from the example:

```sh
cp .env.example .env
```

Update `DATABASE_URL` if your local Postgres connection differs. `OPENAI_API_KEY` is required for the app to properly route requests, rank doctors, create workflow actions, and generate assignment summaries.

## Local Setup

Install dependencies:

```sh
npm install
```

Generate the Prisma client:

```sh
npm run db:generate
```

Run migrations:

```sh
npm run db:migrate
```

Seed sample data:

```sh
npm run db:seed
```

Start the backend and frontend dev servers:

```sh
npm run dev
```

Open http://localhost:5173.

## Build

Install dependencies first:

```sh
npm install
```

Generate the Prisma client before building or running code that imports Prisma types:

```sh
npm run db:generate
```

Build the project:

```sh
npm run build
```

This runs TypeScript type checking with `tsc` and builds the frontend with Vite into `dist/`.

Preview the production frontend build:

```sh
npm run preview
```

The backend is run directly from TypeScript in development with `tsx`; there is no separate production backend bundle in the current scripts.

## Docker

Build and start the app with Postgres using Docker Compose:

```sh
docker compose up --build
```

The Docker Compose plugin is required to run this command.

The compose file starts Postgres with this app database URL:

```sh
postgresql://postgres:postgres@postgres:5432/llm_request_pipeline?schema=public
```

The Docker build copies the local `.env` file into the app image when `.env` exists in the project root, so Docker runs can use the same local environment values.

## Scripts

- `npm run dev` starts the backend and Vite frontend together
- `npm run dev:backend` starts only the backend on `PORT` or `3000`
- `npm run dev:frontend` starts only Vite on port `5173`
- `npm run build` type-checks and builds the frontend
- `npm run preview` serves the built frontend
- `npm run test` runs the Vitest test suite
- `npm run db:generate` generates the Prisma client
- `npm run db:migrate` applies development migrations
- `npm run db:seed` seeds sample data
- `npm run db:reset` resets, migrates, and seeds the database
- `npm run route -- "request text"` routes a request from the CLI

## API Endpoints

- `GET /api/clinical-team` returns the clinical team as `teamMembers`
- `POST /api/requests` creates and routes a request
- `GET /api/workflows` lists workflows
- `GET /api/workflows/:id` returns workflow details
- `POST /api/workflows/:id/actions` creates the next workflow action

During development, Vite proxies `/api` requests to the backend at `http://localhost:3000`.

## Design

The application is organized around a small request pipeline with clear boundaries between presentation, orchestration, inference, and persistence:

- The React frontend submits raw clinical requests and displays clinical team, workflow, and assignment state through the Express API.
- Express controllers validate HTTP input, call service-layer workflow operations, and return JSON responses.
- Workflow services own business decisions such as request routing, human-review fallback, skill ranking, candidate selection, doctor ranking, and assignment completion.
- Inference modules isolate OpenAI calls behind typed clients so routing, skill ranking, doctor ranking, workflow action selection, and assignment summaries can be tested independently.
- Database query modules keep Prisma persistence focused on creating and retrieving records, while workflow ordering and conditional behavior stay in the service layer.
- Prisma models store requests, workflows, workflow tasks, clinical team members, skills, and assignments so every generated decision has an auditable task record.

Workflow tasks are the audit trail for the pipeline. Each task belongs to one workflow, optionally points back to the originating request, and has a unique `sequence` within that workflow. The service layer appends tasks in order and records the task `input`, generated `output`, `status`, and human-readable `reason`. This makes the workflow explainable without forcing query modules to understand business ordering.

The common doctor-assignment task sequence is:

- `routing_decision`, sequence `1`, stores the raw request as input and the route selected by the routing client as output.
- `skills_ranking`, sequence `2`, stores the raw request, routing decision, and available canonical skills as input, then stores the ranked skills as output.
- `doctor_ranking`, sequence `3`, stores the ranked skills and candidate clinical team members as input, then stores the selected doctor, ranking confidence, ranked candidates, or unassignable reason as output.
- `doctor_assignment`, sequence `4`, stores the selected ranking task and doctor as input, then stores the final assignment result as output. A completed assignment also creates an `Assignment` record linked to this task.

Example completed assignment task chain:

```json
[
  {
    "sequence": 1,
    "taskType": "routing_decision",
    "status": "completed",
    "input": { "rawRequest": "Assign a cardiologist for a heart failure follow-up." },
    "output": { "route": "doctor_assignment", "reason": "The request asks for a clinician assignment." }
  },
  {
    "sequence": 2,
    "taskType": "skills_ranking",
    "status": "completed",
    "input": { "rawRequest": "Assign a cardiologist for a heart failure follow-up." },
    "output": { "rankedSkills": [{ "skillCode": "cardiology", "confidence": 0.94 }] }
  },
  {
    "sequence": 3,
    "taskType": "doctor_ranking",
    "status": "completed",
    "input": { "rankedSkills": [{ "skillCode": "cardiology" }], "candidateDoctors": [{ "id": 7, "name": "Dr. Rivera" }] },
    "output": { "selectedDoctorId": 7, "confidence": 0.91, "assignmentReason": "Best specialty and availability match." }
  },
  {
    "sequence": 4,
    "taskType": "doctor_assignment",
    "status": "completed",
    "input": { "doctorRankingTaskId": 103, "selectedDoctorId": 7 },
    "output": { "assignedDoctorId": 7, "assignedDoctorName": "Dr. Rivera", "rankingConfidence": 0.91 }
  }
]
```

Human review is represented as another task instead of an out-of-band flag. For example, if routing cannot identify a supported route, the initial `routing_decision` task is still completed, then an `unknown_human_review` task is created at sequence `2` with `status: "required"`. Its input identifies the failed task and failure context, and its output keeps the route and reason that should be shown to an operator.

Unassignable workflows use the same task shape. If no canonical skills or no active available doctors match, the service writes `doctor_ranking` and `doctor_assignment` tasks with `status: "unassignable"`, null assignment fields, and an `unassignableReason`. That preserves the decision path while making it clear no assignment record should be created.

Workflow follow-up actions also append tasks after the current last sequence. A message such as "Reassign this to Dr. Chen" creates a `workflow_action` task containing the user message and parsed action. If the reassignment is supported and a valid doctor is found, the service appends a `doctor_reassignment` task with the previous assignment, candidate doctors, and final assigned doctor, then creates a new `Assignment` linked to the reassignment task. Unsupported or ambiguous follow-up actions are stored as `workflow_action` tasks with `status: "unsupported"` or `status: "needs_review"` so the conversation history remains auditable.
