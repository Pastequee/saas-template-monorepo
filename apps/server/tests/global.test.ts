import { describe, expect, it } from 'bun:test'

import { adminApi, testAuth, unauthApi, userApi } from './utils'

describe('Global', async () => {
	it('Root endpoint works', async () => {
		const rootResponse = await unauthApi.get()

		expect(rootResponse.status).toBe(200)
		expect(rootResponse.data).toBe('Application API')
	})

	it('Health endpoint works', async () => {
		const healthResponse = await unauthApi.health.get()

		expect(healthResponse.status).toBe(200)
		expect(healthResponse.data?.database).toBe('healthy')
		expect(healthResponse.data?.environment).toBe('test')
		expect(healthResponse.data?.status).toBe('healthy')
	})

	it('404 endpoint works', async () => {
		// @ts-expect-error - This is a test of an unknown endpoint
		// oxlint-disable-next-line no-unsafe-assignment no-unsafe-member-access no-unsafe-call
		const notFoundResponse = await unauthApi.notFound.get()

		// oxlint-disable-next-line no-unsafe-member-access
		expect(notFoundResponse.status).toBe(404)
	})

	it('Mock auth setup works', async () => {
		const adminMeResponse = await adminApi.me.get()

		expect(adminMeResponse.status).toBe(200)
		expect(adminMeResponse.data?.user?.id).toBe(testAuth.users.admin.id)

		const normalMeResponse = await userApi.me.get()

		expect(normalMeResponse.status).toBe(200)
		expect(normalMeResponse.data?.user?.id).toBe(testAuth.users.user.id)
	})
})
