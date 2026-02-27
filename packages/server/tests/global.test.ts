// oxlint-disable unicorn/no-await-expression-member
import { beforeAll, describe, expect, it } from 'bun:test'

import { createApi, createApiWithAuth, createTestUsers, testUsers } from './utils'

describe('Global', () => {
	const api = createApi()

	beforeAll(async () => {
		await createTestUsers()
	})

	it('Root endpoint works', async () => {
		const rootResponse = await api.get()

		expect(rootResponse.status).toBe(200)
		expect(rootResponse.data).toBe('Application API')
	})

	it('Health endpoint works', async () => {
		const healthResponse = await api.health.get()

		expect(healthResponse.status).toBe(200)
		expect(healthResponse.data?.database).toBe('healthy')
		expect(healthResponse.data?.environment).toBe('test')
		expect(healthResponse.data?.status).toBe('healthy')
	})

	it('404 endpoint works', async () => {
		// @ts-expect-error - This is a test of an unknown endpoint
		const notFoundResponse = await api.notFound.get()

		expect(notFoundResponse.status).toBe(404)
	})

	it('Mock auth setup works', async () => {
		const adminApi = (await createApiWithAuth(testUsers.admin)).api
		const adminMeResponse = await adminApi.me.get()

		expect(adminMeResponse.status).toBe(200)
		expect(adminMeResponse.data?.user?.id).toBe(testUsers.admin.id)

		const normalApi = (await createApiWithAuth(testUsers.user)).api
		const normalMeResponse = await normalApi.me.get()

		expect(normalMeResponse.status).toBe(200)
		expect(normalMeResponse.data?.user?.id).toBe(testUsers.user.id)
	})
})
