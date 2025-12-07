import { createServerFn } from '@tanstack/react-start'
import { eden } from '../eden-client'

export const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
	const { data } = await eden.me.get()

	return data
})
