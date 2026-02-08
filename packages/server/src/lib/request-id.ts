import Elysia from 'elysia'
import { nanoid } from 'nanoid'

type RequestIdPluginProps = {
	header?: string
	generator?: () => string
}

export const requestId = ({
	header = 'X-Request-ID',
	generator = nanoid,
}: RequestIdPluginProps = {}) =>
	new Elysia({ name: 'request-id' })
		.onRequest(({ set, request }) => {
			set.headers[header] = request.headers.get(header) ?? generator()
		})
		.derive(({ set }) => ({
			requestId: set.headers[header]?.toString() ?? 'Why the fuck is this empty?',
		}))
		.as('global')
