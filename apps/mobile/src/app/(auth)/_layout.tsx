import { Redirect, Stack } from 'expo-router'
import { View } from 'react-native'

import { LoadingState } from '~/components/ui/states'
import { useAuth } from '~/lib/auth/use-auth'

export default function AuthLayout() {
	const auth = useAuth()

	if (auth.isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<LoadingState label="Verification de session..." />
			</View>
		)
	}

	if (auth.isAuthenticated) {
		return <Redirect href="/" />
	}

	return <Stack screenOptions={{ headerShown: false }} />
}
