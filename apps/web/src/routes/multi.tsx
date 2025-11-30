import { createFileRoute } from '@tanstack/react-router'
import { MultiStepForm } from '~/components/multi-step-demo/multi'
import { Card } from '~/components/ui/card'

export const Route = createFileRoute('/multi')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background">
			<Card className="w-[90%] max-w-[500px]">
				<MultiStepForm />
			</Card>
		</div>
	)
}
