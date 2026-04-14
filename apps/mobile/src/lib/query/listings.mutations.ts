import { mutationOptions } from '@tanstack/react-query'

import type { CreateListingInput } from '../api/client'
import { api } from '../api/client'
import { keys } from './keys'

export const createListingOptions = () =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: (input: CreateListingInput) => api.createListing(input),
	})

export const deleteListingOptions = () =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: api.deleteListing,
	})

export const updateListingOptions = () =>
	mutationOptions({
		meta: { invalidate: [keys.listings.all] },
		mutationFn: api.updateListing,
	})
