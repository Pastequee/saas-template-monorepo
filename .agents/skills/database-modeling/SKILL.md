---
name: database-modeling
description: Drizzle schema modeling conventions for this monorepo. Use when creating or modifying tables, relations, schema utilities, and generated type/validation usage.
---

# Database Modeling

Use this skill when editing `packages/db` schemas or DB-related type/validation contracts.

## What To Load

- Drizzle schema and naming conventions: `references/database-patterns.md`

## Workflow

1. Follow domain schema organization under `packages/db/src/schemas/`.
2. Use shared `id` and `timestamps` helpers.
3. Keep naming aligned with snake_case and plural table rules.
4. Consume generated types and zod schemas from `@repo/db/types`.
