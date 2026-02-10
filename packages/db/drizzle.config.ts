import { defineConfig } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set')
}

export default defineConfig({
	out: './migrations',
	schema: './src/schemas/index.ts',

	dialect: 'postgresql',
	dbCredentials: { url: DATABASE_URL },

	casing: 'snake_case',
	migrations: {
		schema: 'drizzle',
	},
})
