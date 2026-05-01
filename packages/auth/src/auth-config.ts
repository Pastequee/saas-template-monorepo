import { db } from '@repo/db'
import { mail } from '@repo/email'
import { env } from '@repo/env/server'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod, testUtils } from 'better-auth/plugins'

export const createAuth = () =>
	betterAuth({
		advanced: {
			crossSubDomainCookies: {
				domain: 'localhost',
				enabled: true,
			},

			database: {
				generateId: 'serial',
			},
		},

		baseURL: env.SERVER_URL,
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

		plugins: [admin(), lastLoginMethod(), testUtils()],

		secret: env.BETTER_AUTH_SECRET,

		trustedOrigins: [env.WEB_URL],
	})

export const auth = createAuth()

export type { TestHelpers } from 'better-auth/plugins'

export type Auth = ReturnType<typeof createAuth>

export default auth
