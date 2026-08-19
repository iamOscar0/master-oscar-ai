# Foundation Roadmap

## Phase 0 — UX / Product Contract

Approved direction:

- dark developer-console aesthetic
- AI Command Center as the primary interaction
- dashboard as operational control plane
- build/code studio
- database management
- deployment pipeline
- monitoring/evals
- responsive/mobile surfaces

## Phase 1 — Core Platform Kernel

Implement:

- authentication + organizations
- project/workspace model
- project filesystem abstraction
- agent run model
- tool registry
- permission system
- audit events
- environment/secrets model

## Phase 2 — Build Engine

Agent loop:

```text
Request
  -> Context Assembly
  -> Planning
  -> Approval / Policy Check
  -> Tool Selection
  -> Sandboxed Execution
  -> Tests / Evals
  -> Patch
  -> Review
  -> Commit
```

## Phase 3 — Deployment Engine

Provider-neutral interface:

```text
DeploymentProvider
  -> Preview
  -> Build
  -> Deploy
  -> Health Check
  -> Rollback
```

Adapters can then target:

- Vercel
- Cloudflare
- Kubernetes
- AWS
- other providers

## Phase 4 — AI Engineering

Add:

- model router
- prompt/version registry
- RAG
- vector store
- memory
- MCP/tool server registry
- planner/worker/reviewer agents
- graph execution
- human approval gates

## Phase 5 — Production Control Plane

Add:

- billing/quotas
- observability
- traces
- evals
- incident management
- organization RBAC
- secrets management
- immutable audit trail

## Core rule

Master Oscar AI should be the **control plane**, not a giant monolith.

Every major capability gets a stable interface and provider adapter so infrastructure can change without rewriting the product.
