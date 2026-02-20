# Database Patterns (Drizzle)

## Schema Organization

Schemas are split by domain in `packages/db/src/schemas/`:

- `auth.ts` — User, Session, Account tables (handled by better-auth, DO NOT EDIT)
- `todos.ts` — Todo-related models
- `schema-utils.ts` — Shared utilities (`id`, `timestamps`)

## Model Conventions

```typescript
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const todos = pgTable('todos', {
	id, // UUIDv7 primary key (from schema-utils)

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	content: text().notNull(),
	status: todoStatus().notNull(),

	...timestamps, // createdAt, updatedAt (from schema-utils)
})
```

## Key Points

- Use `id` helper from `schema-utils.ts` for UUIDv7 primary keys
- Use `timestamps` helper from `schema-utils.ts` for createdAt/updatedAt
- Column names use snake_case in database (via `casing: 'snake_case'` in drizzle config)
- Table names are snake_case plural
- Use `pgSchema()` for schema names (e.g., `authSchema.table()`)
- Add indexes in table definition's second parameter
- Types are exported from `@repo/db/types` (inferred from schemas)
- Validation schemas (Zod) are exported from `@repo/db/types` (generated via drizzle-zod)
