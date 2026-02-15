import { type DatabaseType, eq, inArray, type TransactionType, withTransaction } from '@repo/db'
import { assets, listingImages, listings } from '@repo/db/schemas'
import type { Asset, Listing, ListingInsert, ListingUpdate, User } from '@repo/db/types'
import { FileService } from '#routers/files/file.service'

export const ListingsService = (db: DatabaseType | TransactionType) => ({
	async getUserListings(userId: User['id']) {
		return await db.query.listings.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			with: { image: true },
		})
	},

	async getListing(id: Listing['id']) {
		return await db.query.listings.findFirst({
			where: { id },
			with: { image: true, user: { columns: { id: true, name: true } } },
		})
	},

	async createListing(data: ListingInsert & { imageKey: string }) {
		return await withTransaction(db, async (tx) => {
			const listing = await tx
				.insert(listings)
				.values(data)
				.returning()
				// biome-ignore lint/style/noNonNullAssertion: always returns a listing
				.then(([listing]) => listing!)

			await ListingsService(tx).addListingImage(listing.id, data.imageKey)
			return listing
		})
	},

	async updateListing(id: Listing['id'], data: ListingUpdate & { imageKey?: string }) {
		return await withTransaction(db, async (tx) => {
			if (data.imageKey) {
				await ListingsService(tx).deleteListingImage(id)
				await ListingsService(tx).addListingImage(id, data.imageKey)
			}

			return await tx
				.update(listings)
				.set(data)
				.where(eq(listings.id, id))
				.returning()
				// biome-ignore lint/style/noNonNullAssertion: always returns a listing
				.then(([listing]) => listing!)
		})
	},

	async deleteListing(id: Listing['id']) {
		return await withTransaction(db, async (tx) => {
			await ListingsService(tx).deleteListingImage(id)
			await tx.delete(listings).where(eq(listings.id, id))
		})
	},

	async searchListings(query: string) {
		return await db.query.listings.findMany({
			where: {
				OR: [{ title: { ilike: `%${query}%` } }, { description: { ilike: `%${query}%` } }],
			},
			orderBy: { createdAt: 'desc' },
			with: { image: true, user: { columns: { id: true, name: true } } },
		})
	},

	async addListingImage(listingId: Listing['id'], assetKey: Asset['key']) {
		return await withTransaction(db, async (tx) => {
			const asset = await FileService(tx).promotePendingAsset(assetKey)
			await tx.insert(listingImages).values({ listingId, assetId: asset.id, sortOrder: 0 })
		})
	},

	async deleteListingImage(listingId: Listing['id']) {
		return await withTransaction(db, async (tx) => {
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
		})
	},
})
