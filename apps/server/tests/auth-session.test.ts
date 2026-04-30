import { describe, expect, it } from 'bun:test'

import { normalizeAuthSession } from '@repo/auth/auth-session'

describe('auth session normalization', () => {
	it('normalizes numeric ids including impersonation metadata', () => {
		const auth = normalizeAuthSession({
			session: {
				expiresAt: new Date(),
				id: '9',
				impersonatedBy: '3',
				token: 'token',
				userId: '4',
			},
			user: {
				createdAt: new Date(),
				email: 'user@test.com',
				id: '4',
				role: 'admin',
			},
		})

		expect(auth.user.id).toBe(4)
		expect(auth.session.id).toBe(9)
		expect(auth.session.userId).toBe(4)
		expect(auth.session.impersonatedBy).toBe(3)
	})
})
