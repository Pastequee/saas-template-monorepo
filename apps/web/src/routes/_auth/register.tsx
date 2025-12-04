import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { RegisterForm } from '~/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export const Route = createFileRoute('/_auth/register')({
	component: RegisterPage,
})

function RegisterPage() {
	return (
		<Card className="w-md max-w-[90vw]">
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>
					We are happy that you want to join us. Please fill in the form below to create your
					account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RegisterForm />

				<p className="mt-4 flex flex-wrap justify-center gap-1 text-muted-foreground text-sm">
					Already have an account?{' '}
					<Link className="flex items-center gap-1 text-primary" to="/login">
						Sign in <ArrowRight size={14} />
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
