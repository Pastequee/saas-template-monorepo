import { ConvexQueryClient } from '@convex-dev/react-query'
import { notifyManager, QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { env } from './lib/env'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  const convex = new ConvexReactClient(env.VITE_CONVEX_URL, {
    expectAuth: true,
  })

  const convexQueryClient = new ConvexQueryClient(convex)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })

  convexQueryClient.connect(queryClient)

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { convexQueryClient, queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0, // Let React Query handle all caching
    defaultErrorComponent: (err) => <div>{err.error.message}</div>,
    defaultNotFoundComponent: () => <div>Not found</div>,
    Wrap: ({ children }) => (
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    ),
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: need interface here
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
