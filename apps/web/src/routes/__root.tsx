/// <reference types="vite/client" />

import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ImpersonationBanner } from '~/components/routes/admin/impersonation-banner'
import { fetchAuth } from '~/lib/server-fn/fetch-auth'
import { seo } from '~/lib/utils/seo'

import appCss from '~/assets/styles/app.css?url'

export type RootRouteContext = {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
	beforeLoad: async () => {
		const auth = await fetchAuth()

		return { auth }
	},
	component: RootDocument,
	head: () => ({
		links: [{ href: appCss, rel: 'stylesheet' }],
		meta: [
			{ charSet: 'utf8' },
			{ content: 'width=device-width, initial-scale=1', name: 'viewport' },
			...seo({
				description: 'A starter for TanStack Start, Elysia and better-auth',
				image: 'https://tanstack.com/assets/splash-light-CHqMsyq8.png',
				keywords: 'tanstack, elysia, better-auth, starter',
				title: 'TanStack Start, Elysia and better-auth starter',
			}),
		],
	}),
})

function RootDocument() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-screen flex-col leading-none">
				<ImpersonationBanner />
				<Outlet />
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
