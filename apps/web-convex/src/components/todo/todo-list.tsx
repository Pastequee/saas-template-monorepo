import { useQuery } from 'convex/react'
import { api } from '../../../../backend-convex/convex/_generated/api'
import { TodoItem } from './todo-item'

export type GetTodosResponse = typeof api.todo.getTodos._returnType

export const TodoList = () => {
  const todos = useQuery(api.todo.getTodos)

  // if (isLoading) return <Loader className="text-muted-foreground" />

  if (!todos || todos.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  )
}
