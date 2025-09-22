/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
})
