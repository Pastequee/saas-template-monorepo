# Environment Variables

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

## Rules

- Define env schemas per package/app
- Use Zod for validation
- Never commit `.env` files (use `.env.example`)
