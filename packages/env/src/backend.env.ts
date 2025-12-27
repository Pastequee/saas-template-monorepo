/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		FRONTEND_URL: z.url(),
		NODE_ENV: z.enum(['development', 'production']).default('development'),
		LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

		// Email service
		RESEND_API_KEY: z.string(),
		FROM_EMAIL: z.email(),
		FROM_NAME: z.string(),

		// Database
		DATABASE_URL: z.url(),

		// Better Auth
		BETTER_AUTH_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),

		// Redis
		REDIS_URL: z.url(),
	},

	// biome-ignore lint/suspicious/noExplicitAny: its ok
	runtimeEnv: (import.meta as any).env,

	emptyStringAsUndefined: true,
})
