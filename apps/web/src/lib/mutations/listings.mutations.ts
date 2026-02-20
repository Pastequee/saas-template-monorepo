import { keys } from '~/lib/queries/keys'
import { eden } from '~/lib/server-fn/eden'
import { edenMutationOption } from '~/lib/utils/eden-query'

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
