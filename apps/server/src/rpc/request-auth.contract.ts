import { Schema } from 'effect'

export class UnauthorizedRpcError extends Schema.TaggedError<UnauthorizedRpcError>()(
	'UnauthorizedRpcError',
	{
		message: Schema.String,
	}
) {}
