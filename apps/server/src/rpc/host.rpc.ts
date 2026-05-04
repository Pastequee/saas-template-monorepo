import { Etag } from '@effect/platform'
import { BunFileSystem, BunHttpPlatform, BunPath } from '@effect/platform-bun'
import { Rpc, RpcGroup, RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer, Schema } from 'effect'

import { usersRpcLayer, UsersRpcs } from './users.rpc'

const HostInfo = Schema.Struct({
	host: Schema.String,
	rpc: Schema.String,
})

export class HostRpcs extends RpcGroup.make(
	Rpc.make('GetHostInfo', {
		success: HostInfo,
	})
) {}

const serverRpcs = HostRpcs.merge(UsersRpcs)

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

export const hostRpcWebHandler = RpcServer.toWebHandler(serverRpcs, {
	layer: Layer.mergeAll(
		hostRpcHandlers,
		usersRpcLayer,
		RpcSerialization.layerJsonRpc(),
		hostRpcDefaultServices
	),
})
