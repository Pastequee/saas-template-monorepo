import { queryOptions } from '@tanstack/react-query'

import { api } from '../api/client'
import { keys } from './keys'

export const getMyListingsOptions = () =>
	queryOptions({
		queryFn: api.getMyListings,
		queryKey: keys.listings.list(),
	})

export const getOneListingOptions = (id: string) =>
	queryOptions({
		queryFn: () => api.getListing(id),
		queryKey: keys.listings.one(id),
	})

export const searchListingsOptions = (search: string) =>
	queryOptions({
		queryFn: () => api.searchListings(search),
		queryKey: keys.listings.search(search),
	})
