# Engineering Challenge
## Key Requirements

1. **LLM integration** — Use OpenAI (must be something that we can add our own API key to and use).
2. **Real-time interactivity** — The LLM's response and actions must reflect on
   the UI. _(Exception: if you build API-only with no UI, satisfy this with an
   inspectable event/state endpoint instead.)_
3. **Dynamic rendering** — Do something with the result beyond static text (e.g.
   chart, map, diagram, event timeline).
4. **Clarity** — Write modular, understandable code and include a clear README.
5. **Deployability** — Must run locally via `docker-compose up` and optionally
   be hosted via a public URL.
6. **BONUS** — Support follow-up queries that build on prior ones, not just
   independent prompts. Maintain an explicit representation of state that
   evolves as the user refines their request, and let the UI (or API response)
   reflect it rather than only generating one-off outputs.

## Project Details
### Event-Routed Request Pipeline

An incoming request — a lab order, or a case that needs to be worked — arrives
and needs to be understood, routed, and possibly assigned to a person based on
what it is. Build a single deployable where that request moves through
independent stages that coordinate as it goes, using an LLM for the reasoning
steps (turning something unstructured into a decision, or matching a requirement
against candidates). Make the sequence of what happened — and why it landed
where it did — observable, whether through a UI or an inspectable endpoint. The
internal design is yours to decide.

> **Input:** a raw, unlabeled request — e.g. a free-text case description with
> no category, priority, or owner.
>
> **Output:** an ordered timeline showing each stage — classified as _renal
> biopsy_ → assigned to _Dr. Chen_ based on expertise, case type, and PTO status
> (or _unassignable_, with a stated reason).

---

## What to Submit

- A GitHub repo with:
  - Your code (frontend + backend)
  - A `docker-compose.yml` for local deployment
  - A clear README with instructions + design notes
- Give read access to:
  - `jeremyyeatts`
  - `dustin-h-arkana`
  - `Saivivekgorantla`
  - `rrodriguesAL`
- **Bonus:** Provide a publicly accessible hosted version (Vercel, Render,
  Netlify, etc.)
- **Bonus:** Include a brief Loom or demo video walking through the app
  (optional but appreciated).

## Stack Expectations

We're stack-flexible. Use what you're best at.

That said, bonus points if you use:

- Vue 3 with shadcn
- Node.js backend (TypeScript, Fastify, oRPC)
- PostgreSQL (Prisma)
- WebSockets or SSE (if applicable)
- Docker Compose for infra setup
