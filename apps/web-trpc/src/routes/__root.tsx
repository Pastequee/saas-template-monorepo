/// <reference types="vite/client" />

import type { AppRouter } from '@repo/backend-trpc'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { AuthProvider } from '~/components/auth/auth-provider'
import { fetchAuth } from '~/lib/server-fn/fetch-auth'
import { seo } from '~/lib/utils/seo'
import appCss from '~/styles/app.css?url'

export type RootRouteContext = {
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<AppRouter>
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'TanStack Start, tRPC and better-auth starter',
        description: 'A starter for TanStack Start, tRPC and better-auth',
        keywords: 'tanstack, trpc, better-auth, starter',
        image: 'https://tanstack.com/assets/splash-light-CHqMsyq8.png',
      }),
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async () => {
    const { auth } = await fetchAuth()

    return { auth }
  },
  component: RootDocument,
})

function RootDocument() {
  const { auth } = Route.useRouteContext()

  return (
    <AuthProvider auth={auth}>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <Scripts />
          {/* <TanStackRouterDevtools position="bottom-right" /> */}
          {/* <ReactQueryDevtools buttonPosition="bottom-left" /> */}
        </body>
      </html>
    </AuthProvider>
  )
}
