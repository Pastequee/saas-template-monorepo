import { db } from '@repo/db-prisma'
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
		requireEmailVerification: true,
		sendResetPassword: async ({ url, user }) => {
			await mail.send({
				to: user.email,
				subject: 'Reset your password',
				text: `Click here to reset your password: ${url}`,
			})
		},
	},

	emailVerification: {
		sendVerificationEmail: async ({ url, user }) => {
			await mail.send({
				to: user.email,
				subject: 'Verify your email',
				text: `Click here to verify your email: ${url}`,
			})
		},
		autoSignInAfterVerification: true,
	},

	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},

	plugins: [openAPI(), admin(), lastLoginMethod()],
})

export type Auth = typeof auth

export default auth
