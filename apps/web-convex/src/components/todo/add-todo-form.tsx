import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '../../../../../packages/backend-convex/convex/_generated/api'
import { useAuth } from '../auth/auth-provider'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export const AddTodoForm = () => {
  const [newTodo, setNewTodo] = useState('')

  const { isAuthenticated } = useAuth()

  const createTodoMutation = useMutation(api.todo.createTodo)

  const addTodo = () => {
    createTodoMutation({ content: newTodo })
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addTodo()
      }}
    >
      <Input
        autoFocus
        disabled={!isAuthenticated}
        onChange={(e) => {
          setNewTodo(e.target.value)
        }}
        placeholder="Add a new todo"
        value={newTodo}
      />
      <Button disabled={!isAuthenticated || newTodo.length === 0} type="submit">
        Add
        {/* {isCreatingTodo && <Loader />} */}
      </Button>
    </form>
  )
}
