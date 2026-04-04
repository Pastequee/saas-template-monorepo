import { afterAll, beforeAll, beforeEach, mock } from 'bun:test'

import { createAuth } from '@repo/auth'
import { createTestDb, truncateAllTables } from '@repo/db/test'
import { fileStorageMock } from '@repo/file-storage/test'

let testDb: Awaited<ReturnType<typeof createTestDb>>

beforeAll(async () => {
	// Create the in-memory database once for all tests.
	testDb = await createTestDb()

	// Mock the db module so all imports use the test DB instance.
	mock.module('@repo/db', () => ({
		db: testDb,
	}))

	mock.module('@repo/file-storage', () => ({
		fileStorage: fileStorageMock,
	}))

	const testAuth = createAuth()

	mock.module('@repo/auth', () => ({ auth: testAuth, default: testAuth }))
})

beforeEach(async () => {
	// Reset state between tests for deterministic results.
	await truncateAllTables(testDb)
	fileStorageMock._cleanFiles()
})

afterAll(async () => {
	// Close DB after all tests complete.
	await testDb.$client.end()
})
