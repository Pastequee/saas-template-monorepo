import { env } from '@repo/env/server'

import { app } from './api'

app.listen(env.PORT, ({ url }) => {
	console.info(`Server is running on ${url}`)

	process.on('SIGTERM', () => {
		void app.stop().finally(() => {
			process.exit(0)
		})
	})

	process.on('SIGINT', () => {
		void app.stop().finally(() => {
			process.exit(0)
		})
	})
})

export type App = typeof app
