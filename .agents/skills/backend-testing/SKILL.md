---
name: backend-testing
description: Backend test patterns for Bun Test and Eden treaty clients in this monorepo. Use when writing or updating API endpoint tests, auth/role tests, and CRUD coverage in packages/server/tests.
---

# Backend Testing

Use this skill for endpoint tests in `packages/server/tests`.

## What To Load

- Test framework, utilities, structure, and patterns: `references/backend-testing-patterns.md`

## Workflow

1. Use Bun Test APIs and test utilities from `tests/utils`.
2. Structure suites by feature and keep cases concise.
3. Cover unauthenticated, authenticated, role-based, and CRUD behaviors as applicable.
4. Isolate state with setup hooks and fresh test users.
