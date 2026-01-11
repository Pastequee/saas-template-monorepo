import { edenQueryOption } from '~/lib/utils/eden-query'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const todoListOptions = () =>
	edenQueryOption({
		edenQuery: eden().todos.get,
		queryKey: keys.todos.list(),
	})
