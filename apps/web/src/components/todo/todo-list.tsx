import { useQuery } from '@tanstack/react-query'
import { todoListOptions } from '~/lib/queries/todos.queries'
import { Loader } from '../ui/loader'
import { TodoItem } from './todo-item'

export const TodoList = () => {
	const { data: todos, isLoading, isSuccess } = useQuery(todoListOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!isSuccess || todos.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{todos.map((todo) => (
				<TodoItem key={todo.id} todo={todo} />
			))}
		</div>
	)
}
