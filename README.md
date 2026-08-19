# Master Oscar AI — Foundation

An initial monorepo foundation for an AI-native application engineering platform that can:

- understand user requests
- generate and modify application code
- orchestrate tools/agents
- manage projects and environments
- persist project metadata
- prepare deployments
- expose observability hooks

## Stack

- **Web:** Next.js + React + TypeScript
- **API:** Fastify + TypeScript
- **Database:** PostgreSQL + Prisma
- **Cache/queue foundation:** Redis
- **Local infrastructure:** Docker Compose
- **Monorepo:** pnpm workspaces

## Architecture

```text
User
  |
  v
Next.js Web App
  |
  v
Fastify API
  |
  +---- Project Service
  +---- AI Orchestrator (provider-agnostic foundation)
  +---- Deployment Service (adapter boundary)
  +---- Observability Service
  |
  +---- PostgreSQL
  |
  +---- Redis
  |
  +---- Future:
        |- Git provider adapters
        |- Cloud/deployment adapters
        |- LLM providers
        |- MCP/tool servers
        |- sandboxed code execution
```

## First milestone

This repository deliberately starts with the **platform foundation**, not an autonomous production deployment engine.

The first working slice gives us:

1. Dashboard UI matching the approved wireframe direction.
2. AI Command Center UI.
3. Project creation/listing API.
4. PostgreSQL persistence.
5. Redis connectivity.
6. Provider-agnostic AI orchestration boundary.
7. Deployment abstraction boundary.
8. Dockerized local infrastructure.
9. Enterprise access-control foundation: first-owner bootstrap, password hashing, expiring sessions, and Owner/Admin/Builder/Viewer roles.

## Create the first admin login

Start the database and API, run the Prisma migration, then open the web app. The first screen lets you create the one-time **Owner** account using your name, work email, and a password of at least 12 characters. The Owner can access the Admin screen for members, role policy, and the Enterprise $100/month plan surface.

The initial bootstrap endpoint refuses additional Owner creation after the first account. Before public launch, connect a payment provider (for example Stripe) from the Admin billing action and place the API behind HTTPS with an allowlisted `CORS_ORIGIN`.

## Run locally

Requirements:

- Node.js 20+
- pnpm 9+
- Docker Desktop / Docker Engine

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Then open:

- Web: http://localhost:3000
- API: http://localhost:4000
- API health: http://localhost:4000/health

## Security direction

Never execute AI-generated code directly on the API host.

The production architecture should isolate code execution in short-lived sandbox workers with:

- CPU/memory/time limits
- filesystem isolation
- network policy
- per-run credentials
- audit logging
- approval gates for destructive operations

That execution layer is intentionally an adapter boundary in this foundation.
