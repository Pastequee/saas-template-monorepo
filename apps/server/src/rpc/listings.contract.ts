import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'

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
