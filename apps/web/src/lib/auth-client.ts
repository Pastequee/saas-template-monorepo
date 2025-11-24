import { createAuthClient } from 'better-auth/react'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { env } from './env'

export const authClient = createAuthClient({
  plugins: [tanstackStartCookies()],
  baseURL: env.VITE_BACKEND_URL,
})

export type BetterAuthContext = typeof authClient.$Infer.Session
