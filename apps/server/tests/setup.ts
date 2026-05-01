import { beforeAll, beforeEach, mock } from 'bun:test'

import { createAuth } from '@repo/auth/config'
import { createTestDb, truncateAllTables } from '@repo/db/test'
import { fileStorageMock } from '@repo/file-storage/test'

let testDb: Awaited<ReturnType<typeof createTestDb>>

beforeAll(async () => {
	// Create the in-memory database once for all tests.
	testDb = await createTestDb()

	// Mock the db module so all imports use the test DB instance.
	await mock.module('@repo/db', () => ({
		db: testDb,
	}))

	await mock.module('@repo/file-storage', () => ({
		fileStorage: fileStorageMock,
	}))

	const testAuth = createAuth()

	await mock.module('@repo/auth/config', () => ({ auth: testAuth, default: testAuth }))
})

beforeEach(async () => {
	// Reset state between tests for deterministic results.
	await truncateAllTables(testDb)
	fileStorageMock._cleanFiles()
})
