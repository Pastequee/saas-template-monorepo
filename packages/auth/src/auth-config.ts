import { db } from '@repo/db'
import { mail } from '@repo/email'
import { env } from '@repo/env/web'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod } from 'better-auth/plugins'

export const createAuth = () =>
	betterAuth({
		advanced: {
			database: {
				generateId: 'uuid',
			},
		},

		baseURL: env.VITE_SERVER_URL,
		database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
		emailAndPassword: {
			enabled: true,
			sendResetPassword: async ({ url, user }) => {
				await mail.sendTemplate('reset-password', user.email, { URL: url })
			},
		},

		experimental: {
			joins: false,
		},

		plugins: [admin(), lastLoginMethod()],

		secret: env.BETTER_AUTH_SECRET,

		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},

		trustedOrigins: [env.VITE_FRONTEND_URL],
	})

export const auth = createAuth()

export default auth
