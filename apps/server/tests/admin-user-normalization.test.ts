import { describe, expect, it } from 'bun:test'

import { normalizeAdminUserList, stringifyAuthId } from '@repo/auth/admin-users'

describe('admin user normalization', () => {
	it('normalizes admin query ids for app code while preserving plugin fields', () => {
		const [user] = normalizeAdminUserList([
			{
				banned: false,
				createdAt: new Date(),
				email: 'admin@test.com',
				id: '7',
				impersonatedBy: '3',
				name: 'Admin',
				role: 'admin',
			},
		])
		if (!user) {
			throw new Error('Expected normalized admin user')
		}

		expect(Number(user.id)).toBe(7)
		expect(user.role).toBe('admin')
		expect(user.impersonatedBy).toBe('3')
	})

	it('stringifies numeric ids at the Better Auth admin boundary', () => {
		expect(stringifyAuthId(9)).toBe('9')
		expect(stringifyAuthId('9')).toBe('9')
	})
})
