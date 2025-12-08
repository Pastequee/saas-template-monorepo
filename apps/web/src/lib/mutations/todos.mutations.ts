import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const deleteTodoOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.todos({ id }).delete,
		meta: { invalidate: [keys.todos.list()] },
	})

export const updateTodoOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.todos({ id }).patch,
		meta: { invalidate: [keys.todos.list()] },
	})

export const createTodoOptions = () =>
	edenMutationOption({
		edenMutation: eden.todos.post,
		meta: { invalidate: [keys.todos.list()] },
	})
