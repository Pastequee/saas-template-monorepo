import { Etag } from '@effect/platform'
import { BunFileSystem, BunHttpPlatform, BunPath } from '@effect/platform-bun'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer } from 'effect'

import { filesRpcLayer } from './files.rpc'
import { listingsRpcLayer } from './listings.rpc'
import { HostRpcs, ServerRpcs } from './server.rpcs'
import { usersRpcLayer } from './users.rpc'

const hostRpcHandlers = HostRpcs.toLayer({
	GetHostInfo: () =>
		Effect.succeed({
			host: 'hono',
			rpc: 'effect',
		}),
})

const hostRpcDefaultServices = Layer.mergeAll(
	BunFileSystem.layer,
	BunPath.layer,
	Etag.layerWeak,
	BunHttpPlatform.layer
)

export const hostRpcWebHandler = RpcServer.toWebHandler(ServerRpcs, {
	layer: Layer.mergeAll(
		hostRpcHandlers,
		filesRpcLayer,
		listingsRpcLayer,
		usersRpcLayer,
		RpcSerialization.layerJsonRpc(),
		hostRpcDefaultServices
	),
})
