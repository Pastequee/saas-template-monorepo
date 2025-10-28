import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useEdenMutation } from '~/lib/eden-client'
import {
  deleteTodoOptions,
  updateTodoOptions,
} from '~/lib/mutations/todos.mutations'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

type TodoItemProps = {
  todo: { id: string; content: string; status: 'COMPLETED' | 'PENDING' }
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { isPending: isDeletingTodo, mutate: deleteTodoMutation } =
    useEdenMutation(deleteTodoOptions(todo.id))

  const { isPending: isUpdatingTodo, mutate: updateTodoMutation } =
    useEdenMutation(updateTodoOptions(todo.id))

  const updateTodo = (data: {
    content?: string
    status?: 'COMPLETED' | 'PENDING'
  }) => {
    updateTodoMutation(data)
  }

  const deleteTodo = () => {
    deleteTodoMutation({})
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const content = inputRef.current?.value
    if (!content) {
      setIsEditing(false)
      return
    }
    updateTodo({ content })
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-4" key={todo.id}>
      <div className="flex h-full min-w-0 flex-1 items-center gap-4">
        <Checkbox
          checked={todo.status === 'COMPLETED'}
          disabled={isUpdatingTodo}
          onCheckedChange={() => {
            updateTodo({
              status: todo.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
            })
          }}
        />

        {isEditing ? (
          <form className="flex-1" onSubmit={handleUpdateSubmit}>
            <input
              autoFocus
              className="w-full font-semibold text-sm outline-none"
              defaultValue={todo.content}
              disabled={isUpdatingTodo}
              onBlur={() => {
                setIsEditing(false)
              }}
              ref={inputRef}
            />
          </form>
        ) : (
          <button
            className="group flex flex-1 flex-row items-center justify-between overflow-hidden"
            onClick={() => {
              setIsEditing(true)
            }}
            type="button"
          >
            <Label
              className="block truncate py-2.5 text-left font-semibold data-[status=completed]:line-through"
              data-status={todo.status}
            >
              {todo.content}
            </Label>

            <span className="ml-2 hidden shrink-0 group-hover:inline">
              <Pencil size={14} />
            </span>
          </button>
        )}
      </div>

      <Button
        disabled={isDeletingTodo}
        onClick={() => {
          deleteTodo(todo.id)
        }}
        size="icon"
        variant="destructive"
      >
        {isDeletingTodo ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Trash2 size={20} />
        )}
      </Button>
    </div>
  )
}
