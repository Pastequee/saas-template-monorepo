import { db } from '@repo/db'
import { listingInsertSchema, listingUpdateSchema } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { coercePositiveInt } from '@repo/utils'
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

	.model('listingIdParam', z.object({ id: positiveIntParam('listing id') }))

	.decorate('listingsService', ListingsService(db))

	.get(
		'/listings',
		async ({ user, listingsService }) => {
			const listings = await listingsService.getUserListings(user.id)
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
		async ({ params, listingsService, statusError }) => {
			try {
				const listing = await listingsService.getListingOrThrow(params.id)

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
		{ auth: true, params: 'listingIdParam' }
	)

	.post(
		'/listings',
		async ({ body, status, user, listingsService }) => {
			const createdListing = await listingsService.createListing({ userId: user.id, ...body })

			return status('Created', createdListing)
		},
		{ auth: true, body: listingInsertSchema.extend({ imageKey: z.string() }) }
	)

	.patch(
		'/listings/:id',
		async ({ body, params, user, statusError, listingsService }) => {
			try {
				return await listingsService.updateOwnedListing({
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
			params: 'listingIdParam',
		}
	)

	.delete(
		'/listings/:id',
		async ({ params, status, user, statusError, listingsService }) => {
			try {
				await listingsService.deleteOwnedListing({ id: params.id, userId: user.id })
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
		{ auth: true, params: 'listingIdParam' }
	)

	.get(
		'/listings/search',
		async ({ query, listingsService }) => {
			const listings = await listingsService.searchListings(query.q)
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

function positiveIntParam(label: string) {
	return z.string().transform((value, ctx) => {
		try {
			return coercePositiveInt(value, label)
		} catch (error) {
			ctx.addIssue({
				code: 'custom',
				message: error instanceof Error ? error.message : `Invalid ${label}: ${value}`,
			})
			return z.NEVER
		}
	})
}
