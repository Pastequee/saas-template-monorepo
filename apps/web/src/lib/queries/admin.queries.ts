import type { Prettify } from '@repo/utils'
import { queryOptions } from '@tanstack/react-query'
import type { UserWithRole as BetterAuthUserWithRole } from 'better-auth/plugins'

import { authClient } from '~/lib/clients/auth-client'

import { normalizeAdminUserList } from '../../../../../packages/auth/src/admin-users'
import type { NormalizedAdminUser } from '../../../../../packages/auth/src/admin-users'
import { keys } from './keys'

export const adminUsersOptions = () =>
	queryOptions({
		queryFn: async () => {
			const { data, error } = await authClient.admin.listUsers({ query: {} })

			if (error) {
				throw new Error(error.message ?? 'Failed to fetch users')
			}

			return normalizeAdminUserList(data.users)
		},
		queryKey: keys.admin.users.list(),
	})

export type UserWithRole = Prettify<NormalizedAdminUser<BetterAuthUserWithRole>>
