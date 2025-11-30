/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		FRONTEND_URL: z.url(),
		NODE_ENV: z.enum(['development', 'production']).default('development'),
		LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
	},

	runtimeEnv: import.meta.env,

	emptyStringAsUndefined: true,
})
