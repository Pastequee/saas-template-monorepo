import { defineConfig } from 'drizzle-kit'

import { env } from './src/env'

export default defineConfig({
  dbCredentials: { url: env.DATABASE_URL },
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/schemas/*',
})
