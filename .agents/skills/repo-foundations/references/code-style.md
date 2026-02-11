# Code Style

## Biome Configuration

- **Semicolons:** As needed (no trailing semicolons)
- **Quotes:** Single quotes and JSX double quote
- **Indentation:** Tabs
- **Line width:** 100 characters
- **No console.log:** Use structured logger (`#lib/logger`) instead (backend only)

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `todo-item.tsx`, `auth-provider.tsx` |
| Components | PascalCase | `TodoItem`, `AuthProvider` |
| Functions | camelCase | `getUserTodos`, `createTodo` |
| Constants | SCREAMING_SNAKE | `DATABASE_URL`, `API_KEY` |
| DB tables | snake_case (plural) | `todos`, `user_sessions` |
| DB columns | snake_case | `user_id`, `created_at` |

## TypeScript

- Strict mode enabled
- Prefer `type` over `interface` unless necessary
- Use implicit return types for exported functions
- Import types using `type` keyword: `import type { User } from '@repo/db/types'`
