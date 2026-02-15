import { db } from '@repo/db'
import { listingInsertSchema, listingUpdateSchema } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { Elysia } from 'elysia'
import z from 'zod'
import { authMacro } from '#lib/auth'
import { ListingsService } from './listings.service'

export const listingsRouter = new Elysia({ name: 'listings', tags: ['Listing'] })
	.use(authMacro)

	.model('uuidParam', z.object({ id: z.uuid() }))

	.decorate('listingsService', ListingsService(db))

	.get(
		'/listings',
		async ({ user, listingsService }) => {
			const listings = await listingsService.getUserListings(user.id)
			const listingsWithImages = listings.map((listing) => ({
				...listing,
				image: listing.image?.key ? fileStorage.getUrl(listing.image.key) : null,
			}))
			return listingsWithImages
		},
		{ auth: true }
	)

	.get(
		'/listings/:id',
		async ({ params, listingsService, statusError }) => {
			const listing = await listingsService.getListing(params.id)
			if (!listing) return statusError(404, { message: 'Listing not found' })

			return {
				...listing,
				image: listing.image?.key ? fileStorage.getUrl(listing.image.key) : null,
			}
		},
		{ auth: true, params: 'uuidParam' }
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
			const listing = await listingsService.getListing(params.id)

			if (!listing) return statusError(404, { message: 'Listing not found' })
			if (listing.userId !== user.id)
				return statusError(403, { message: 'This listing is not yours' })

			const emptyBody = Object.keys(body).length === 0
			if (emptyBody) return listing

			const updatedListing = await listingsService.updateListing(params.id, body)

			return updatedListing
		},
		{
			auth: true,
			body: listingUpdateSchema.extend({ imageKey: z.string().optional() }),
			params: 'uuidParam',
		}
	)

	.delete(
		'/listings/:id',
		async ({ params, status, user, statusError, listingsService }) => {
			const listing = await listingsService.getListing(params.id)

			if (!listing) return statusError('Not Found', { message: 'Listing not found' })
			if (listing.userId !== user.id)
				return statusError(403, { message: 'This listing is not yours' })

			await listingsService.deleteListing(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)

	.get(
		'/listings/search',
		async ({ query, listingsService }) => {
			const listings = await listingsService.searchListings(query.q)
			const listingsWithImages = listings.map((listing) => ({
				...listing,
				image: listing.image?.key ? fileStorage.getUrl(listing.image.key) : null,
			}))
			return listingsWithImages
		},
		{ auth: true, query: z.object({ q: z.string() }) }
	)
