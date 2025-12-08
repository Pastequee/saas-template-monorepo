import { useState } from 'react'
import { useEdenMutation } from '~/lib/clients/eden-client'
import { useAuth } from '~/lib/hooks/use-auth'
import { createTodoOptions } from '~/lib/mutations/todos.mutations'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Loader } from '../ui/loader'

export const AddTodoForm = () => {
	const [newTodo, setNewTodo] = useState('')

	const auth = useAuth()

	const { isPending: isCreatingTodo, mutate: createTodoMutation } = useEdenMutation(
		createTodoOptions()
	)

	const addTodo = () => {
		createTodoMutation(
			{ content: newTodo, status: 'pending' },
			{
				onSuccess: () => {
					setNewTodo('')
				},
			}
		)
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
				disabled={!auth}
				onChange={(e) => {
					setNewTodo(e.target.value)
				}}
				placeholder="Add a new todo"
				value={newTodo}
			/>
			<Button disabled={!auth || isCreatingTodo || newTodo.length === 0} type="submit">
				Add
				{isCreatingTodo && <Loader />}
			</Button>
		</form>
	)
}
