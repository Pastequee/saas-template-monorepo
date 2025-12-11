import { auth } from '@repo/auth'
import { UserRole } from '@repo/db/types'
import { type TypedExclude, typedObjectKeys } from '@repo/utils'
import { Elysia } from 'elysia'

const isValidRole = (role: string | null | undefined): role is UserRole => {
	if (!role) return false
	return UserRole.includes(role as UserRole)
}

export const betterAuth = new Elysia({ name: 'better-auth' })
	.macro('auth', {
		resolve: async ({ status, request: { headers } }) => {
			const session = await auth.api.getSession({ headers })

			if (!session || !isValidRole(session.user.role)) return status(401)

			return {
				user: {
					...session.user,
					role: session.user.role as UserRole, // Need to help type inference here
				},
				session: session.session,
			}
		},
	})
	.macro('role', (askedRole: UserRole | TypedExclude<UserRole, 'admin'>[]) => ({
		resolve: async ({ status, request: { headers } }) => {
			const session = await auth.api.getSession({ headers })

			if (!session || !isValidRole(session.user.role)) return status(401)

			const context = {
				user: { ...session.user, role: session.user.role as UserRole },
				session: session.session,
			}

			// Admin has all permissions
			if (session.user.role === 'admin') return context

			const askedRoles = Array.isArray(askedRole) ? askedRole : [askedRole]

			// Check if the user has the asked role
			if (askedRoles.some((role) => role === session.user.role)) return context

			return status(403)
		},
	}))
// Not working for now becuase of type bug in Elysia
// .macro({
// 	role: (askedRole: Role | TypedExclude<Role, 'superadmin' | 'admin'>[]) => ({
// 		auth: true,
// 		resolve: ({ user, status }) => {
// 			// Superadmin has all permissions
// 			if (user.role === 'superadmin') return

// 			// Admin has all permissions except superadmin specific permissions
// 			if (user.role === 'admin' && askedRole !== 'superadmin') return

// 			const askedRoles = Array.isArray(askedRole) ? askedRole : [askedRole]

// 			// Check if the user has the asked role
// 			if (askedRoles.some((role) => role === user.role)) return

// 			return status(403)
// 		},
// 	}),
// })

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
const getSchema = () => {
	_schema = _schema ?? auth.api.generateOpenAPISchema()
	return _schema
}

export const AuthOpenAPI = {
	getPaths: (prefix = '/auth') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null)

			for (const path of Object.keys(paths)) {
				const key = prefix + path
				const pathObject = paths[path]
				if (!pathObject) continue
				reference[key] = pathObject

				for (const method of typedObjectKeys(pathObject)) {
					const operation = pathObject[method]
					if (!operation) continue

					operation.tags = ['Better Auth']
				}
			}

			return reference
			// biome-ignore lint/suspicious/noExplicitAny: need
		}) as Promise<any>,
	// biome-ignore lint/suspicious/noExplicitAny: need
	components: getSchema().then(({ components }) => components) as Promise<any>,
} as const

export const authMacro = new Elysia({ name: 'better-auth' }).mount(auth.handler).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({
				headers,
			})

			if (!session) return status(401)

			return {
				user: session.user,
				session: session.session,
			}
		},
	},
})
