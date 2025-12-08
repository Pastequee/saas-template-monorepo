/// <reference types="vite/client" />

import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import appCss from '~/assets/styles/app.css?url'
import { ImpersonationBanner } from '~/components/admin/impersonation-banner'
import { ThemeProvider } from '~/lib/clients/theme-client'
import { fetchAuth } from '~/lib/server-fn/fetch-auth'
import { seo } from '~/lib/utils/seo'

export type RootRouteContext = {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			...seo({
				title: 'TanStack Start, Elysia and better-auth starter',
				description: 'A starter for TanStack Start, Elysia and better-auth',
				keywords: 'tanstack, elysia, better-auth, starter',
				image: 'https://tanstack.com/assets/splash-light-CHqMsyq8.png',
			}),
		],
		links: [{ rel: 'stylesheet', href: appCss }],
	}),
	beforeLoad: async () => {
		const auth = await fetchAuth()

		return { auth }
	},
	component: RootDocument,
})

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ImpersonationBanner />
				<Outlet />
				<ThemeProvider />
				<Scripts />
				<TanStackDevtools
					plugins={[
						{ name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
						{ name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
						{ name: 'TanStack Form', render: <FormDevtoolsPanel /> },
					]}
				/>
			</body>
		</html>
	)
}
