import type { AuthRole } from '@repo/db/types'

import type { auth } from './auth-config'

type AuthSession = typeof auth.$Infer.Session

export const formatAuthUserId = Number

export const formatAuthSession = (data: AuthSession) => ({
	session: data.session,
	user: {
		...data.user,
		id: formatAuthUserId(data.user.id),
		// oxlint-disable-next-line typescript/no-unsafe-type-assertion
		role: (data.user.role ?? 'user') as AuthRole,
	},
})
