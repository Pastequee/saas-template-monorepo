import { env } from '@repo/env/server'

import type { app as legacyApp } from './api'
import { app } from './app'

const server = Bun.serve({
	fetch: app.fetch,
	port: env.PORT,
})

console.info(`Server is running on ${server.url}`)

process.on('SIGTERM', () => {
	void server.stop()
	process.exit(0)
})

process.on('SIGINT', () => {
	void server.stop()
	process.exit(0)
})

export type App = typeof legacyApp
export type HostApp = typeof app
