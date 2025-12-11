import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createEnv } from '@t3-oss/env-core'
import dotenv from 'dotenv'
import { z } from 'zod'

const localEnvPath = resolve(__dirname, '../../apps/backend/.env.local')

if (process.env.NODE_ENV !== 'production' && existsSync(localEnvPath)) {
	dotenv.config({ path: localEnvPath })
} else {
	dotenv.config()
}

export const env = createEnv({
	server: {
		DATABASE_URL: z.string(),
	},
	runtimeEnv: process.env,
})
