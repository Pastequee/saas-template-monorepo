import { env } from '@repo/env/web'
import { adminClient, lastLoginMethodClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [lastLoginMethodClient(), adminClient()],
})

export type BetterAuthContext = typeof authClient.$Infer.Session
