import type { AppRouter } from '@repo/backend-trpc'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { toast } from 'sonner'
import SuperJson from 'superjson'
import { TRPCProvider } from './lib/trpc'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries()
          },
        },
      })
    },
  }),
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
})

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        import.meta.env.DEV ||
        (op.direction === 'down' && op.result instanceof Error),
    }),
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        const headers = new Headers()
        headers.set('x-trpc-source', 'tanstack-start-client')
        return headers
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
      transformer: SuperJson,
    }),
  ],
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
})

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { queryClient, trpc },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0, // Let React Query handle all caching
    defaultErrorComponent: (err) => <div>{err.error.message}</div>,
    defaultNotFoundComponent: () => <div>Not found</div>,
    Wrap: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
          {children}
        </TRPCProvider>
      </QueryClientProvider>
    ),
  })

  return router
}

declare module '@tanstack/react-router' {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: need interface here
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
