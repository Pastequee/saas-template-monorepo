import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ListingList } from '~/components/routes/listings/listing-list'
import { NewListingFormDialog } from '~/components/routes/listings/new-listing-form-dialog'
import { Input } from '~/components/ui/input'
import { searchListingsOptions } from '~/lib/queries/listings.queries'

export const Route = createFileRoute('/_authenticated/')({
	component: Home,
})

function Home() {
	const [search, setSearch] = useState('')
	const { data: listings = [] } = useQuery({
		...searchListingsOptions(search),
		placeholderData: keepPreviousData,
	})

	return (
		<div className="flex w-full max-w-7xl flex-col gap-8 pt-8">
			<div className="flex items-center gap-2">
				<Input
					className="flex-1"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Rechercher une annonce"
					value={search}
				/>
				<NewListingFormDialog />
			</div>

			<ListingList listings={listings} />
		</div>
	)
}
