import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { queryClient } from './lib/clients/query-client'
import { routeTree } from './routeTree.gen'

export function getRouter() {
	// oxlint-disable-next-line sort-keys
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: false,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: (err) => <div>{err.error.message}</div>,
		defaultNotFoundComponent: () => <div>Not found</div>,
		Wrap: ({ children }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	})

	return router
}

declare module '@tanstack/react-router' {
	// oxlint-disable-next-line typescript/consistent-type-definitions
	interface Register {
		router: ReturnType<typeof getRouter>
	}
}
