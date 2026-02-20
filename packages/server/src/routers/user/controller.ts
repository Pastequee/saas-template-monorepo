import { Elysia } from 'elysia'

import { authMacro } from '#lib/auth'

export const userRouter = new Elysia({ name: 'user', tags: ['User'] })
	.use(authMacro)
	.get('/me', ({ user, session }) => ({ session, user }), { auth: true })
