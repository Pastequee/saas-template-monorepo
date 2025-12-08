import { db } from '@repo/db'
import { mail } from '@repo/email'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod, openAPI } from 'better-auth/plugins'
import { RedisClient, randomUUIDv7 } from 'bun'
import { env } from './env'

const redisClient = new RedisClient(env.REDIS_URL)

export const auth = betterAuth({
	database: prismaAdapter(db, { provider: 'postgresql' }),

	secondaryStorage: {
		get: async (key) => await redisClient.get(key),
		set: async (key, value, ttl) =>
			ttl ? await redisClient.set(key, value, 'EX', ttl) : await redisClient.set(key, value),
		delete: async (key) => (await redisClient.del(key)).toString(),
	},

	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.FRONTEND_URL],

	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},

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

	plugins: [openAPI(), admin(), lastLoginMethod()],
})

export type Auth = typeof auth

export default auth
