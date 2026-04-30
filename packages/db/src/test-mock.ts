import { env } from '@repo/env/server'
import { sql } from 'drizzle-orm/sql'

import { db } from '.'
import * as schema from './schemas'

// In memory database for testing
export const createTestDb = async () => {
	// oxlint-disable-next-line import/no-nodejs-modules
	const { createRequire } = await import('node:module')
	const require = createRequire(import.meta.url)
	const { pushSchema } =
		// oxlint-disable-next-line typescript/consistent-type-imports, typescript/no-unsafe-type-assertion
		require('drizzle-kit/api-postgres') as typeof import('drizzle-kit/api-postgres')

	await db.execute(sql`DROP SCHEMA IF EXISTS auth CASCADE`)
	await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`)
	await db.execute(sql`CREATE SCHEMA public`)

	// oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-argument, typescript/no-unsafe-type-assertion
	const { apply } = await pushSchema(schema, db as any, 'snake_case')
	await apply()

	return db
}

export const truncateAllTables = async (instance: Awaited<ReturnType<typeof createTestDb>>) => {
	// Test only functionality, safeguard against running in production
	if (env.NODE_ENV !== 'test') {
		return
	}

	const tables = await instance.execute<{ tablename: string; schemaname: string }>(sql`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname IN ('auth', 'public')
    AND tablename NOT IN ('schema_migrations', '__drizzle_migrations')
  `)

	if (tables.rows.length === 0) {
		return
	}

	for (const table of tables.rows) {
		await instance.execute(
			sql`TRUNCATE TABLE ${sql.identifier(table.schemaname)}.${sql.identifier(table.tablename)} RESTART IDENTITY CASCADE`
		)
	}
}
