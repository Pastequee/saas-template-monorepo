// oxlint-disable unicorn/no-await-expression-member
// oxlint-disable import/no-mutable-exports
import { treaty } from '@elysiajs/eden'
import { createAuth } from '@repo/auth/config'
import type { TestHelpers } from '@repo/auth/config'
import type { TestDb } from '@repo/db/test'
import { createTestDb, truncateAllTables } from '@repo/db/test'
import type { AuthRole } from '@repo/db/types'
import { env } from '@repo/env/server'
import { fileStorageMock } from '@repo/file-storage/test'

import { createApp } from '../src/api'
import type { AppDeps } from '../src/deps'

export let testDb: TestDb
export let testAuth: TestAuth
export let adminApi: TestApi
export let userApi: TestApi
export let unauthApi: TestApi

const mailMock = {
	send: async () => {
		await Promise.resolve()
	},
	sendTemplate: async () => {
		await Promise.resolve()
	},
}

const createApi = (deps: AppDeps) => {
	const { api } = treaty(createApp(deps))

	return api
}

const createTestUser = async (db: TestDb, testUtils: TestHelpers, role: AuthRole) => {
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

const createTestDeps = async () => {
	const { testDb: newTestDb } = await createTestDb()
	const newTestAuth = createAuth({
		db: newTestDb,
		env,
		mail: mailMock,
	})

	const ctx = await newTestAuth.$context

	const admin = await createTestUser(newTestDb, ctx.test, 'admin')
	const user = await createTestUser(newTestDb, ctx.test, 'user')

	const deps = {
		auth: newTestAuth,
		db: newTestDb,
		env,
		fileStorage: fileStorageMock,
	} satisfies AppDeps

	return {
		deps,
		testAuth: { client: newTestAuth, testUtils: ctx.test, users: { admin, user } },
		testDb: newTestDb,
	}
}

const createApiWithAuth = async (
	app: ReturnType<typeof createApp>,
	testUtils: TestHelpers,
	userId: number
) => {
	const headers = await testUtils.getAuthHeaders({ userId: userId.toString() })

	const api = treaty(app, { headers })

	// oxlint-disable-next-line typescript/return-await
	return api
}

export const setupTestEnvironment = async () => {
	const testDeps = await createTestDeps()
	const { testAuth: newTestAuth, testDb: newTestDb } = testDeps
	const app = createApp(testDeps.deps)

	testDb = newTestDb
	testAuth = newTestAuth

	adminApi = (await createApiWithAuth(app, testAuth.testUtils, testAuth.users.admin.id)).api
	userApi = (await createApiWithAuth(app, testAuth.testUtils, testAuth.users.user.id)).api
	unauthApi = treaty(app).api

	return { adminApi, testAuth, testDb, unauthApi, userApi }
}

export const cleanupTestEnvironment = async () => {
	fileStorageMock._cleanFiles()
	await truncateAllTables(testDb)
}

export type TestApi = ReturnType<typeof createApi>
export type TestAuth = Awaited<ReturnType<typeof createTestDeps>>['testAuth']
