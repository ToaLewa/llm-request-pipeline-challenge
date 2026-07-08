# LLM Request Pipeline Challenge

LLM Request Pipeline Challenge is a TypeScript application that evaluates incoming clinical requests, creates workflow tasks, and assigns work to clinical team members based on specialty, skills, availability, and current workload.

The app provides a React frontend for submitting requests and reviewing workflows, an Express backend API for orchestration, and a PostgreSQL database managed by Prisma. OpenAI-backed inference can be enabled for request routing, workflow action selection, skills ranking, doctor ranking, and assignment summaries.

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

Update `DATABASE_URL` if your local Postgres connection differs. Add `OPENAI_API_KEY` when using features that call OpenAI.

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

The compose file starts Postgres with this app database URL:

```sh
postgresql://postgres:postgres@postgres:5432/llm_request_pipeline?schema=public
```

If you need OpenAI-backed inference inside Docker, pass `OPENAI_API_KEY` and optionally `OPENAI_MODEL` into the app service environment.

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
