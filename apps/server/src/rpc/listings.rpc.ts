import { db } from '@repo/db'
import { fileStorage } from '@repo/file-storage'
import { Effect } from 'effect'

import {
	ListingsService,
	isListingForbiddenError,
	isListingNotFoundError,
} from '#modules/listings/listings.service'

import { ListingRpcError, ListingsRpcs } from './listings.contract'
import { getCurrentRequestAuth } from './request-auth.rpc'

const getImageUrl = (imageKey: string | undefined | null) =>
	imageKey ? fileStorage.getUrl(imageKey) : null

const requireListingUser = (user: { id: number; name: string } | null) => {
	if (!user) {
		throw new Error('Listing owner is missing')
	}

	return user
}

const mapListingRpcError = (error: unknown): ListingRpcError => {
	if (isListingNotFoundError(error)) {
		return new ListingRpcError({ message: error.message, reason: 'not_found' })
	}

	if (isListingForbiddenError(error)) {
		return new ListingRpcError({ message: error.message, reason: 'forbidden' })
	}

	return new ListingRpcError({
		message: error instanceof Error ? error.message : 'Unexpected listing rpc failure',
		reason: 'unexpected',
	})
}

const requireRequestAuth = Effect.gen(function* requireRequestAuth() {
	const requestAuth = yield* getCurrentRequestAuth

	if (!requestAuth) {
		return yield* Effect.fail(
			new ListingRpcError({
				message: 'You are not authenticated',
				reason: 'unauthenticated',
			})
		)
	}

	return requestAuth
})

const listingsRpcHandlers = ListingsRpcs.toLayer({
	'listings.CreateListing': (payload) =>
		Effect.gen(function* createListing() {
			const requestAuth = yield* requireRequestAuth
			const { imageKey, ...listingData } = payload

			return yield* Effect.promise(async () =>
				ListingsService(db).createListing({
					...listingData,
					imageKey,
					userId: requestAuth.user.id,
				})
			)
		}),
	'listings.DeleteOwnedListing': ({ id }) =>
		Effect.gen(function* deleteOwnedListing() {
			const requestAuth = yield* requireRequestAuth

			yield* Effect.tryPromise({
				catch: mapListingRpcError,
				try: async () =>
					ListingsService(db).deleteOwnedListing({ id, userId: requestAuth.user.id }),
			})

			return { success: true as const }
		}),
	'listings.GetListing': ({ id }) =>
		Effect.gen(function* getListing() {
			yield* requireRequestAuth

			const listing = yield* Effect.tryPromise({
				catch: mapListingRpcError,
				try: async () => ListingsService(db).getListingOrThrow(id),
			})

			return {
				...listing,
				image: getImageUrl(listing.image?.key),
				user: requireListingUser(listing.user),
			}
		}),
	'listings.GetUserListings': () =>
		Effect.gen(function* getUserListings() {
			const requestAuth = yield* requireRequestAuth
			const listings = yield* Effect.promise(async () =>
				ListingsService(db).getUserListings(requestAuth.user.id)
			)

			return listings.map((listing) => ({
				...listing,
				image: getImageUrl(listing.image?.key),
			}))
		}),
	'listings.SearchListings': ({ q }) =>
		Effect.gen(function* searchListings() {
			yield* requireRequestAuth

			const listings = yield* Effect.promise(async () => ListingsService(db).searchListings(q))

			return listings.map((listing) => ({
				...listing,
				image: getImageUrl(listing.image?.key),
				user: requireListingUser(listing.user),
			}))
		}),
	'listings.UpdateOwnedListing': ({ data, id }) =>
		Effect.gen(function* updateOwnedListing() {
			const requestAuth = yield* requireRequestAuth

			return yield* Effect.tryPromise({
				catch: mapListingRpcError,
				try: async () =>
					ListingsService(db).updateOwnedListing({
						data,
						id,
						userId: requestAuth.user.id,
					}),
			})
		}),
})

export const listingsRpcLayer = listingsRpcHandlers
