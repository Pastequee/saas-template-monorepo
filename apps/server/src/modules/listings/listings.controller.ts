import { db } from '@repo/db'
import { listingInsertSchema, listingUpdateSchema } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { Elysia } from 'elysia'
import { z } from 'zod'

import { authMacro } from '#lib/auth.macros'

import {
	ListingsService,
	isListingForbiddenError,
	isListingNotFoundError,
} from './listings.service'

export const listingsRouter = new Elysia({ name: 'listings', tags: ['Listing'] })
	.use(authMacro)

	.model('idParam', z.object({ id: z.coerce.number() }))

	.decorate('listingsService', () => ListingsService(db))

	.get(
		'/listings',
		async ({ user }) => {
			const listings = await ListingsService(db).getUserListings(user.id)
			const listingsWithImages = listings.map((listing) => ({
				...listing,
				image: getImageUrl(listing.image?.key),
			}))
			return listingsWithImages
		},
		{ auth: true }
	)

	.get(
		'/listings/:id',
		async ({ params, statusError }) => {
			try {
				const listing = await ListingsService(db).getListingOrThrow(params.id)

				return {
					...listing,
					image: getImageUrl(listing.image?.key),
				}
			} catch (error) {
				if (isListingNotFoundError(error)) {
					return statusError(404, { message: error.message })
				}

				throw error
			}
		},
		{ auth: true, params: 'idParam' }
	)

	.post(
		'/listings',
		async ({ body, status, user }) => {
			const createdListing = await ListingsService(db).createListing({ userId: user.id, ...body })

			return status('Created', createdListing)
		},
		{ auth: true, body: listingInsertSchema.extend({ imageKey: z.string() }) }
	)

	.patch(
		'/listings/:id',
		async ({ body, params, user, statusError }) => {
			try {
				return await ListingsService(db).updateOwnedListing({
					data: body,
					id: params.id,
					userId: user.id,
				})
			} catch (error) {
				if (isListingNotFoundError(error)) {
					return statusError(404, { message: error.message })
				}

				if (isListingForbiddenError(error)) {
					return statusError(403, { message: error.message })
				}

				throw error
			}
		},
		{
			auth: true,
			body: listingUpdateSchema.extend({ imageKey: z.string().optional() }),
			params: 'idParam',
		}
	)

	.delete(
		'/listings/:id',
		async ({ params, status, user, statusError }) => {
			try {
				await ListingsService(db).deleteOwnedListing({ id: params.id, userId: user.id })
				return status('No Content')
			} catch (error) {
				if (isListingNotFoundError(error)) {
					return statusError('Not Found', { message: error.message })
				}

				if (isListingForbiddenError(error)) {
					return statusError(403, { message: error.message })
				}

				throw error
			}
		},
		{ auth: true, params: 'idParam' }
	)

	.get(
		'/listings/search',
		async ({ query }) => {
			const listings = await ListingsService(db).searchListings(query.q)
			const listingsWithImages = listings.map((listing) => ({
				...listing,
				image: getImageUrl(listing.image?.key),
			}))
			return listingsWithImages
		},
		{ auth: true, query: z.object({ q: z.string() }) }
	)

function getImageUrl(imageKey: string | undefined | null) {
	if (!imageKey) {
		return null
	}

	return fileStorage.getUrl(imageKey)
}
