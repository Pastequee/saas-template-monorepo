// oxlint-disable sort-keys

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	client: {
		VITE_FRONTEND_URL: z.url(),
		VITE_SERVER_URL: z.url(),
	},
	clientPrefix: 'VITE_',

	emptyStringAsUndefined: true,

	runtimeEnv: { ...process.env, ...import.meta.env },

	server: {
		LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
		COMMIT_HASH: z.string().optional(),

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

		// Axiom (logs)
		AXIOM_API_KEY: z.string(),
		AXIOM_DATASET: z.string(),

		// S3 Storage
		S3_ACCESS_KEY: z.string().optional(),
		S3_SECRET_KEY: z.string().optional(),
		S3_ENDPOINT: z.url(),
	},

	shared: {
		NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
	},
})
