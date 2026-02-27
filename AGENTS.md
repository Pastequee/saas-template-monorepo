# AI Coding Guidelines

Bun monorepo with Elysia API server, TanStack Start frontend, Drizzle ORM, better-auth.

**Package Manager:** Bun (not npm)

**Essential Commands:**

```bash
bun lint             # Check lint
bun lint:fix         # Auto-fix lint
bun format           # Fix format
bun typecheck        # TypeScript check
bun test:server      # Run server tests
bun router:gen  # Generate web app router files (routeTree.gen.ts)
bun db:push          # Push database schema to the database (dev only)
bun db:gen           # Generate database migrations
bun clean            # Clean up the project (removes node_modules, dist, build, .turbo, .cache, .tanstack)
```

## Tech Stack & Style

- **Stack**: TypeScript, Bun, Elysia, TanStack Start, Drizzle ORM, better-auth
- **Styling**: Tailwind v4. Use `cn` utility function for class merging.

## General Rules

- **Conciseness**: Be extremely concise
- **Types**: Do NOT write explicit return types unless necessary
- **Questions**: Always ask the user for clarification FOR ANY information or precisions before proceeding.
- **Commands**: NEVER RUN THE DEV SERVER commands like `bun dev`
