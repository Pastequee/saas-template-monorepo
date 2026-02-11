# Backend Patterns (Elysia)

## Server Architecture

The Elysia API server (`packages/server`) is mounted via TanStack Start server functions rather than running as a standalone server. The API is accessible at `/api/*` routes through the frontend app:

- Server entry: `packages/server/src/index.ts` exports the Elysia app
- API proxy route: `apps/web/src/routes/api/$.ts` handles all `/api/*` requests
- The server uses `app.fetch(request)` to handle requests directly without HTTP overhead when running in the same process
- Auth handler is mounted at `/api/auth` via `.mount(auth.handler)`

## Router Structure

Each feature has its own folder with:
- `controller.ts` — Route definitions (thin layer)
- `service.ts` — Business logic and database operations

```typescript
// controller.ts - Routes are thin, delegate to service
import { authMacro } from '../../lib/auth'

export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
  .use(authMacro)
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

## Authentication

- Use `authMacro` from `#lib/auth` (import and `.use(authMacro)` in your router)
- Set `{ auth: true }` in route options to require authentication
- Set `{ authAdmin: true }` in route options to require auth admin authentication
- Access user via `{ user }` in route handler (also includes `{ session }`)

```typescript
import { authMacro } from '../../lib/auth'

export const adminRouter = new Elysia({ name: 'admin', tags: ['Admin'] })
  .use(authMacro)
  .get('/users', handler, { role: 'admin' }) // Requires admin role
  .get('/mods', handler, { role: ['admin', 'moderator'] }) // Requires admin or moderator
```

**Note:** Superadmin role bypasses all role checks. The role macro checks authentication first, then verifies the role from the `user_roles` table. Use `authAdmin` for admin-only routes.

## Validation

- Use Drizzle-Zod generated schemas for body validation
- Import from `@repo/db/types`
- Insert and Update schemas do not include foreign keys like `somethingId` (automatically omitted)

```typescript
import { todoInsertSchema } from '@repo/db/types'

.post('/todos', handler, { body: todoInsertSchema })
```

## Error Handling

- Return status codes using `status()` helper
- Use `status('Not Found')`, `status('Forbidden')`, `status('Created')`, `status('OK')`, `status('No Content')`, etc.
- Never EVER throw an error, handle every controlled error except for unexpected errors like DB crash or network crash and so on
- Global error handler in `#lib/utils` obfuscates internal server errors (returns 500 without details)
