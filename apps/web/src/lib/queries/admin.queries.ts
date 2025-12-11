import type { UserRole } from '@repo/db/types'
import type { Prettify } from '@repo/utils'
import { queryOptions } from '@tanstack/react-query'
import type { UserWithRole as BetterAuthUserWithRole } from 'better-auth/plugins'
import { authClient } from '~/lib/clients/auth-client'
import { keys } from './keys'

export const adminUsersOptions = () =>
	queryOptions({
		queryKey: keys.admin.users.list(),
		queryFn: async () => {
			const { data, error } = await authClient.admin.listUsers({ query: {} })

			if (error) {
				throw new Error(error.message ?? 'Failed to fetch users')
			}

			return data.users as UserWithRole[]
		},
	})

export type UserWithRole = Prettify<
	BetterAuthUserWithRole & {
		role: UserRole
	}
>
