import { env } from '@repo/env/web'
import { sql } from 'drizzle-orm/sql'
import { db } from '.'
import * as schema from './schemas'

// In memory database for testing
export const createTestDb = async () => {
	const { createRequire } = await import('node:module')
	const require = createRequire(import.meta.url)
	const { pushSchema } =
		require('drizzle-kit/api-postgres') as typeof import('drizzle-kit/api-postgres')

	// biome-ignore lint/suspicious/noExplicitAny: needed somehow
	const { apply } = await pushSchema(schema, db as any, 'snake_case')
	await apply()

	return db
}

export const truncateAllTables = async (instance: Awaited<ReturnType<typeof createTestDb>>) => {
	// Test only functionality, safeguard against running in production
	if (env.NODE_ENV !== 'test') return

	const tables = await instance.execute<{ tablename: string; schemaname: string }>(sql`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' -- OR schemaname = 'auth'
    AND tablename NOT IN ('schema_migrations', '__drizzle_migrations')
  `)

	if (tables.rows.length === 0) return

	for (const table of tables.rows) {
		await instance.execute(
			sql`TRUNCATE TABLE ${sql.identifier(table.schemaname)}.${sql.identifier(table.tablename)} RESTART IDENTITY CASCADE`
		)
	}
}
