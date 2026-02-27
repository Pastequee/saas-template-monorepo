# Project Structure

## Monorepo Structure

```
apps/
  web/           # TanStack Start frontend (port 3000) - includes API server via server functions

packages/
  server/        # Elysia API server (mounted via TanStack Start server functions)
  auth/          # better-auth configuration (shared)
  db/            # Drizzle ORM client, schemas, generated types
  email/         # Email service (Resend)
  utils/         # Shared utilities
  env/           # Environment variable schemas (server & web)
  typescript/    # Shared tsconfig bases
```

## Workspace Imports

- Use `@repo/<package>` for cross-package imports (e.g., `@repo/db`, `@repo/auth`, `@repo/server`, `@repo/env`)
- Use `#<path>` for internal imports in backend (configured via tsconfig paths in `packages/server`)
- Use `~/<path>` for internal imports in frontend (configured via tsconfig paths in `apps/web`)
