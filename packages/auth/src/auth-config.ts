import { db } from '@repo/db'
import { Role } from '@repo/db/types'
import { mail } from '@repo/email'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, lastLoginMethod, openAPI } from 'better-auth/plugins'
import { randomUUIDv7 } from 'bun'
import { env } from './env'

export const auth = betterAuth({
	database: prismaAdapter(db, { provider: 'postgresql' }),

	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.FRONTEND_URL],

	experimental: {
		joins: true,
	},

	advanced: {
		database: {
			generateId: () => randomUUIDv7(),
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

	plugins: [
		openAPI(),
		admin({
			adminRoles: [Role.admin, Role.superadmin],

			defaultRole: Role.user,
		}),
		lastLoginMethod(),
	],
})

export type Auth = typeof auth

export default auth
