import { treaty } from '@elysiajs/eden'
import { auth } from '@repo/auth'
import { app } from '../src'

const testUsers = [
	{
		email: 'admin@test.com',
		name: 'Admin',
		role: 'admin',
		password: 'test-admin-password',
	},
	{
		email: 'user@test.com',
		name: 'User',
		role: 'user',
		password: 'test-user-password',
	},
] as const

export const createApi = () => {
	const api = treaty(app).api

	return api
}

export const createApiWithAuth = async (user: { email: string }) => {
	const testUser = testUsers.find((u) => u.email === user.email)

	if (!testUser) {
		throw new Error(`User with email ${user.email} not found`)
	}

	const res = await auth.api.signInEmail({
		body: { email: testUser.email, password: testUser.password },
		asResponse: true,
	})

	const betterAuthCookie = res.headers.get('set-cookie')?.split(';')[0]

	const api = treaty(app, { headers: { Cookie: betterAuthCookie } })

	return await Promise.resolve(api)
}

export const createTestUsers = async () => {
	const { user: admin } = await auth.api.createUser({
		body: testUsers[0],
	})

	const { user: normal } = await auth.api.createUser({
		body: testUsers[1],
	})

	return { admin, normal }
}

export type TestUsers = Awaited<ReturnType<typeof createTestUsers>>
