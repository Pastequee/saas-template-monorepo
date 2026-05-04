import { FetchHttpClient } from '@effect/platform'
import { RpcClient, RpcSerialization } from '@effect/rpc'
import type { RpcClientError } from '@effect/rpc'
import { env } from '@repo/env/web'
import { ServerRpcs } from '@repo/server/src/rpc/server.rpcs'
import { Effect, Layer } from 'effect'

type ServerRpcClient = RpcClient.FromGroup<typeof ServerRpcs, RpcClientError.RpcClientError>

const rpcLayer = RpcClient.layerProtocolHttp({
	url: `${env.VITE_SERVER_URL}/api/rpc`,
}).pipe(
	Layer.provide(FetchHttpClient.layer),
	Layer.provide(RpcSerialization.layerJsonRpc()),
	Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: 'include' }))
)

const runRpc = async <TReturn>(
	execute: (client: ServerRpcClient) => Effect.Effect<TReturn, unknown>
) =>
	Effect.gen(function* executeRpc() {
		const client = yield* RpcClient.make(ServerRpcs)

		return yield* execute(client)
	}).pipe(Effect.provide(rpcLayer), Effect.scoped, Effect.runPromise)

export const getMyListings = async () => runRpc((client) => client.listings.GetUserListings())

export const getOneListing = async (id: number) =>
	runRpc((client) => client.listings.GetListing({ id }))

export const searchListings = async (q: string) =>
	runRpc((client) => client.listings.SearchListings({ q }))

export const createListing = async (input: {
	description: string
	imageKey: string
	price: number
	title: string
}) => runRpc((client) => client.listings.CreateListing(input))

export const updateOwnedListing = async (
	id: number,
	data: Partial<{
		description: string
		imageKey: string
		price: number
		title: string
	}>
) => runRpc((client) => client.listings.UpdateOwnedListing({ data, id }))

export const deleteOwnedListing = async (id: number) =>
	runRpc((client) => client.listings.DeleteOwnedListing({ id }))

export const presignUpload = async (input: {
	contentType: 'image/webp'
	filename: string
	public?: boolean
	size: number
}) => runRpc((client) => client.files.PresignUpload(input))
