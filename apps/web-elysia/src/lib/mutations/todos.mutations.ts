import { apiClient, edenMutationOption } from '../eden-client'
import { keys } from '../queries/keys'

export const deleteTodoOptions = (id: string) =>
  edenMutationOption({
    edenMutation: apiClient.todos({ id }).delete,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })

export const updateTodoOptions = (id: string) =>
  edenMutationOption({
    edenMutation: apiClient.todos({ id }).patch,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })

export const createTodoOptions = () =>
  edenMutationOption({
    edenMutation: apiClient.todos.post,
    onSuccess: (_, __, ___, context) => {
      context.client.invalidateQueries({ queryKey: keys.todos.list() })
    },
  })
