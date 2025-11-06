import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

const localEnvPath = resolve(__dirname, '../../apps/web-elysia/.env.local')

if (process.env.NODE_ENV !== 'production' && existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath })
} else {
  dotenv.config()
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas',
  dialect: 'postgresql',
  dbCredentials: { url: DATABASE_URL },
  migrations: {
    schema: 'drizzle',
  },
})
