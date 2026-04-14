import { Text, View } from 'react-native'

import { useAuth } from '~/lib/auth/use-auth'

export function ImpersonationBanner() {
	const auth = useAuth()

	if (!auth.isAuthenticated || !auth.session?.impersonatedBy) {
		return null
	}

	return (
		<View className="border-amber-300 bg-amber-400/90 px-4 py-3">
			<Text className="font-medium text-amber-950 text-sm">
				Vous etes en mode impersonation pour {auth.user?.name ?? 'cet utilisateur'}.
			</Text>
		</View>
	)
}
