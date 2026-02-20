import { eden } from '~/lib/server-fn/eden'
import { edenQueryOption } from '~/lib/utils/eden-query'

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
		edenOptions: { query: { q: search } },
		edenQuery: eden().listings.search.get,
		queryKey: keys.listings.search(search),
	})
