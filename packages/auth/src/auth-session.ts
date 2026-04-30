import { AuthRole } from '@repo/db/types'
import type { AuthRole as AuthRoleType } from '@repo/db/types'
import { coercePositiveInt, normalizeOptionalPositiveInt } from '@repo/utils'

type AuthId = number | string

type AuthSessionLike = {
	id: AuthId
	impersonatedBy?: AuthId | null
	userId: AuthId
}

type AuthUserLike = {
	id: AuthId
	role?: string | null
}

type NormalizedSession<TSession extends AuthSessionLike> = Omit<
	TSession,
	'id' | 'impersonatedBy' | 'userId'
> & {
	id: number
	impersonatedBy?: number | null
	userId: number
}

type NormalizedUser<TUser extends AuthUserLike> = Omit<TUser, 'id' | 'role'> & {
	id: number
	role: AuthRoleType
}

const isAuthRole = (value: string): value is AuthRoleType => AuthRole.some((role) => role === value)

export const normalizeAuthId = (value: AuthId) => coercePositiveInt(value, 'auth id')

export const stringifyAuthId = (value: AuthId) => String(normalizeAuthId(value))

export const normalizeOptionalAuthId = (value: AuthId | null | undefined) =>
	normalizeOptionalPositiveInt(value, 'auth id')

export const normalizeAuthSession = <
	TSession extends AuthSessionLike,
	TUser extends AuthUserLike,
>(auth: {
	session: TSession
	user: TUser
}): { session: NormalizedSession<TSession>; user: NormalizedUser<TUser> } => ({
	session: {
		...auth.session,
		id: normalizeAuthId(auth.session.id),
		impersonatedBy: normalizeOptionalAuthId(auth.session.impersonatedBy),
		userId: normalizeAuthId(auth.session.userId),
	} satisfies NormalizedSession<TSession>,
	user: {
		...auth.user,
		id: normalizeAuthId(auth.user.id),
		role: auth.user.role && isAuthRole(auth.user.role) ? auth.user.role : 'user',
	} satisfies NormalizedUser<TUser>,
})
