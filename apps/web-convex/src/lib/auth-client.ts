import { convexClient } from '@convex-dev/better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from './env'

export const authClient = createAuthClient({
  plugins: [convexClient()],
  baseURL: env.VITE_SERVER_URL,
})

export type BetterAuthContext = typeof authClient.$Infer.Session
