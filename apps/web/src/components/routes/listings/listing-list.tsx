import type { Listing } from '@repo/db/types'
import { ListingCard } from './listing-card'

export function ListingList({ listings }: { listings: Listing[] }) {
	return (
		<div className="grid grid-cols-4 gap-4">
			{listings.map((listing) => (
				<ListingCard key={listing.id} listing={listing} />
			))}
		</div>
	)
}
