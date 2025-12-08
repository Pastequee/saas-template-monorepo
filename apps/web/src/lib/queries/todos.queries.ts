import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const todoListOptions = () =>
	edenQueryOption({
		edenQuery: eden.todos.get,
		queryKey: keys.todos.list(),
	})
