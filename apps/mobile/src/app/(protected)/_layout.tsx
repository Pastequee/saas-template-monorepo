import { Redirect, Stack, usePathname } from 'expo-router'
import { View } from 'react-native'

import { ImpersonationBanner } from '~/components/layout/impersonation-banner'
import { LoadingState } from '~/components/ui/states'
import { useAuth } from '~/lib/auth/use-auth'

export default function ProtectedLayout() {
	const auth = useAuth()
	const pathname = usePathname()

	if (auth.isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<LoadingState label="Chargement de votre session..." />
			</View>
		)
	}

	if (!auth.isAuthenticated) {
		return <Redirect href={`/login?redirect=${encodeURIComponent(pathname)}`} />
	}

	return (
		<View className="flex-1 bg-background">
			<ImpersonationBanner />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="listing/[id]" />
				<Stack.Screen name="listing/new" options={{ presentation: 'modal' }} />
			</Stack>
		</View>
	)
}
