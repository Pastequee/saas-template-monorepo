import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { LoginForm } from '~/components/routes/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export const Route = createFileRoute('/_auth/login')({
	component: LoginPageComponent,
})

function LoginPageComponent() {
	return (
		<Card className="w-md max-w-[calc(100vw-2rem)]">
			<CardHeader>
				<CardTitle>Connexion</CardTitle>
				<CardDescription>Connectez-vous pour accéder à vos annonces.</CardDescription>
			</CardHeader>
			<CardContent>
				<LoginForm />
				<p className="mt-4 flex flex-wrap justify-center gap-1 text-muted-foreground text-sm">
					Pas encore de compte?{' '}
					<Link className="flex items-center gap-1 text-primary" search to="/register">
						Créer un compte <ArrowRight size={14} />
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
