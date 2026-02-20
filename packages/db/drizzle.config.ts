import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '../../apps/web/.env.local' })

const { DATABASE_URL } = process.env
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set')
}

export default defineConfig({
	casing: 'snake_case',
	dbCredentials: { url: DATABASE_URL },

	dialect: 'postgresql',
	migrations: {
		schema: 'drizzle',
	},

	out: './migrations',
	schema: './src/schemas/index.ts',
})
