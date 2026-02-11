import { afterAll, beforeAll, beforeEach, mock } from 'bun:test'
import { createAuth } from '@repo/auth'
import { createTestDb, truncateAllTables } from '@repo/db/test'

let testDb: Awaited<ReturnType<typeof createTestDb>>

beforeAll(async () => {
	// Create the in-memory database once for all tests.
	testDb = await createTestDb()

	// Mock the db module so all imports use the test DB instance.
	mock.module('@repo/db', () => {
		return {
			db: testDb,
		}
	})

	const testAuth = createAuth()

	mock.module('@repo/auth', () => {
		return { default: testAuth, auth: testAuth }
	})
})

afterAll(async () => {
	// Close DB after all tests complete.
	await testDb.$client.close()
})

beforeEach(async () => {
	// Reset state between tests for deterministic results.
	await truncateAllTables(testDb)
})
