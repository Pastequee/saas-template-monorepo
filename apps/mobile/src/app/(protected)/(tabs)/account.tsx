import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ScrollView, View } from 'react-native'

import { AccountInfoSection } from '~/components/account/account-info-section'
import { AppShellHeader } from '~/components/layout/app-shell-header'
import { ListingList } from '~/components/listings/listing-list'
import { Button } from '~/components/ui/button'
import { InlineAlert } from '~/components/ui/fields'
import { EmptyState, LoadingState } from '~/components/ui/states'
import { useFlashMessage } from '~/components/ui/flash-message'
import { useAuth } from '~/lib/auth/use-auth'
import { getMyListingsOptions } from '~/lib/query/listings.queries'

export default function AccountScreen() {
	const auth = useAuth()
	const router = useRouter()
	const flash = useFlashMessage()
	const { data: listings = [], error, isError, isLoading } = useQuery(getMyListingsOptions())

	if (!auth.user) {
		return null
	}

	const handleLogout = async () => {
		await auth.logout()
		flash.show({ message: 'Deconnexion effectuee.', type: 'success' })
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-6 px-5 pb-10 pt-6"
			keyboardShouldPersistTaps="handled"
		>
			<AppShellHeader title="Votre compte et vos annonces." />

			<AccountInfoSection
				email={auth.user.email}
				listingsCount={listings.length}
				name={auth.user.name ?? ''}
			/>

			<Button fullWidth onPress={handleLogout} variant="destructive">
				Se deconnecter
			</Button>

			<View className="gap-4">
				{isLoading ? <LoadingState /> : null}
				{isError ? <InlineAlert message={error.message} /> : null}
				{!isLoading && !isError && listings.length === 0 ? (
					<EmptyState
						actionLabel="Creer une annonce"
						description="Commencez par publier votre premiere annonce."
						onActionPress={() => router.push('/listing/new')}
						title="Aucune annonce"
					/>
				) : null}
				{listings.length > 0 ? <ListingList listings={listings} /> : null}
			</View>
		</ScrollView>
	)
}
