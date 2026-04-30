import { AuthRole } from '@repo/db/types'
import type { AuthRole as AuthRoleType } from '@repo/db/types'

import { normalizeAuthId, stringifyAuthId } from './auth-session'

type AdminUserLike = {
	id: number | string
	role?: string | null
}

export type NormalizedAdminUser<TUser extends AdminUserLike> = Omit<TUser, 'id' | 'role'> & {
	id: number
	role: AuthRoleType
}

const isAuthRole = (value: string): value is AuthRoleType => AuthRole.some((role) => role === value)

export const normalizeAdminUser = <TUser extends AdminUserLike>(user: TUser) =>
	({
		...user,
		id: normalizeAuthId(user.id),
		role: user.role && isAuthRole(user.role) ? user.role : 'user',
	}) satisfies NormalizedAdminUser<TUser>

export const normalizeAdminUserList = <TUser extends AdminUserLike>(users: TUser[]) =>
	users.map((user) => normalizeAdminUser(user))

export { stringifyAuthId }
