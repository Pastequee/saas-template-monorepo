/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		BETTER_AUTH_SECRET: z.string(),
		FRONTEND_URL: z.url(),

		// Google OAuth2
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
	},

	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
})
