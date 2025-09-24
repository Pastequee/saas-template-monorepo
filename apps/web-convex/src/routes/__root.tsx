/// <reference types="vite/client" />

import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import type { ConvexQueryClient } from '@convex-dev/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

import { AuthProvider } from '~/components/auth/auth-provider'
import { authClient } from '~/lib/auth-client'
import { fetchAuth } from '~/lib/server-fn/fetch-auth'
import { seo } from '~/lib/utils/seo'
import appCss from '~/styles/app.css?url'

export type RootRouteContext = {
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
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
  beforeLoad: async ({ context }) => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const { auth, token } = await fetchAuth()

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token to make HTTP queries with.
    if (token) {
      context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return { auth }
  },
  component: RootComponent,
})

function RootComponent() {
  const { auth, convexQueryClient } = Route.useRouteContext()

  return (
    <ConvexBetterAuthProvider
      authClient={authClient}
      client={convexQueryClient.convexClient}
    >
      <AuthProvider auth={auth}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </AuthProvider>
    </ConvexBetterAuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        {/* <TanStackRouterDevtools position="bottom-right" /> */}
        {/* <ReactQueryDevtools buttonPosition="bottom-left" /> */}
      </body>
    </html>
  )
}
