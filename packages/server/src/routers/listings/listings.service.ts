import { eq, inArray, withTransaction } from '@repo/db'
import type { DatabaseType, TransactionType } from '@repo/db'
import { assets, listingImages, listings } from '@repo/db/schemas'
import type { Asset, Listing, ListingInsert, ListingUpdate, User } from '@repo/db/types'

import { FileService } from '#routers/files/file.service'

export const ListingsService = (db: DatabaseType | TransactionType) => ({
	addListingImage: async (listingId: Listing['id'], assetKey: Asset['key']) =>
		await withTransaction(db, async (tx) => {
			const asset = await FileService(tx).promotePendingAsset(assetKey)
			await tx.insert(listingImages).values({ assetId: asset.id, listingId, sortOrder: 0 })
		}),

	createListing: async (data: ListingInsert & { imageKey: string }) =>
		await withTransaction(db, async (tx) => {
			const listing = await tx
				.insert(listings)
				.values(data)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([l]) => l!)

			await ListingsService(tx).addListingImage(listing.id, data.imageKey)
			return listing
		}),

	deleteListing: async (id: Listing['id']) =>
		await withTransaction(db, async (tx) => {
			await ListingsService(tx).deleteListingImage(id)
			await tx.delete(listings).where(eq(listings.id, id))
		}),

	deleteListingImage: async (listingId: Listing['id']) =>
		await withTransaction(db, async (tx) => {
			const images = await tx
				.delete(listingImages)
				.where(eq(listingImages.listingId, listingId))
				.returning()

			await tx
				.update(assets)
				.set({ status: 'deleted' })
				.where(
					inArray(
						assets.id,
						images.map((image) => image.assetId)
					)
				)
		}),

	getListing: async (id: Listing['id']) =>
		await db.query.listings.findFirst({
			where: { id },
			with: { image: true, user: { columns: { id: true, name: true } } },
		}),

	getUserListings: async (userId: User['id']) =>
		await db.query.listings.findMany({
			orderBy: { createdAt: 'desc' },
			where: { userId },
			with: { image: true },
		}),

	searchListings: async (query: string) =>
		await db.query.listings.findMany({
			orderBy: { createdAt: 'desc' },
			where: {
				OR: [{ title: { ilike: `%${query}%` } }, { description: { ilike: `%${query}%` } }],
			},
			with: { image: true, user: { columns: { id: true, name: true } } },
		}),

	updateListing: async (id: Listing['id'], data: ListingUpdate & { imageKey?: string }) =>
		await withTransaction(db, async (tx) => {
			if (data.imageKey) {
				await ListingsService(tx).deleteListingImage(id)
				await ListingsService(tx).addListingImage(id, data.imageKey)
			}

			return await tx
				.update(listings)
				.set(data)
				.where(eq(listings.id, id))
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([l]) => l!)
		}),
})
