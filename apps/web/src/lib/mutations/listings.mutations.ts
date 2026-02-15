import { edenMutationOption } from '~/lib/utils/eden-query'
import { keys } from '../queries/keys'
import { eden } from '../server-fn/eden'

export const deleteListingOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().listings({ id }).delete,
		meta: { invalidate: [keys.listings.all] },
	})

export const updateListingOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().listings({ id }).patch,
		meta: { invalidate: [keys.listings.all] },
	})

export const createListingOptions = () =>
	edenMutationOption({
		edenMutation: eden().listings.post,
		meta: { invalidate: [keys.listings.all] },
	})
