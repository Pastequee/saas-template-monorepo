import {
	focusManager,
	MutationCache,
	onlineManager,
	QueryClient,
	type QueryKey,
} from '@tanstack/react-query'
import * as Network from 'expo-network'
import { AppState } from 'react-native'

declare module '@tanstack/react-query' {
	interface Register {
		mutationMeta: {
			invalidate?: QueryKey[]
		}
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			staleTime: 60 * 1000,
		},
	},
	mutationCache: new MutationCache({
		onSettled: async (_data, _variables, _error, _mutate, _mutation, context) => {
			await Promise.all(
				context.meta?.invalidate?.map((queryKey) =>
					context.client.invalidateQueries({ queryKey })
				) ?? []
			)
		},
	}),
})

let hasSetup = false

export const setupReactQueryNative = () => {
	if (hasSetup) {
		return () => undefined
	}

	hasSetup = true

	onlineManager.setEventListener((setOnline) => {
		const subscription = Network.addNetworkStateListener((state) => {
			setOnline(state.isConnected ?? true)
		})

		return () => subscription.remove()
	})

	const subscription = AppState.addEventListener('change', (status) => {
		focusManager.setFocused(status === 'active')
	})

	return () => {
		subscription.remove()
		hasSetup = false
	}
}
