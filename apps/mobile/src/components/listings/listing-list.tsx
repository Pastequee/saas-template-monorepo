import { View } from 'react-native'

import type { Listing } from '~/lib/api/client'

import { ListingCard } from './listing-card'

export function ListingList({ listings }: { listings: Listing[] }) {
	return (
		<View className="gap-4">
			{listings.map((listing) => (
				<ListingCard key={listing.id} listing={listing} />
			))}
		</View>
	)
}
