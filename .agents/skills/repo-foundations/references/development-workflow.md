# Development Workflow

## Common Commands

```bash
bun dev              # Start all apps in dev mode (web app includes API server)
bun build            # Build all packages
bun lint             # Check for lint errors
bun lint:fix         # Fix lint errors automatically
bun format           # Fix format issues
bun typecheck        # Run TypeScript checks
bun test:server      # Run backend tests

# Database
bun db:push          # Push schema changes (dev)
bun db:migrate       # Run migrations (prod)
bun db:gen           # Generate Drizzle migrations
bun db:studio        # Open Drizzle Studio

# Auth
bun auth:gen         # Generate better-auth types

# Docker
bun docker:up        # Start PostgreSQL container
bun docker:down      # Stop and remove containers
bun docker:reset     # Reset containers (down + up)
```

## Pre-commit Hooks (Lefthook)

Automatically runs on commit:
1. `bun install --frozen-lockfile` — Verify lockfile
2. `bun format` — Lint and format
3. `bun typecheck` — Type checking

## CI Pipeline

On PR and push to main/staging/dev:
1. **Checks job:** Lint + Typecheck
2. **Tests job:** Run test suite
3. **Build job:** Verify build succeeds
