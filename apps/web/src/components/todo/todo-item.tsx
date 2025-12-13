import { useMutation } from '@tanstack/react-query'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { deleteTodoOptions, updateTodoOptions } from '~/lib/mutations/todos.mutations'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

type TodoItemProps = {
	todo: { id: string; content: string; status: 'completed' | 'pending' }
}

export const TodoItem = ({ todo }: TodoItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const { isPending: isDeletingTodo, mutate: deleteTodoMutation } = useMutation(
		deleteTodoOptions(todo.id)
	)

	const { isPending: isUpdatingTodo, mutate: updateTodoMutation } = useMutation(
		updateTodoOptions(todo.id)
	)

	const updateTodo = (data: { content?: string; status?: 'completed' | 'pending' }) => {
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
					checked={todo.status === 'completed'}
					disabled={isUpdatingTodo}
					onCheckedChange={() => {
						updateTodo({
							status: todo.status === 'completed' ? 'pending' : 'completed',
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
					deleteTodo()
				}}
				size="icon"
				variant="destructive"
			>
				{isDeletingTodo ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
			</Button>
		</div>
	)
}
