import { createAuthClient } from 'better-auth/react'
import { reactStartCookies } from 'better-auth/react-start'
import { env } from './env'

export const authClient = createAuthClient({
  plugins: [reactStartCookies()],
  baseURL: env.VITE_BACKEND_URL,
})

export type BetterAuthContext = typeof authClient.$Infer.Session
