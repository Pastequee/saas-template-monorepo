import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { RegisterForm } from '~/components/routes/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export const Route = createFileRoute('/_auth/register')({
	component: RegisterPage,
})

function RegisterPage() {
	return (
		<Card className="w-md max-w-[90vw]">
			<CardHeader>
				<CardTitle>Créer un compte</CardTitle>
				<CardDescription>Créez un compte pour publier vos annonces.</CardDescription>
			</CardHeader>
			<CardContent>
				<RegisterForm />

				<p className="mt-4 flex flex-wrap justify-center gap-1 text-muted-foreground text-sm">
					Déjà un compte?{' '}
					<Link className="flex items-center gap-1 text-primary" search to="/login">
						Se connecter <ArrowRight size={14} />
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
