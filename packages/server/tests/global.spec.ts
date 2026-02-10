import { beforeEach, describe, expect, it } from 'bun:test'
import { createApi, createApiWithAuth, createTestUsers, type TestUsers } from './utils'

describe('Global', () => {
	const api = createApi()
	let users: TestUsers

	beforeEach(async () => {
		users = await createTestUsers()
	})

	it('Root endpoint works', async () => {
		const rootResponse = await api.get()

		expect(rootResponse.status).toBe(200)
		expect(rootResponse.data).toBe('Backend API')
	})

	it('Health endpoint works', async () => {
		const healthResponse = await api.health.get()

		expect(healthResponse.status).toBe(200)
		expect(healthResponse.data?.status).toBe('healthy')
	})

	it('Private health endpoint works', async () => {
		const privateHealthResponse = await api.health.private.get()

		expect(privateHealthResponse.status).toBe(200)
		expect(privateHealthResponse.data?.status).toBe('healthy')
		expect(privateHealthResponse.data?.database).toBe('healthy')
	})

	it('404 endpoint works', async () => {
		// @ts-expect-error - This is a test of an unknown endpoint
		const notFoundResponse = await api.notFound.get()

		expect(notFoundResponse.status).toBe(404)
	})

	it('Mock auth setup works', async () => {
		const adminApi = (await createApiWithAuth(users.admin)).api
		const adminMeResponse = await adminApi.me.get()

		expect(adminMeResponse.status).toBe(200)
		expect(adminMeResponse.data?.user?.id).toBe(users.admin.id)

		const normalApi = (await createApiWithAuth(users.normal)).api
		const normalMeResponse = await normalApi.me.get()

		expect(normalMeResponse.status).toBe(200)
		expect(normalMeResponse.data?.user?.id).toBe(users.normal.id)
	})
})
