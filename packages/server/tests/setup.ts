import { afterAll, beforeAll, beforeEach, mock } from 'bun:test'
import { createAuth } from '@repo/auth'
import type { DbInstance } from '@repo/db'
import { createTestDb, truncateAllTables } from '@repo/db/test'
import { app } from '../src'

export let testDb: Awaited<ReturnType<typeof createTestDb>>

beforeAll(async () => {
	// Create the in-memory database once for all tests.
	testDb = await createTestDb()

	// mock.module('@repo/db', () => {
	// 	return { dbInstance: testDb }
	// })

	const testAuth = createAuth({ db: testDb as unknown as DbInstance })

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
	app.decorate({ as: 'override' }, { db: testDb })
})
