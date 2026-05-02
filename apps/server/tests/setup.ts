import { beforeAll, beforeEach } from 'bun:test'

import { setupTestEnvironment, cleanupTestEnvironment } from './utils'

beforeAll(async () => {
	await setupTestEnvironment()
})

beforeEach(async () => {
	await cleanupTestEnvironment()
})
