import { treaty } from '@elysiajs/eden'
import type { Treaty } from '@elysiajs/eden'
import { env } from '@repo/env/web'
import type { App } from '@repo/server'
import { createIsomorphicFn } from '@tanstack/react-start'

export const eden = createIsomorphicFn()
	.server(() => treaty<App>(env.VITE_SERVER_URL).api)
	.client(() => treaty<App>(env.VITE_SERVER_URL).api)

export type Eden = Treaty.Create<App>['api']
