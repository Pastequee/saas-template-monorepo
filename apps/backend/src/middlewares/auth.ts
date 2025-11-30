import { auth } from '@repo/auth'
import { typedObjectKeys } from '@repo/utils'
import { Elysia } from 'elysia'

// user middleware (compute user and session and pass to routes)
export const betterAuth = new Elysia({ name: 'better-auth' }).macro({
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
