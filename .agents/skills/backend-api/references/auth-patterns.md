# Auth Patterns (better-auth)

Configuration lives in `packages/auth/src/auth-config.ts`:

```typescript
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VITE_SERVER_URL,
  trustedOrigins: [env.VITE_FRONTEND_URL],
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url, user }) => {
      await mail.sendTemplate('reset-password', user.email, { URL: url })
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [admin(), lastLoginMethod()],
})
```

## Frontend Auth

Authentication is handled through the Eden client which calls the backend API routes directly:

```typescript
import { eden } from '~/lib/server-fn/eden'

// Sign in via email
await eden().signIn.email.post({ email, password })

// Sign out
await eden().signOut.post()

// Get session (use Eden query options)
import { todoListOptions } from '~/lib/queries/todos.queries'

// Note: Session data is typically accessed through authenticated endpoints
// The Eden client automatically handles auth headers from the session
```
