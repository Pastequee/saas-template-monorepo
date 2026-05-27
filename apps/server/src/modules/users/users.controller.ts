import { Elysia } from 'elysia'

import type { AppDeps } from '#deps'
import { createAuthMacro } from '#lib/auth.macros'

export const createUserRouter = (deps: AppDeps) =>
	new Elysia({ name: 'user', tags: ['User'] })
		.use(createAuthMacro(deps))
		.get('/me', ({ user, session }) => ({ session, user }), { auth: true })
