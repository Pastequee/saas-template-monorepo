import { adminClient, lastLoginMethodClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from './env'

export const authClient = createAuthClient({
	plugins: [lastLoginMethodClient(), adminClient()],
	baseURL: env.VITE_BACKEND_URL,
})

export type BetterAuthContext = typeof authClient.$Infer.Session
