import { edenQueryOption } from '~/lib/utils/eden-query'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const getMyListingsOptions = () =>
	edenQueryOption({
		edenQuery: eden().listings.get,
		queryKey: keys.listings.list(),
	})

export const getOneListingOptions = (id: string) =>
	edenQueryOption({
		edenQuery: eden().listings({ id }).get,
		queryKey: keys.listings.one(id),
	})

export const searchListingsOptions = (search: string) =>
	edenQueryOption({
		edenQuery: eden().listings.search.get,
		edenOptions: { query: { q: search } },
		queryKey: keys.listings.search(search),
	})
