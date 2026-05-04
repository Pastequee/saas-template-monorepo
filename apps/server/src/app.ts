import { auth } from '@repo/auth/config'
import { db, sql } from '@repo/db'
import { env } from '@repo/env/server'
import { tryCatch } from '@repo/utils'
import { Context, Effect } from 'effect'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { app as legacyApp } from './api'
import { CurrentRequestAuth, resolveRequestAuth } from './lib/request-auth'
import { hostRpcWebHandler } from './rpc/host.rpc'

export const app = new Hono()

app.use(
	'/api/*',
	cors({
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
		credentials: true,
		origin: env.WEB_URL,
	})
)

app.get('/api', (c) => c.text('Application API'))

app.get('/api/health', async (c) => {
	const [, error] = await tryCatch(db.execute(sql`SELECT 1`))
	const dbStatus = error ? ('unhealthy' as const) : ('healthy' as const)

	return c.json({
		commitHash: env.COMMIT_HASH,
		database: dbStatus,
		environment: env.NODE_ENV,
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
	})
})

app.on(['GET', 'POST'], '/api/auth/*', async (c) => auth.handler(c.req.raw))
app.post('/api/rpc', async (c) => {
	const requestAuth = await Effect.runPromise(resolveRequestAuth(c.req.raw.headers))

	return hostRpcWebHandler.handler(c.req.raw, Context.make(CurrentRequestAuth, requestAuth))
})

app.all('/api/*', async (c) => legacyApp.handle(c.req.raw))
