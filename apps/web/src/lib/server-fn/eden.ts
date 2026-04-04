import { treaty } from '@elysiajs/eden'
import type { Treaty } from '@elysiajs/eden'
import { env } from '@repo/env/web'
import type { App } from '@repo/server'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export const eden = createIsomorphicFn()
	.server(
		() =>
			treaty<App>(env.SERVER_URL, {
				onRequest: () => {
					const cookies = getRequest().headers.get('Cookie')
					return { headers: { Cookie: cookies ?? '' } }
				},
			}).api
	)
	.client(
		() =>
			treaty<App>(env.VITE_SERVER_URL, {
				fetch: { credentials: 'include' },
			}).api
	)

export type Eden = Treaty.Create<App>['api']
