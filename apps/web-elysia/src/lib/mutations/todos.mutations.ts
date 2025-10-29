import { eden, edenMutationOption } from '../eden-client'
import { keys } from '../queries/keys'

export const deleteTodoOptions = (id: string) =>
  edenMutationOption({
    edenMutation: eden.todos({ id }).delete,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })

export const updateTodoOptions = (id: string) =>
  edenMutationOption({
    edenMutation: eden.todos({ id }).patch,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })

export const createTodoOptions = () =>
  edenMutationOption({
    edenMutation: eden.todos.post,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })
