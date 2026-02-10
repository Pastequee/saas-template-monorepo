import { db } from '@repo/db'
import { mail } from '@repo/email'
import { env } from '@repo/env/server'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod } from 'better-auth/plugins'

export const createAuth = () =>
	betterAuth({
		database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),

		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.SERVER_URL,
		trustedOrigins: [env.FRONTEND_URL],

		experimental: {
			joins: false,
		},

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

export const auth = createAuth()

export default auth
