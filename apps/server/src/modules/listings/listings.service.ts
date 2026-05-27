// oxlint-disable require-await
import { eq, withTransaction } from '@repo/db'
import { listings } from '@repo/db/schemas'
import type { Listing, ListingInsert, ListingUpdate, User } from '@repo/db/types'

import type { AppDb, AppDeps } from '#deps'
import { withDb } from '#deps'
import { FileService } from '#modules/files/file.service'

type ListingsDeps = Pick<AppDeps, 'db' | 'fileStorage'>

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

export const ListingsService = (deps: ListingsDeps) => ({
	createListing: async (data: ListingInsert & { imageKey: string }) =>
		withTransaction(deps.db, async (tx) => {
			const { imageKey, ...listingData } = data
			const listing = await tx
				.insert(listings)
				.values(listingData)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([l]) => l!)

			await FileService(withDb(deps, tx)).attachListingImage({
				fileKey: imageKey,
				listingId: listing.id,
				ownerId: listing.userId,
			})
			return listing
		}),

	deleteOwnedListing: async ({ id, userId }: { id: Listing['id']; userId: User['id'] }) => {
		await withTransaction(deps.db, async (tx) => {
			await getOwnedListingRecordOrThrow(tx, id, userId)
			await FileService(withDb(deps, tx)).retireListingMedia({ listingId: id })
			await tx.delete(listings).where(eq(listings.id, id))
		})
	},

	getListingOrThrow: async (id: Listing['id']) => {
		const listing = await deps.db.query.listings.findFirst({
			where: { id },
			with: { image: true, user: { columns: { id: true, name: true } } },
		})

		if (!listing) {
			throw listingNotFoundError()
		}

		return listing
	},

	getUserListings: async (userId: User['id']) =>
		deps.db.query.listings.findMany({
			orderBy: { createdAt: 'desc' },
			where: { userId },
			with: { image: true },
		}),

	searchListings: async (query: string) =>
		deps.db.query.listings.findMany({
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
		withTransaction(deps.db, async (tx) => {
			const { imageKey, ...listingData } = data
			const listing = await getOwnedListingRecordOrThrow(tx, id, userId)

			if (imageKey !== undefined) {
				await FileService(withDb(deps, tx)).replaceListingImage({
					fileKey: imageKey,
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

async function getOwnedListingRecordOrThrow(db: AppDb, id: Listing['id'], userId: User['id']) {
	const listing = await db.query.listings.findFirst({ where: { id } })

	if (!listing) {
		throw listingNotFoundError()
	}

	if (listing.userId !== userId) {
		throw listingForbiddenError()
	}

	return listing
}
