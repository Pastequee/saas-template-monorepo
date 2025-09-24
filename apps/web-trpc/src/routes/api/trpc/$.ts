import { auth } from '@repo/auth'
import { appRouter, createTRPCContext } from '@repo/backend-trpc'
import { createFileRoute } from '@tanstack/react-router'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        auth,
        headers: request.headers,
      }),
    onError({ path, error }) {
      // biome-ignore lint/suspicious/noConsole: want to log errors
      console.error(`>>> tRPC Error on '${path}'`, error)
    },
  })
}

function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  })

  return response
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
      OPTIONS,
    },
  },
})
