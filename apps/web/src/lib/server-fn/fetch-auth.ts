import { formatAuthSession } from '@repo/auth/utils'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { authClient } from '~/lib/clients/auth-client'

export const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
	const request = getRequest()

	const { data } = await authClient.getSession({ fetchOptions: { headers: request.headers } })

	if (!data) {
		return null
	}

	return formatAuthSession(data)
})
