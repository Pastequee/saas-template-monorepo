// oxlint-disable sort-keys

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_FRONTEND_URL: z.url(),
		VITE_SERVER_URL: z.url(),
	},

	server: {
		SERVER_URL: z.url(),
	},

	shared: {
		NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
	},

	emptyStringAsUndefined: true,
	runtimeEnv: { ...process.env, ...import.meta.env },
})
