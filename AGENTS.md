# AGENTS.md - AI Coding Guidelines

This document provides guidelines for AI agents working on this codebase.

## Project Overview

**Stack:**
- **Runtime:** Bun 1.3+ / Node 24+
- **Package Manager:** Bun with workspaces
- **Monorepo Tool:** Turborepo
- **Linting/Formatting:** Biome via Ultracite
- **Database:** PostgreSQL with Drizzle ORM
- **Backend:** Elysia (Bun-native web framework)
- **Frontend:** React + TanStack Router + TanStack Query + TanStack Start
- **Auth:** better-auth
- **Styling:** Tailwind CSS v4 and Shadcn/ui for UI components

---

## Monorepo Structure

```
apps/
  backend/       # Elysia API server (port 3001)
  web/           # TanStack Start frontend (port 3000)

packages/
  auth/          # better-auth configuration (shared)
  db/            # Drizzle ORM client, schemas, generated types
  email/         # Email service (Resend)
  utils/         # Shared utilities

tooling/
  typescript/    # Shared tsconfig bases
```

### Workspace Imports

- Use `@repo/<package>` for cross-package imports (e.g., `@repo/db`, `@repo/auth`)
- Use `#<path>` for internal imports in backend (configured via tsconfig paths)
- Use `~/<path>` for internal imports in frontend

---

## Code Style & Conventions

### Biome Configuration

- **Semicolons:** As needed (no trailing semicolons)
- **Quotes:** Single quotes and JSX double quote
- **Indentation:** Tabs
- **Line width:** 100 characters
- **No console.log:** Use structured logger (`#lib/logger`) instead (backend only)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `todo-item.tsx`, `auth-provider.tsx` |
| Components | PascalCase | `TodoItem`, `AuthProvider` |
| Functions | camelCase | `getUserTodos`, `createTodo` |
| Constants | SCREAMING_SNAKE | `DATABASE_URL`, `API_KEY` |
| DB tables | snake_case (plural) | `todos`, `user_sessions` |
| DB columns | snake_case | `user_id`, `created_at` |

### TypeScript

- Strict mode enabled
- Prefer `type` over `interface` unless necessary
- Use implicit return types for exported functions
- Import types using `type` keyword: `import type { User } from '@repo/db/types'`

---

## Backend Patterns (Elysia)

### Router Structure

Each feature has its own folder with:
- `controller.ts` — Route definitions (thin layer)
- `service.ts` — Business logic and database operations

```typescript
// controller.ts - Routes are thin, delegate to service
export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
  .use(betterAuth)
  .get('/todos', ({ user }) => TodosService.getUserTodos(user.id), {
    auth: true,
  })
```

```typescript
// service.ts - All business logic here
export const TodosService = {
  getUserTodos: async (userId: User['id']) =>
    db.query.todos.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
}
```

### Authentication

- Use `betterAuth` middleware from `#middlewares/auth`
- Set `{ auth: true }` in route options to require authentication
- Set `{ role: 'admin' }` in route options to require authentication and a specific role
- Access user via `{ user }` in route handler

### Validation

- Use Drizzle-Zod generated schemas for body validation
- Import from `@repo/db/types`
- Insert and Update schemas do not include foreign keys like `somethingId` (automatically omitted)

```typescript
import { todoInsertSchema } from '@repo/db/types'

.post('/todos', handler, { body: todoInsertSchema })
```

### Error Handling

- Return status codes using `status()` helper
- Use `status('Not Found')`, `status('Forbidden')`, etc.
- Never EVER throw an error, handle every controlled error except for unexpected errors like DB crash or network crash and so on

---

## Frontend Patterns

### File Organization

```
src/
  components/
    feature/          # Feature-specific components
      component.tsx
    ui/               # Reusable UI primitives
  lib/
    hooks/            # Custom React hooks
    mutations/        # TanStack Query mutations options
    queries/          # TanStack Query queries options
  routes/             # TanStack Start file-based routes
```

### Data Fetching (Eden + TanStack Query)

Use the Eden client with query/mutation option factories:

```typescript
// queries/todos.queries.ts
export const todoListOptions = () =>
  edenQueryOption({
    edenQuery: eden.todos.get,
    queryKey: keys.todos.list(),
  })

// mutations/todos.mutations.ts
export const createTodoOptions = () =>
  edenMutationOption({
    edenMutation: eden.todos.post,
    meta: { invalidate: [keys.todos.list()] },
  })
```

```typescript
// Component usage
const { data, isLoading } = useQuery(todoListOptions())
const mutation = useMutation(createTodoOptions())
```

### Query Keys

Centralize query keys in `lib/queries/keys.ts`:

```typescript
export const keys = {
  todos: {
    list: () => ['todos'] as const,
    detail: (id: string) => ['todos', id] as const,
  },
}
```

### Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use early returns for loading/error states
- Prefer composition over prop drilling

```typescript
export const TodoList = () => {
  const { data: todos, isLoading, isSuccess } = useQuery(todoListOptions())

  if (isLoading) return <Loader />
  if (!isSuccess || todos.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
    </div>
  )
}
```

### Form Guidelines (TanStack Form + Zod)

Use `useAppForm` from `~/lib/hooks/form-hook` (not raw TanStack Form):

```typescript
const formSchema = z.object({
  email: z.string().nonempty('Email is required'),
  password: z.string().min(8),
})

const form = useAppForm({
  defaultValues: { email: '', password: '' },
  validators: { onChange: formSchema, onMount: formSchema, onSubmit: formSchema },
  onSubmit: async ({ value }) => { /* handle submit */ },
})

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
    <form.AppField name="email">
      {(field) => <field.TextField label="Email" type="email" />}
    </form.AppField>

    <form.AppForm>
      <form.SubmitButton label="Submit" />
    </form.AppForm>
  </form>
)
```

**Key patterns:**
- Field components use `useFieldContext()` — see `components/ui/form-fields/text-field.tsx`
- Form components use `useFormContext()` — see `components/ui/form-fields/submit-button.tsx`
- Register new components in `lib/hooks/form-hook.ts` under `fieldComponents` or `formComponents`
- Use `withFieldGroup()` for reusable form sections (see `components/multi-step-demo/`)
- Use `useFormStepper()` hook for multi-step forms with per-step validation

---

## Database Patterns (Drizzle)

### Schema Organization

Schemas are split by domain in `packages/db/src/schemas/`:
- `auth.ts` — User, Session, Account tables (handled by better-auth, DO NOT EDIT)
- `todos.ts` — Todo-related models
- `schema-utils.ts` — Shared utilities (`id`, `timestamps`)

### Model Conventions

```typescript
import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const todos = pgTable('todos', {
  id,  // UUIDv7 primary key (from schema-utils)

  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  content: text().notNull(),
  status: todoStatus().notNull(),

  ...timestamps,  // createdAt, updatedAt (from schema-utils)
})
```

### Key Points

- Use `id` helper from `schema-utils.ts` for UUIDv7 primary keys
- Use `timestamps` helper from `schema-utils.ts` for createdAt/updatedAt
- Column names use snake_case in database (via `casing: 'snake_case'` in drizzle config)
- Table names are snake_case plural
- Use `pgSchema()` for schema names (e.g., `authSchema.table()`)
- Add indexes in table definition's second parameter
- Types are exported from `@repo/db/types` (inferred from schemas)
- Validation schemas (Zod) are exported from `@repo/db/types` (generated via drizzle-zod)

---

## Environment Variables

Use `@t3-oss/env-core` for type-safe environment variables:

```typescript
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
```

**Rules:**
- Define env schemas per package/app
- Use Zod for validation
- Never commit `.env` files (use `.env.example`)

---

## Development Workflow

### Common Commands

```bash
bun dev              # Start all apps in dev mode
bun build            # Build all packages
bun lint             # Check for lint errors
bun format           # Fix lint/format issues
bun typecheck        # Run TypeScript checks

# Database
bun db:push          # Push schema changes (dev)
bun db:migrate       # Run migrations (prod)
bun db:gen           # Generate Drizzle migrations
bun db:studio        # Open Drizzle Studio

# Docker
bun docker:up        # Start PostgreSQL container
bun docker:down      # Stop and remove containers
```

### Pre-commit Hooks (Lefthook)

Automatically runs on commit:
1. `bun install --frozen-lockfile` — Verify lockfile
2. `bun format` — Lint and format
3. `bun typecheck` — Type checking

### CI Pipeline

On PR and push to main/staging/dev:
1. **Checks job:** Lint + Typecheck
2. **Tests job:** Run test suite
3. **Build job:** Verify build succeeds

---

## Auth Patterns (better-auth)

Configuration lives in `packages/auth/src/auth-config.ts`:

```typescript
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId, clientSecret },
  },
  plugins: [openAPI(), admin()],
})
```

### Frontend Auth

```typescript
import { authClient } from '~/lib/clients/auth-client'

// Sign in
await authClient.signIn.email({ email, password })

// Sign out
await authClient.signOut()

// Get session (use in components)
const { data: session } = authClient.useSession()
```

---

## Important Guidelines

### DO

- Keep files under 200-300 lines
- Write descriptive comments explaining "why" when code logic is complex
- Use existing patterns when adding new features
- Invalidate queries after mutations
- Handle loading and error states in UI
- Use the logger package instead of console.log in the backend
- Keep this @AGENTS.md file up to date when adding/changing/removing key parts

### DON'T

- Don't mock data outside of tests
- Don't use `any` type (suppress with biome-ignore if unavoidable)
- Don't commit sensitive data or .env files
- Don't add features beyond what was requested
- Don't over-engineer or add unnecessary abstractions

---

## Quick Reference

| Need | Location |
|------|----------|
| Add a new API route | `apps/backend/src/routers/<feature>/` |
| Add a new page | `apps/web/src/routes/` |
| Add a new query | `apps/web/src/lib/queries/` |
| Add a new mutation | `apps/web/src/lib/mutations/` |
| Add a new DB model | `packages/db/src/schemas/` |
| Add a new UI component | `apps/web/src/components/ui/` |
| Add shared types | `packages/utils/src/` |
| Configure auth | `packages/auth/src/auth-config.ts` |
