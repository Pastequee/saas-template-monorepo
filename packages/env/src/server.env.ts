// oxlint-disable sort-keys

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	emptyStringAsUndefined: true,

	runtimeEnv: process.env,

	server: {
		LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
		COMMIT_HASH: z.string().optional(),
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		APP_ENV: z.enum(['development', 'production', 'test', 'staging']).default('development'),

		// Server URL
		SERVER_URL: z.url(),
		WEB_URL: z.url(),

		// Email service
		RESEND_API_KEY: z.string(),
		FROM_EMAIL: z.email(),
		FROM_NAME: z.string(),

		// Database
		DATABASE_URL: z.url(),

		// Better Auth
		BETTER_AUTH_SECRET: z.string(),

		// S3 Storage
		S3_ACCESS_KEY: z.string().optional(),
		S3_SECRET_KEY: z.string().optional(),
		S3_ENDPOINT: z.url(),
	},
})
