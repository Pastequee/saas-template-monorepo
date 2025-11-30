import { admin, lastLoginMethod } from 'better-auth/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from './env'

export const authClient = createAuthClient({
	plugins: [lastLoginMethod(), admin()],
	baseURL: env.VITE_BACKEND_URL,
})

export type BetterAuthContext = typeof authClient.$Infer.Session
