import { db } from '@repo/db'
import * as schema from '@repo/db/schemas'
import { mail } from '@repo/email'
import { env } from '@repo/env/server'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod, testUtils } from 'better-auth/plugins'

type AuthDb = Parameters<typeof drizzleAdapter>[0]

type AuthDeps = {
	db: AuthDb
	env: typeof env
	mail: typeof mail
}

const productionDeps = { db, env, mail } satisfies AuthDeps

export const createAuth = (deps: AuthDeps = productionDeps) =>
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

		baseURL: deps.env.SERVER_URL,
		database: drizzleAdapter(deps.db, { provider: 'pg', schema, usePlural: true }),
		emailAndPassword: {
			enabled: true,
			sendResetPassword: async ({ url, user }) => {
				await deps.mail.sendTemplate('reset-password', user.email, { URL: url })
			},
		},

		experimental: {
			joins: false,
		},

		plugins: [admin(), lastLoginMethod(), testUtils()],

		secret: deps.env.BETTER_AUTH_SECRET,

		trustedOrigins: [deps.env.WEB_URL],
	})

export const auth = createAuth()

export type { TestHelpers } from 'better-auth/plugins'

export type Auth = ReturnType<typeof createAuth>

export default auth
