import { defineConfig } from 'prisma/config'
import { env } from './env.js'

export default defineConfig({
	schema: 'schemas',
	migrations: {
		path: 'migrations',
	},
	datasource: {
		url: env.DATABASE_URL,
	},
})
