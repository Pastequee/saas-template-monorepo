import { afterAll, beforeAll, beforeEach, mock } from 'bun:test'
import { type Treaty, treaty } from '@elysiajs/eden'
import { createTestDb, truncateAllTables } from '@repo/db/utils'
import type { app } from '../src'

let testDb: Awaited<ReturnType<typeof createTestDb>>
export let api: Treaty.Create<typeof app>['api']

beforeAll(async () => {
	// Create the in-memory database once for all tests.
	testDb = await createTestDb()

	// Mock the db module so all imports use the test DB instance.
	mock.module('@repo/db', () => {
		return {
			db: testDb,
		}
	})

	// Import the app after mocks so it boots with test dependencies.
	const { app } = await import('../src')
	api = treaty(app).api
})

beforeEach(async () => {
	// Reset state between tests for deterministic results.
	await truncateAllTables(testDb)
})

afterAll(async () => {
	// Close DB after all tests complete.
	await testDb.$client.close()
})
