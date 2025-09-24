/** biome-ignore-all lint/style/useNamingConvention: needed for env vars */

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_CONVEX_URL: z.url(),
  },

  shared: {
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },

  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
  clientPrefix: 'VITE_',
})
