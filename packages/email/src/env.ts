/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		RESEND_API_KEY: z.string(),
		FROM_EMAIL: z.email(),
		FROM_NAME: z.string(),
	},

	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
})
