import { MutationCache, QueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'

import { getRouter } from '~/router'

import { authClient } from './auth-client'

declare module '@tanstack/react-query' {
	// oxlint-disable-next-line typescript/consistent-type-definitions
	interface Register {
		mutationMeta: {
			invalidate?: QueryKey[]
		}
	}
}

export const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 60 * 1000 } },
	mutationCache: new MutationCache({
		onError: (error: unknown) => {
			if (
				typeof error === 'object' &&
				error !== null &&
				'status' in error &&
				typeof error.status === 'number' &&
				error.status === 401
			) {
				authClient.signOut()
				const router = getRouter()
				router.navigate({ to: '/login' })
			}
		},
		onSettled: async (_data, _variables, _error, _mutate, _mutation, context) => {
			await Promise.all(
				context.meta?.invalidate?.map((queryKey) =>
					context.client.invalidateQueries({ queryKey })
				) ?? []
			)
		},
	}),
})
