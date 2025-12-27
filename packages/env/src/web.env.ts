/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	clientPrefix: 'VITE_',
	client: {
		VITE_BACKEND_URL: z.url(),
		VITE_FRONTEND_URL: z.url(),
	},

	shared: {
		NODE_ENV: z.enum(['development', 'production']).default('development'),
	},

	// biome-ignore lint/suspicious/noExplicitAny: its ok
	runtimeEnv: (import.meta as any).env,

	emptyStringAsUndefined: true,
})
