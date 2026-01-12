import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '~/components/navigation/footer'
import { Navbar } from '~/components/navigation/navbar'
import { TodoListCard } from '~/components/routes/todo/todo-list-card'

export const Route = createFileRoute('/')({
	component: Home,
})

function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<TodoListCard />
			</main>
			<Footer />
		</div>
	)
}
