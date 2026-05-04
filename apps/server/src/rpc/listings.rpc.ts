import { Rpc, RpcGroup } from '@effect/rpc'
import { db } from '@repo/db'
import { fileStorage } from '@repo/file-storage'
import { Effect, Schema } from 'effect'

import {
	ListingsService,
	isListingForbiddenError,
	isListingNotFoundError,
} from '#modules/listings/listings.service'

import { getCurrentRequestAuth } from './request-auth.rpc'

const ListingRecord = Schema.Struct({
	createdAt: Schema.Date,
	description: Schema.String,
	id: Schema.Number,
	price: Schema.Number,
	title: Schema.String,
	updatedAt: Schema.Date,
	userId: Schema.Number,
})

const ListingSummary = Schema.Struct({
	createdAt: Schema.Date,
	description: Schema.String,
	id: Schema.Number,
	image: Schema.NullOr(Schema.String),
	price: Schema.Number,
	title: Schema.String,
	updatedAt: Schema.Date,
	userId: Schema.Number,
})

const ListingDetail = Schema.Struct({
	createdAt: Schema.Date,
	description: Schema.String,
	id: Schema.Number,
	image: Schema.NullOr(Schema.String),
	price: Schema.Number,
	title: Schema.String,
	updatedAt: Schema.Date,
	user: Schema.Struct({
		id: Schema.Number,
		name: Schema.String,
	}),
	userId: Schema.Number,
})

const ListingSearchInput = Schema.Struct({
	q: Schema.NonEmptyString,
})

const ListingIdInput = Schema.Struct({
	id: Schema.Number.pipe(Schema.positive()),
})

const CreateListingInput = Schema.Struct({
	description: Schema.NonEmptyString,
	imageKey: Schema.NonEmptyString,
	price: Schema.Number,
	title: Schema.NonEmptyString,
})

const UpdateListingInput = Schema.Struct({
	data: Schema.Struct({
		description: Schema.optional(Schema.NonEmptyString),
		imageKey: Schema.optional(Schema.NonEmptyString),
		price: Schema.optional(Schema.Number),
		title: Schema.optional(Schema.NonEmptyString),
	}),
	id: Schema.Number.pipe(Schema.positive()),
})

export class ListingRpcError extends Schema.TaggedError<ListingRpcError>()('ListingRpcError', {
	message: Schema.String,
	reason: Schema.Literal('forbidden', 'not_found', 'unauthenticated', 'unexpected'),
}) {}

export const ListingsRpcs = RpcGroup.make(
	Rpc.make('GetUserListings', {
		success: Schema.Array(ListingSummary),
	}).setError(ListingRpcError),
	Rpc.make('GetListing', {
		payload: ListingIdInput,
		success: ListingDetail,
	}).setError(ListingRpcError),
	Rpc.make('CreateListing', {
		payload: CreateListingInput,
		success: ListingRecord,
	}).setError(ListingRpcError),
	Rpc.make('UpdateOwnedListing', {
		payload: UpdateListingInput,
		success: ListingRecord,
	}).setError(ListingRpcError),
	Rpc.make('DeleteOwnedListing', {
		payload: ListingIdInput,
		success: Schema.Struct({ success: Schema.Literal(true) }),
	}).setError(ListingRpcError),
	Rpc.make('SearchListings', {
		payload: ListingSearchInput,
		success: Schema.Array(ListingDetail),
	}).setError(ListingRpcError)
).prefix('listings.')

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

			return yield* Effect.promise( async () =>
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
				try:  async () => ListingsService(db).deleteOwnedListing({ id, userId: requestAuth.user.id }),
			})

			return { success: true as const }
		}),
	'listings.GetListing': ({ id }) =>
		Effect.gen(function* getListing() {
			yield* requireRequestAuth

			const listing = yield* Effect.tryPromise({
				catch: mapListingRpcError,
				try:  async () => ListingsService(db).getListingOrThrow(id),
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
			const listings = yield* Effect.promise( async () =>
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

			const listings = yield* Effect.promise( async () => ListingsService(db).searchListings(q))

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
				try:  async () =>
					ListingsService(db).updateOwnedListing({
						data,
						id,
						userId: requestAuth.user.id,
					}),
			})
		}),
})

export const listingsRpcLayer = listingsRpcHandlers
