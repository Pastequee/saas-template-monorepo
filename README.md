# SaaS Template Monorepo

A modern, full-stack SaaS template built with Bun, Elysia, React, and TanStack Start. This monorepo provides a solid foundation for building scalable SaaS applications with authentication, database management, and a beautiful UI.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Database](#database)
- [Building](#building)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun 1.3.5+** - [Install Bun](https://bun.sh/docs/installation)
- **Node.js 24+** - Required by Bun
- **Docker & Docker Compose** - For running PostgreSQL, Redis, and file storage locally

### Verify Installation

```bash
bun --version  # Should be 1.3.5 or higher
node --version # Should be 24 or higher
docker --version
docker compose version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url> <your-project-name>
cd <your-project-name>
```

### 2. Install Dependencies

```bash
bun install
```

This will install all dependencies for the monorepo using Bun's workspace feature.

### 3. Start Infrastructure Services

Start PostgreSQL, Redis, and file storage using Docker Compose:

```bash
bun docker:up
```

This starts:
- **PostgreSQL** on port `5400` (mapped from container port 5432)
- **Redis** on port `6379`
- **RustFS** (S3-compatible file storage) on ports `9000` (API) and `9001` (Console)

To stop these services:

```bash
bun docker:down
```

To reset (stop, remove volumes, and restart):

```bash
bun docker:reset
```

### 4. Set Up Environment Variables

Copy the example environment files to create your local configuration:

**Backend:**
```bash
cp apps/backend/.env.example apps/backend/.env.local
```

**Frontend:**
```bash
cp apps/web/.env.example apps/web/.env.local
```

Then edit the `.env.local` files and fill in the required values. Make sure to:

- Set `DATABASE_URL` to match your local PostgreSQL connection (default: `postgresql://postgres:postgres@localhost:5400/main`)
- Generate a secure `BETTER_AUTH_SECRET` (minimum 32 characters):
  ```bash
  openssl rand -base64 32
  ```
- Add your Resend API key for email functionality
- Configure Google OAuth2 credentials if you plan to use social login

### 5. Set Up the Database

Push the database schema to your local PostgreSQL instance:

```bash
bun db:push
```

This creates all necessary tables based on the Drizzle schemas.

**Optional:** Open Drizzle Studio to inspect your database:

```bash
bun db:studio
```

This opens a web UI at `http://localhost:4983` where you can view and edit your database.

### 6. Start Development Servers

Run both frontend and backend in development mode:

```bash
bun dev
```

This starts:
- **Frontend** at `http://localhost:3000`
- **Backend API** at `http://localhost:3001`

The frontend will automatically reload on file changes, and the backend will restart on changes.

## Project Structure

```
saas-template-monorepo/
├── apps/
│   ├── backend/          # Elysia API server (port 3001)
│   │   ├── src/
│   │   │   ├── routers/   # API route controllers
│   │   │   ├── services/ # Business logic
│   │   │   ├── middlewares/
│   │   │   └── lib/
│   │   └── Dockerfile
│   └── web/              # TanStack Start frontend (port 3000)
│       ├── src/
│       │   ├── routes/    # File-based routing
│       │   ├── components/
│       │   ├── lib/
│       │   └── assets/
│       └── Dockerfile
├── packages/
│   ├── auth/             # better-auth configuration
│   ├── db/               # Drizzle ORM schemas and client
│   ├── email/            # Email service (Resend)
│   └── utils/            # Shared utilities
├── tooling/
│   └── typescript/       # Shared TypeScript configs
└── infra/
    └── docker/
        └── docker-compose.dev.yml
```

## Environment Variables

Environment variables are configured via `.env.local` files. Copy the example files to get started:

- **Backend:** `apps/backend/.env.example` → `apps/backend/.env.local`
- **Frontend:** `apps/web/.env.example` → `apps/web/.env.local`

See the `.env.example` files for detailed documentation of each variable. All variables marked as required must be set before running the application.

## Development

### Available Scripts

#### Root Level

```bash
# Development
bun dev                   # Start all apps in dev mode
bun lint                  # Check for lint errors
bun format                # Fix lint/format issues
bun typecheck             # Run TypeScript checks

# Database
bun db:push               # Push schema changes (dev)
bun db:migrate            # Run migrations (prod)
bun db:gen                # Generate Drizzle migrations
bun db:studio             # Open Drizzle Studio

# Docker
bun docker:up             # Start PostgreSQL/Redis containers
bun docker:down           # Stop containers
bun docker:reset          # Reset containers (removes volumes)

# Build
bun build                 # Build all packages
bun build:web             # Build frontend only
bun build:backend         # Build backend only
```

#### Backend (`apps/backend`)

```bash
bun dev                   # Start dev server with hot reload
bun build                 # Compile to standalone binary
bun typecheck             # Type check only
```

#### Frontend (`apps/web`)

```bash
bun dev                   # Start dev server (port 3000)
bun build                 # Build for production
bun preview               # Preview production build
bun typecheck             # Type check only
```

### Code Quality

The project uses **Biome** for linting and formatting. Pre-commit hooks (via Lefthook) automatically run:

1. `bun install --frozen-lockfile` - Verify lockfile
2. `bun format` - Lint and format
3. `bun typecheck` - Type checking

To manually format code:

```bash
bun format
```

## Database

### Schema Management

The project uses **Drizzle ORM** for database management. Schemas are defined in `packages/db/src/schemas/`.

**Development workflow:**

```bash
# 1. Modify schemas in packages/db/src/schemas/
# 2. Push changes to database (dev only)
bun db:push

# 3. Generate migration files (for production)
bun db:gen

# 4. Apply migrations (production)
bun db:migrate
```

**Important:** 
- Use `db:push` for development (auto-syncs schema)
- Use `db:gen` + `db:migrate` for production (versioned migrations)

### Database Studio

Inspect and edit your database visually:

```bash
bun db:studio
```

Opens at `http://localhost:4983`.

## Building

### Build All Packages

```bash
bun build
```

This builds:
- Backend (compiled binary)
- Frontend (static assets)
- All shared packages

### Build Individual Apps

```bash
bun build:backend  # Build backend only
bun build:web       # Build frontend only
```

### Backend Build Output

The backend compiles to a standalone binary at `apps/backend/dist/server`. This binary includes all dependencies and can run without Bun installed.

### Frontend Build Output

The frontend builds to `apps/web/dist/` with:
- Static assets (HTML, CSS, JS)
- Server entry point at `dist/server/index.mjs`

## Deployment

The project includes Dockerfiles for both backend and frontend that can be built using the provided commands:

**Build backend image:**
```bash
bun build:docker:backend
# Or manually:
docker build -f apps/backend/Dockerfile -t backend-image .
```

**Build frontend image:**
```bash
bun build:docker:web
# Or manually:
docker build -f apps/web/Dockerfile -t web-image .
```

Both Dockerfiles use multi-stage builds optimized for production. Configure environment variables as needed when running the containers.

### Environment-Specific Notes

**Production Environment Variables:**

- Use strong, randomly generated secrets
- Never commit `.env` files to version control
- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Enable SSL/TLS for all connections
- Use connection pooling for database connections

**Database Migrations:**

In production, always use migrations instead of `db:push`:

```bash
# Generate migration files
bun db:gen

# Review generated files in packages/db/drizzle/

# Apply migrations
bun db:migrate
```

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Elysia Documentation](https://elysiajs.com)
- [TanStack Start Documentation](https://tanstack.com/router)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [better-auth Documentation](https://www.better-auth.com)
