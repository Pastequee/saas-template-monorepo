// oxlint-disable require-await
import { eq, inArray, withTransaction } from '@repo/db'
import type { DatabaseType, TransactionType } from '@repo/db'
import { assets, listingImages, listings } from '@repo/db/schemas'
import type { Asset, Listing, ListingInsert, ListingUpdate, User } from '@repo/db/types'

import {
	AssetLifecycle,
	createAssetLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'
import { FileService } from '#modules/files/file.service'

export const ListingsService = (db: DatabaseType | TransactionType) => ({
	addListingImage: async (listingId: Listing['id'], assetKey: Asset['key']) => {
		await withTransaction(db, async (tx) => {
			const asset = await FileService(tx).promotePendingAsset(assetKey)
			await tx.insert(listingImages).values({ assetId: asset.id, listingId, sortOrder: 0 })
		})
	},

	createListing: async (data: ListingInsert & { imageKey: string }) =>
		withTransaction(db, async (tx) => {
			const { imageKey, ...listingData } = data
			const listing = await tx
				.insert(listings)
				.values(listingData)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([l]) => l!)

			await AssetLifecycle(createAssetLifecycleAdapters(tx)).attachListingImage({
				assetKey: imageKey,
				listingId: listing.id,
				ownerId: listing.userId,
			})
			return listing
		}),

	deleteListing: async (id: Listing['id']) => {
		await withTransaction(db, async (tx) => {
			await AssetLifecycle(createAssetLifecycleAdapters(tx)).retireListingMedia({ listingId: id })
			await tx.delete(listings).where(eq(listings.id, id))
		})
	},

	deleteListingImage: async (listingId: Listing['id']) => {
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
		})
	},

	getListing: async (id: Listing['id']) =>
		db.query.listings.findFirst({
			where: { id },
			with: { image: true, user: { columns: { id: true, name: true } } },
		}),

	getUserListings: async (userId: User['id']) =>
		db.query.listings.findMany({
			orderBy: { createdAt: 'desc' },
			where: { userId },
			with: { image: true },
		}),

	searchListings: async (query: string) =>
		db.query.listings.findMany({
			orderBy: { createdAt: 'desc' },
			where: {
				OR: [{ title: { ilike: `%${query}%` } }, { description: { ilike: `%${query}%` } }],
			},
			with: { image: true, user: { columns: { id: true, name: true } } },
		}),

	updateListing: async (id: Listing['id'], data: ListingUpdate & { imageKey?: string }) =>
		withTransaction(db, async (tx) => {
			const { imageKey, ...listingData } = data
			let listing = null

			if (imageKey !== undefined) {
				listing = await tx.query.listings.findFirst({ where: { id } })

				if (!listing) {
					throw new Error('Listing not found')
				}

				await AssetLifecycle(createAssetLifecycleAdapters(tx)).replaceListingImage({
					assetKey: imageKey,
					listingId: id,
					ownerId: listing.userId,
				})
			}

			if (Object.keys(listingData).length === 0) {
				if (listing) {
					return listing
				}

				const currentListing = await tx.query.listings.findFirst({ where: { id } })

				if (!currentListing) {
					throw new Error('Listing not found')
				}

				return currentListing
			}

			return (
				tx
					.update(listings)
					.set(listingData)
					.where(eq(listings.id, id))
					.returning()
					// oxlint-disable-next-line typescript/no-non-null-assertion
					.then(([l]) => l!)
			)
		}),
})
