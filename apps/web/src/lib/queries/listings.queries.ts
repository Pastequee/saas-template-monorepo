import { queryOptions } from '@tanstack/react-query'

import { getMyListings, getOneListing, searchListings } from '~/lib/api/rpc-client'

import { keys } from './keys'

export const getMyListingsOptions = () =>
	queryOptions({
		queryFn: getMyListings,
		queryKey: keys.listings.list(),
	})

export const getOneListingOptions = (id: number) =>
	queryOptions({
		queryFn: async () => getOneListing(id),
		queryKey: keys.listings.one(id),
	})

export const searchListingsOptions = (search: string) =>
	queryOptions({
		queryFn: async () => searchListings(search),
		queryKey: keys.listings.search(search),
	})
