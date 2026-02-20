---
name: backend-api
description: Elysia backend route and auth patterns for this monorepo. Use when adding or changing API controllers/services, auth-protected endpoints, validation, and backend error-handling behavior.
---

# Backend API

Use this skill when implementing backend endpoints in `packages/server`.

## What To Load

- Core backend architecture, routing, validation, and error handling: `references/backend-patterns.md`
- better-auth config and frontend auth call patterns: `references/auth-patterns.md`

## Workflow

1. Read `references/backend-patterns.md` to follow controller/service split and route macros.
2. Apply auth requirements with `authMacro`, route options, and role checks.
3. Use validation schemas from `@repo/db/types`.
4. Confirm auth behavior against `references/auth-patterns.md` when touching signin/session flows.
