// oxlint-disable unicorn/no-await-expression-member
// oxlint-disable import/no-mutable-exports
import { mock } from 'bun:test'

import { treaty } from '@elysiajs/eden'
import { createAuth } from '@repo/auth/config'
import type { TestHelpers } from '@repo/auth/config'
import { db } from '@repo/db'
import type { TestDb } from '@repo/db/test'
import { createTestDb, truncateAllTables } from '@repo/db/test'
import type { AuthRole } from '@repo/db/types'
import { fileStorageMock } from '@repo/file-storage/test'

import { app } from '../src/api'

export let testDb: TestDb
export let testAuth: TestAuth
export let adminApi: TestApi
export let userApi: TestApi
export let unauthApi: TestApi

const mockDb = async () => {
	const { testDb: newTestDb } = await createTestDb()

	await mock.module('@repo/db', () => ({
		db: newTestDb,
	}))

	return newTestDb
}

const createApi = () => {
	const { api } = treaty(app)

	return api
}

const createTestUser = async (testUtils: TestHelpers, role: AuthRole) => {
	const user = testUtils.createUser({
		email: `${role.toLowerCase()}@test.com`,
		password: 'test-password',
		role,
	})

	await testUtils.saveUser(user)

	/* Somehow better-auth doesn't return the actual userId but instead a random id string.
	 *  So we need to find the user in the database and return the actual userId.
	 *  This is a workaround to get the actual userId.
	 *  We should probably fix this in better-auth.
	 */
	const dbUser = await db.query.users.findFirst({
		columns: { id: true },
		where: { email: user.email },
	})

	if (!dbUser) {
		throw new Error('User not found in database')
	}

	return { ...user, id: dbUser.id, role }
}

const mockAuth = async () => {
	const newTestAuth = createAuth()

	await mock.module('@repo/auth/config', () => ({ auth: newTestAuth, default: newTestAuth }))

	const ctx = await newTestAuth.$context

	const admin = await createTestUser(ctx.test, 'admin')
	const user = await createTestUser(ctx.test, 'user')

	return { client: newTestAuth, testUtils: ctx.test, users: { admin, user } }
}

const createApiWithAuth = async (testUtils: TestHelpers, userId: number) => {
	const headers = await testUtils.getAuthHeaders({ userId: userId.toString() })

	const api = treaty(app, { headers })

	// oxlint-disable-next-line typescript/return-await
	return api
}

const mockFileStorage = async () => {
	await mock.module('@repo/file-storage', () => ({
		fileStorage: fileStorageMock,
	}))
}

export const setupTestEnvironment = async () => {
	testDb = await mockDb()
	testAuth = await mockAuth()
	await mockFileStorage()

	adminApi = (await createApiWithAuth(testAuth.testUtils, testAuth.users.admin.id)).api
	userApi = (await createApiWithAuth(testAuth.testUtils, testAuth.users.user.id)).api
	unauthApi = createApi()

	return { adminApi, testAuth, testDb, unauthApi, userApi }
}

export const cleanupTestEnvironment = async () => {
	fileStorageMock._cleanFiles()
	await truncateAllTables(testDb)
}

export type TestApi = Awaited<ReturnType<typeof createApiWithAuth>>['api']
export type TestAuth = Awaited<ReturnType<typeof mockAuth>>
