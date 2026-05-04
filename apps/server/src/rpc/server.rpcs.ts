import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'

import { FilesRpcs } from './files.contract'
import { ListingsRpcs } from './listings.contract'
import { UsersRpcs } from './users.contract'

const HostInfo = Schema.Struct({
	host: Schema.String,
	rpc: Schema.String,
})

export class HostRpcs extends RpcGroup.make(
	Rpc.make('GetHostInfo', {
		success: HostInfo,
	})
) {}

export const ServerRpcs = HostRpcs.merge(UsersRpcs).merge(FilesRpcs).merge(ListingsRpcs)
