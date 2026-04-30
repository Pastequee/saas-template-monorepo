// oxlint-disable require-await
import { eq, withTransaction } from '@repo/db'
import type { DatabaseType, TransactionType } from '@repo/db'
import { listings } from '@repo/db/schemas'
import type { Listing, ListingInsert, ListingUpdate, User } from '@repo/db/types'

import {
	AssetLifecycle,
	createAssetLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

const listingNotFoundError = () =>
	Object.assign(new Error('Listing not found'), { name: 'ListingNotFoundError' })
const listingForbiddenError = () =>
	Object.assign(new Error('This listing is not yours'), { name: 'ListingForbiddenError' })

export const isListingNotFoundError = (
	error: unknown
): error is Error & { name: 'ListingNotFoundError' } =>
	error instanceof Error && error.name === 'ListingNotFoundError'

export const isListingForbiddenError = (
	error: unknown
): error is Error & { name: 'ListingForbiddenError' } =>
	error instanceof Error && error.name === 'ListingForbiddenError'

export const ListingsService = (db: DatabaseType | TransactionType) => ({
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

	deleteOwnedListing: async ({ id, userId }: { id: Listing['id']; userId: User['id'] }) => {
		await withTransaction(db, async (tx) => {
			await getOwnedListingRecordOrThrow(tx, id, userId)
			await AssetLifecycle(createAssetLifecycleAdapters(tx)).retireListingMedia({ listingId: id })
			await tx.delete(listings).where(eq(listings.id, id))
		})
	},

	getListingOrThrow: async (id: Listing['id']) => {
		const listing = await db.query.listings.findFirst({
			where: { id },
			with: { image: true, user: { columns: { id: true, name: true } } },
		})

		if (!listing) {
			throw listingNotFoundError()
		}

		return listing
	},

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

	updateOwnedListing: async ({
		data,
		id,
		userId,
	}: {
		data: ListingUpdate & { imageKey?: string }
		id: Listing['id']
		userId: User['id']
	}) =>
		withTransaction(db, async (tx) => {
			const { imageKey, ...listingData } = data
			const listing = await getOwnedListingRecordOrThrow(tx, id, userId)

			if (imageKey !== undefined) {
				await AssetLifecycle(createAssetLifecycleAdapters(tx)).replaceListingImage({
					assetKey: imageKey,
					listingId: id,
					ownerId: listing.userId,
				})
			}

			if (Object.keys(listingData).length === 0) {
				return listing
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

async function getOwnedListingRecordOrThrow(
	db: DatabaseType | TransactionType,
	id: Listing['id'],
	userId: User['id']
) {
	const listing = await db.query.listings.findFirst({ where: { id } })

	if (!listing) {
		throw listingNotFoundError()
	}

	if (listing.userId !== userId) {
		throw listingForbiddenError()
	}

	return listing
}
