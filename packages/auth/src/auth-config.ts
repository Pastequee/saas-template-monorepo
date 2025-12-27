import { db } from '@repo/db'
import { mail } from '@repo/email'
import { env } from '@repo/env/backend'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { admin, lastLoginMethod, openAPI } from 'better-auth/plugins'
import { RedisClient } from 'bun'

const redisClient = new RedisClient(env.REDIS_URL)

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),

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

	plugins: [openAPI(), admin(), lastLoginMethod()],
})

export default auth
