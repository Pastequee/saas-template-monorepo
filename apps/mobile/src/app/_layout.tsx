import { QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { FlashMessageProvider } from '~/components/ui/flash-message'
import { authClient } from '~/lib/auth/auth-client'
import { setUnauthorizedHandler } from '~/lib/api/request'
import { queryClient, setupReactQueryNative } from '~/lib/query/query-client'

import '~/global.css'

function AuthSessionBootstrap() {
	authClient.useSession()
	return null
}

export default function RootLayout() {
	const router = useRouter()

	useEffect(() => setupReactQueryNative(), [])

	useEffect(() => {
		setUnauthorizedHandler(async () => {
			queryClient.clear()
			await authClient.signOut().catch(() => undefined)
			router.replace('/login')
		})

		return () => {
			setUnauthorizedHandler(null)
		}
	}, [router])

	return (
		<GestureHandlerRootView className="flex-1">
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<FlashMessageProvider>
						<AuthSessionBootstrap />
						<StatusBar style="dark" />
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(auth)" />
							<Stack.Screen name="(protected)" />
						</Stack>
					</FlashMessageProvider>
				</QueryClientProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}
