import { PGlite } from '@electric-sql/pglite'
import { pushSchema } from 'drizzle-kit/api-postgres'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'

import { relations } from './relations'
import * as schema from './schemas'

export type TestDb = ReturnType<typeof drizzle<typeof relations>>

export const createTestDb = async () => {
	const pglite = new PGlite()
	const testDb = drizzle({ client: pglite, relations })
	const { apply } = await pushSchema(schema, testDb)
	await apply()
	/* Somehow `pushSchema` is setting the exit code to 99
	 * which causes `bun test` to propagate the error and fail the test.
	 * This is a workaround to set it back to 0.
	 */
	process.exitCode = 0
	await testDb.query.listings.findMany()
	return { pglite, testDb }
}

export const truncateAllTables = async (testDb: TestDb) => {
	await testDb.execute(sql`DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;`)
}
