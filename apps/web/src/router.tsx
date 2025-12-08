import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { queryClient } from './lib/clients/query-client'
import { routeTree } from './routeTree.gen'

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		defaultPreload: false,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0, // Let React Query handle all caching
		defaultErrorComponent: (err) => <div>{err.error.message}</div>,
		defaultNotFoundComponent: () => <div>Not found</div>,
		Wrap: ({ children }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		),
	})

	return router
}

declare module '@tanstack/react-router' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: need interface here
	interface Register {
		router: ReturnType<typeof getRouter>
	}
}
