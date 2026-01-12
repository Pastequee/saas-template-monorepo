import { Card, CardContent } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { AddTodoForm } from './add-todo-form'
import { TodoList } from './todo-list'

export const TodoListCard = () => (
	<Card className="mx-auto w-[90vw] max-w-md">
		<CardContent className="flex flex-col gap-4">
			<LoggedOut>
				<h1 className="text-center text-xl">You must be logged in to add a todo</h1>
			</LoggedOut>
			<AddTodoForm />
			<LoggedIn>
				<Separator className="last:hidden" />
				<TodoList />
			</LoggedIn>
		</CardContent>
	</Card>
)
