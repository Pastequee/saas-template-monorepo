import Elysia from 'elysia'
import { betterAuth } from '#middlewares/auth'

export const userRouter = new Elysia({ name: 'user', tags: ['User'] })
	.use(betterAuth)
	.get('/me', ({ user, session }) => ({ user, session }), { auth: true })
