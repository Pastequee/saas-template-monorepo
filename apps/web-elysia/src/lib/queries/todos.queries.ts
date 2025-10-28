import { apiClient, edenQueryOption } from '../eden-client'
import { keys } from './keys'

export const todoListOptions = () =>
  edenQueryOption({
    edenQuery: apiClient.todos.get,
    queryKey: keys.todos.list(),
  })
