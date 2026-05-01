import { PGlite } from '@electric-sql/pglite'
import { pushSchema } from 'drizzle-kit/api-postgres'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'

import { relations } from './relations'
import * as schema from './schemas'

export type TestDb = ReturnType<typeof drizzle<typeof schema>>

/**
 * Creates a single PGlite instance and migrates the schema once.
 *
 * Designed for use in `beforeAll` — spinning up one PGlite per file
 * instead of per test is significantly faster (~4-5x) because PGlite
 * boot + schema push is the expensive part, not the queries themselves.
 *
 * Use {@link truncateAllTables} in `beforeEach` to reset state between tests.
 */
export const createTestDb = async () => {
	const pglite = new PGlite()
	const testDb = drizzle({ client: pglite, relations, schema })
	// oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-type-assertion, typescript/no-unsafe-argument
	const { apply } = await pushSchema(schema, testDb as any)
	await apply()
	await testDb.query.listings.findMany()
	return { pglite, testDb }
}

/**
 * Truncates every table in the public schema with CASCADE.
 *
 * Call this in `beforeEach` to give each test a clean database
 * without the overhead of recreating the PGlite instance.
 */
export const truncateAllTables = async (testDb: TestDb) => {
	await testDb.execute(sql`DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;`)
}
