import { treaty } from '@elysiajs/eden'
import { auth } from '@repo/auth'
import { db } from '@repo/db'
import type { AuthRole } from '@repo/db/types'
import { typedObjectEntries } from '@repo/utils'
import { app } from '../src'

type TestUser = { id: string; email: string; name: string; role: AuthRole; password: string }

export const testUsers: Record<'admin' | 'user', TestUser> = {
	admin: {
		id: '1',
		email: 'admin@test.com',
		name: 'Admin',
		role: 'admin',
		password: 'test-admin-password',
	},
	user: {
		id: '2',
		email: 'user@test.com',
		name: 'User',
		role: 'user',
		password: 'test-user-password',
	},
}

export const createApi = () => {
	const api = treaty(app).api

	return api
}

export const createApiWithAuth = async (testUser: TestUser) => {
	const res = await auth.api.signInEmail({
		body: { email: testUser.email, password: testUser.password },
		asResponse: true,
	})

	const betterAuthCookie = res.headers.get('set-cookie')?.split(';')[0]

	const api = treaty(app, { headers: { Cookie: betterAuthCookie } })

	return await Promise.resolve(api)
}

export const createTestUsers = async () => {
	const existingUsers = await db.query.users.findMany()

	await Promise.all(
		typedObjectEntries(testUsers).map(async ([_, value]) => {
			const existingUser = existingUsers.find((u) => u.email === value.email)
			if (existingUser) {
				value.id = existingUser.id
			} else {
				const { user } = await auth.api.createUser({
					body: value,
				})
				value.id = user.id
			}
		})
	)
}

export type TestUsers = Awaited<ReturnType<typeof createTestUsers>>
