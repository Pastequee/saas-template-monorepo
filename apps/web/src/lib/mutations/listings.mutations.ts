import { mutationOptions } from '@tanstack/react-query'

import { createListing, deleteOwnedListing, updateOwnedListing } from '~/lib/api/rpc-client'
import { keys } from '~/lib/queries/keys'

export const deleteListingOptions = (id: number) =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: async () => deleteOwnedListing(id),
	})

export const updateListingOptions = (id: number) =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: async (
			data: Partial<{
				description: string
				imageKey: string
				price: number
				title: string
			}>
		) => updateOwnedListing(id, data),
	})

export const createListingOptions = () =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: createListing,
	})
