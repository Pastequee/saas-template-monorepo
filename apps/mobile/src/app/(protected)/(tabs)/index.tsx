import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { startTransition, useDeferredValue, useState } from 'react'
import { ScrollView, TextInput, View } from 'react-native'

import { AppShellHeader } from '~/components/layout/app-shell-header'
import { ListingList } from '~/components/listings/listing-list'
import { InlineAlert } from '~/components/ui/fields'
import { EmptyState, LoadingState } from '~/components/ui/states'
import { searchListingsOptions } from '~/lib/query/listings.queries'

export default function ListingsHomeScreen() {
	const router = useRouter()
	const [search, setSearch] = useState('')
	const deferredSearch = useDeferredValue(search)
	const {
		data: listings = [],
		error,
		isError,
		isLoading,
		isSuccess,
	} = useQuery({
		...searchListingsOptions(deferredSearch),
		placeholderData: keepPreviousData,
	})

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-6 px-5 pb-10 pt-6"
			keyboardShouldPersistTaps="handled"
		>
			<AppShellHeader
				actionLabel="Nouvelle"
				onActionPress={() => router.push('/listing/new')}
				title="Trouvez ou publiez une annonce en quelques secondes."
			/>

			<TextInput
				className="min-h-12 rounded-2xl border border-input bg-card px-4 py-3 text-base text-foreground"
				onChangeText={(value) => startTransition(() => setSearch(value))}
				placeholder="Rechercher une annonce"
				placeholderTextColor="#94a3b8"
				value={search}
			/>

			{isLoading ? <LoadingState /> : null}
			{isError ? <InlineAlert message={error.message} /> : null}
			{isSuccess && listings.length === 0 ? (
				<EmptyState
					description={
						deferredSearch
							? 'Aucune annonce ne correspond a votre recherche.'
							: 'Aucune annonce disponible pour le moment.'
					}
					title="Aucune annonce"
				/>
			) : null}
			{listings.length > 0 ? <ListingList listings={listings} /> : null}
		</ScrollView>
	)
}
